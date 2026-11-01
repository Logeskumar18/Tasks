from pathlib import Path

import pandas as pd
import pytesseract
from img2table.document import Image, PDF
from img2table.ocr import TesseractOCR


def _configure_tesseract() -> None:
    executable = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    if executable.exists():
        pytesseract.pytesseract.tesseract_cmd = str(executable)


def _extract_with_options(document, ocr: TesseractOCR, *, psm: int):
    ocr.psm = psm
    return document.extract_tables(
        ocr=ocr,
        # These options are important for tables with faint/missing grid lines.
        implicit_rows=True,
        implicit_columns=True,
        borderless_tables=True,
        min_confidence=50,
        max_workers=1,
    )


def _normalize_table(table) -> list[list[str]]:
    frame = table.df if isinstance(table.df, pd.DataFrame) else pd.DataFrame(table.df)
    if frame.empty:
        return []

    # Keep the rectangular shape: empty cells are meaningful positions in a
    # table and must not be removed before exporting it.
    frame = frame.fillna("").astype(str)
    frame = frame.replace({"None": ""})
    return frame.values.tolist()


def extract_tables(file_path: str) -> list[list[list[str]]]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError("Document file not found")

    _configure_tesseract()
    ocr = TesseractOCR(n_threads=1, lang="eng")
    document = PDF(src=str(path)) if path.suffix.lower() == ".pdf" else Image(src=str(path))

    # PSM 11 is better for sparse text and borderless tables. If no table is
    # detected, PSM 6 provides a useful fallback for dense grid layouts.
    extracted_tables = _extract_with_options(document, ocr, psm=11)
    if not extracted_tables:
        extracted_tables = _extract_with_options(document, ocr, psm=6)

    return [
        normalized
        for table in extracted_tables
        if (normalized := _normalize_table(table))
    ]


def extract_tables_from_image(file_path: str) -> list[list[list[str]]]:
    if Path(file_path).suffix.lower() == ".pdf":
        raise ValueError("Expected an image file")
    return extract_tables(file_path)
