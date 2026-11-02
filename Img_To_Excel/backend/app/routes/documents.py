from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pymupdf
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from PIL import Image, UnidentifiedImageError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.document import Document
from app.models.extracted_table import ExtractedTable
from app.schemas.document import DocumentResponse
from app.schemas.table import ExtractedTableResponse, TableDataUpdate
from app.services.ocr_service import extract_tables, tables_to_csv, tables_to_xlsx
from app.models.user import User
from app.utils.dependencies import get_current_user


router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".webp": "image",
}


def _owned_document(document_id: int, db: Session, current_user: User) -> Document:
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    return document


def _document_file_path(document: Document) -> Path:
    file_path = (UPLOAD_DIR.parent / document.file_path).resolve()
    if UPLOAD_DIR.resolve() not in file_path.parents:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored document path is invalid",
        )
    return file_path


def validate_image(file_bytes: bytes) -> None:
    try:
        with Image.open(BytesIO(file_bytes)) as image:
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                raise HTTPException(
                    status_code=400,
                    detail="Unsupported image format",
                )
            image.verify()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image",
        )


def validate_pdf(file_bytes: bytes) -> None:
    if not file_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted PDF",
        )

    try:
        document = pymupdf.open(stream=file_bytes, filetype="pdf")
        document.close()
    except (pymupdf.FileDataError, RuntimeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted PDF",
        )


@router.post("/upload", status_code=201)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    original_name = Path(file.filename or "").name
    if not original_name:
        raise HTTPException(
            status_code=400,
            detail="Filename is required",
        )

    extension = Path(original_name).suffix.lower()
    if extension not in {*ALLOWED_IMAGE_TYPES, ".pdf"}:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, WEBP and PDF files are allowed",
        )

    file_bytes = file.file.read(MAX_FILE_SIZE + 1)
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty file is not allowed",
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Maximum file size is 10 MB",
        )

    if extension == ".pdf":
        validate_pdf(file_bytes)
        file_type = "pdf"
    else:
        validate_image(file_bytes)
        file_type = "image"

    user_upload_dir = UPLOAD_DIR / str(current_user.id)
    user_upload_dir.mkdir(parents=True, exist_ok=True)
    generated_name = f"{uuid4().hex}{extension}"
    destination = user_upload_dir / generated_name
    relative_path = destination.relative_to(UPLOAD_DIR.parent)

    try:
        destination.write_bytes(file_bytes)
        tables = extract_tables(str(destination))
        document = Document(
            user_id=current_user.id,
            filename=original_name,
            file_path=str(relative_path),
            file_type=file_type,
            status="extracted" if tables else "no_tables",
        )
        db.add(document)
        db.flush()
        for table_number, data in enumerate(tables, start=1):
            db.add(
                ExtractedTable(
                    document_id=document.id,
                    table_number=table_number,
                    data=data,
                )
            )
        db.commit()
        db.refresh(document)
    except (OSError, RuntimeError, TypeError, ValueError) as error:
        db.rollback()
        if destination.exists():
            destination.unlink()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Table extraction failed: {error}",
        )
    except SQLAlchemyError:
        db.rollback()
        if destination.exists():
            destination.unlink()
        raise HTTPException(
            status_code=500,
            detail="Document upload failed",
        )

    return {
        "message": "Document uploaded successfully",
        "document_id": document.id,
        "filename": document.filename,
        "file_type": document.file_type,
        "status": document.status,
        "tables_detected": len(tables),
    }


@router.get("/", response_model=list[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _owned_document(document_id, db, current_user)


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _owned_document(document_id, db, current_user)
    file_path = _document_file_path(document)

    try:
        db.delete(document)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete document",
        )

    try:
        if file_path.exists():
            file_path.unlink()
    except OSError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document record deleted, but file cleanup failed",
        )

    return {
        "message": "Document deleted successfully",
        "document_id": document_id,
    }


@router.post("/{document_id}/extract")
def extract_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _owned_document(document_id, db, current_user)
    file_path = _document_file_path(document)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found",
        )

    try:
        tables = extract_tables(str(file_path))
    except (OSError, RuntimeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Table extraction failed: {error}",
        )

    try:
        db.query(ExtractedTable).filter(
            ExtractedTable.document_id == document.id
        ).delete(synchronize_session=False)
        for table_number, data in enumerate(tables, start=1):
            db.add(
                ExtractedTable(
                    document_id=document.id,
                    table_number=table_number,
                    data=data,
                )
            )
        document.status = "extracted" if tables else "no_tables"
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save extracted tables",
        )

    return {
        "message": "Document extraction completed",
        "document_id": document.id,
        "tables_detected": len(tables),
        "status": document.status,
    }


@router.get(
    "/{document_id}/tables",
    response_model=list[ExtractedTableResponse],
)
def get_document_tables(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _owned_document(document_id, db, current_user)
    return (
        db.query(ExtractedTable)
        .filter(ExtractedTable.document_id == document.id)
        .order_by(ExtractedTable.table_number)
        .all()
    )


@router.put(
    "/{document_id}/tables/{table_id}",
    response_model=ExtractedTableResponse,
)
def update_document_table(
    document_id: int,
    table_id: int,
    payload: TableDataUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _owned_document(document_id, db, current_user)
    table = (
        db.query(ExtractedTable)
        .filter(
            ExtractedTable.id == table_id,
            ExtractedTable.document_id == document.id,
        )
        .first()
    )
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Extracted table not found",
        )

    table.data = payload.data
    try:
        db.commit()
        db.refresh(table)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update extracted table",
        )
    return table


@router.get("/{document_id}/export")
def export_document_tables(
    document_id: int,
    format: str = "xlsx",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = _owned_document(document_id, db, current_user)
    tables = (
        db.query(ExtractedTable)
        .filter(ExtractedTable.document_id == document.id)
        .order_by(ExtractedTable.table_number)
        .all()
    )
    if not tables:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No extracted tables found",
        )
    if format not in {"xlsx", "csv"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format must be xlsx or csv",
        )

    safe_name = Path(document.filename).stem or "document"
    if format == "csv":
        csv_bytes = tables_to_csv(table.data for table in tables)
        return StreamingResponse(
            csv_bytes,
            media_type="text/csv",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}.csv"'
            },
        )

    output = tables_to_xlsx(table.data for table in tables)
    return StreamingResponse(
        output,
        media_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}.xlsx"'
        },
    )
