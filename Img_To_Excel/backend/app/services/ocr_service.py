from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO, StringIO
from pathlib import Path
from typing import Iterable

import cv2
import pandas as pd
import pytesseract
from img2table.document import Image, PDF
from img2table.ocr import TesseractOCR
from pytesseract import Output


@dataclass(frozen=True)
class OCRToken:
    text: str
    left: int
    top: int
    width: int
    height: int
    confidence: float

    @property
    def center_x(self) -> float:
        return self.left + self.width / 2

    @property
    def center_y(self) -> float:
        return self.top + self.height / 2


@dataclass(frozen=True)
class TableQuality:
    noise_ratio: float
    alignment_score: float
    fractured_row_ratio: float
    score: float
    low_quality: bool
    reasons: tuple[str, ...]


def _configure_tesseract() -> None:
    executable = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    if executable.exists():
        pytesseract.pytesseract.tesseract_cmd = str(executable)


def _extract_with_options(document, ocr: TesseractOCR, *, psm: int):
    ocr.psm = psm
    return document.extract_tables(
        ocr=ocr,
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
    frame = frame.fillna("").astype(str).replace({"None": ""})
    return frame.values.tolist()


def _cell_is_noise(value: str) -> bool:
    value = " ".join(value.split())
    if not value:
        return False
    if len(value) == 1 and not value.isalnum():
        return True
    if any(character in value for character in "�|¦"):
        return True
    if len(value) <= 3 and any(character.isdigit() for character in value):
        return any(character.isalpha() for character in value) and not value.isdigit()
    if (
        any(character.isupper() for character in value)
        and any(character.islower() for character in value)
        and any(not character.isalnum() for character in value)
        and not any(character.isdigit() for character in value)
    ):
        return True
    alphanumeric = sum(character.isalnum() for character in value)
    punctuation = sum(not character.isalnum() and not character.isspace() for character in value)
    return alphanumeric == 0 or punctuation > alphanumeric


def assess_table_quality(table: list[list[str]]) -> TableQuality:
    """Assess normalized img2table output before it reaches the API/export layer."""
    if not table:
        return TableQuality(1, 0, 1, 0, True, ("empty table",))

    width = max(len(row) for row in table)
    cells = [cell.strip() for row in table for cell in row]
    non_empty = [cell for cell in cells if cell]
    noise_ratio = (
        sum(_cell_is_noise(cell) for cell in non_empty) / len(non_empty)
        if non_empty
        else 1
    )

    populated_widths = [sum(bool(cell.strip()) for cell in row) for row in table]
    expected_width = max(set(populated_widths), key=populated_widths.count)
    alignment_score = sum(
        1 for row in populated_widths if row in {expected_width, width}
    ) / len(populated_widths)
    padded_rows = [row + [""] * (width - len(row)) for row in table]
    numeric_columns = [
        column
        for column in range(width)
        if sum(bool(row[column]) and any(char.isdigit() for char in row[column])
               for row in padded_rows) >= max(2, len(padded_rows) // 2)
    ]
    numeric_bleeds = sum(
        bool(row[column])
        and any(char.isdigit() for char in row[column])
        and any(char.isalpha() for char in row[column])
        for row in padded_rows
        for column in numeric_columns
    )
    numeric_cells = sum(bool(row[column]) for row in padded_rows for column in numeric_columns)
    if numeric_cells:
        alignment_score *= max(0, 1 - numeric_bleeds / numeric_cells)

    fractured_rows = sum(
        populated == 0 or populated < max(1, expected_width // 2)
        for populated in populated_widths
    )
    fractured_row_ratio = fractured_rows / len(table)

    reasons: list[str] = []
    if noise_ratio > 0.25:
        reasons.append("ocr noise exceeds 25%")
    if alignment_score < 0.7:
        reasons.append("column alignment is inconsistent")
    if fractured_row_ratio > 0.25:
        reasons.append("too many empty or fractured rows")

    score = (
        (1 - noise_ratio) * 0.45
        + alignment_score * 0.35
        + (1 - fractured_row_ratio) * 0.20
    )
    return TableQuality(
        noise_ratio=noise_ratio,
        alignment_score=alignment_score,
        fractured_row_ratio=fractured_row_ratio,
        score=score,
        low_quality=bool(reasons),
        reasons=tuple(reasons),
    )


def _remove_table_lines(image):
    adaptive = cv2.adaptiveThreshold(
        image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 9
    )
    horizontal = cv2.morphologyEx(
        adaptive,
        cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_RECT, (max(40, image.shape[1] // 8), 1)),
    )
    vertical = cv2.morphologyEx(
        adaptive,
        cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(40, image.shape[0] // 8))),
    )
    lines = cv2.dilate(
        cv2.bitwise_or(horizontal, vertical),
        cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)),
    )
    return cv2.inpaint(image, lines, 3, cv2.INPAINT_TELEA)


def _read_tokens(image, *, scale: int = 1) -> tuple[list[OCRToken], object]:
    if scale > 1:
        image = cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    data = pytesseract.image_to_data(image, config="--psm 6", output_type=Output.DICT)
    tokens: list[OCRToken] = []
    for index, raw_text in enumerate(data["text"]):
        text = " ".join(raw_text.split())
        try:
            confidence = float(data["conf"][index])
        except (TypeError, ValueError):
            continue
        if not text or confidence < 15:
            continue
        tokens.append(
            OCRToken(
                text=text,
                left=int(data["left"][index]),
                top=int(data["top"][index]),
                width=int(data["width"][index]),
                height=int(data["height"][index]),
                confidence=confidence,
            )
        )
    return tokens, image


def _cluster_rows(tokens: list[OCRToken], image_height: int) -> list[list[OCRToken]]:
    tolerance = max(8, image_height // 70)
    rows: list[list[OCRToken]] = []
    for token in sorted(tokens, key=lambda item: (item.center_y, item.left)):
        row = next(
            (candidate for candidate in reversed(rows)
             if abs(token.center_y - candidate[0].center_y) <= tolerance),
            None,
        )
        if row is None:
            rows.append([token])
        else:
            row.append(token)
    return [sorted(row, key=lambda item: item.left) for row in rows]


def _line_groups(values: list[int], gap: int) -> list[int]:
    groups: list[list[int]] = []
    for value in sorted(values):
        if not groups or value - groups[-1][-1] > gap:
            groups.append([value])
        else:
            groups[-1].append(value)
    return [round(sum(group) / len(group)) for group in groups]


def _column_boundaries(image) -> list[int]:
    binary = cv2.adaptiveThreshold(
        image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 9
    )
    vertical = cv2.morphologyEx(
        binary,
        cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(40, image.shape[0] // 8))),
    )
    projection = (vertical > 0).sum(axis=0)
    positions = [int(value) for value in (projection > image.shape[0] * 0.25).nonzero()[0]]
    return _line_groups(positions, 4)


def _group_tokens_into_columns(rows: list[list[OCRToken]], image, original_width: int) -> list[list[str]]:
    boundaries = _column_boundaries(image)
    if len(boundaries) < 2:
        centers = sorted(token.center_x for row in rows for token in row)
        anchors = _line_groups([round(center) for center in centers], max(30, original_width // 12))
        boundaries = [0] + [
            round((left + right) / 2) for left, right in zip(anchors, anchors[1:])
        ] + [original_width]
    else:
        boundaries = [0] + boundaries + [image.shape[1]]

    result: list[list[str]] = []
    for row in rows:
        cells = [""] * (len(boundaries) - 1)
        for token in row:
            column = next(
                (index for index, (left, right) in enumerate(zip(boundaries, boundaries[1:]))
                 if left <= token.center_x < right),
                len(cells) - 1,
            )
            cells[column] = f"{cells[column]} {token.text}".strip()
        if any(cells):
            result.append(cells)
    return result


def _fallback_ocr_table(file_path: str) -> list[list[str]]:
    image = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        return []
    variants = [
        (image, 1),
        (cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1], 1),
        (_remove_table_lines(image), 3),
    ]
    candidates: list[list[list[str]]] = []
    for variant, scale in variants:
        tokens, prepared = _read_tokens(variant, scale=scale)
        rows = _cluster_rows(tokens, prepared.shape[0])
        candidates.append(_group_tokens_into_columns(rows, prepared, image.shape[1] * scale))
    return max(candidates, key=lambda table: assess_table_quality(table).score, default=[])


def _fallback_dispatch(file_path: str, raw_tables: list[list[list[str]]]) -> list[list[list[str]]]:
    fallback = _fallback_ocr_table(file_path)
    if not raw_tables:
        return [fallback] if fallback else []
    raw = max(raw_tables, key=lambda table: assess_table_quality(table).score)
    raw_quality = assess_table_quality(raw)
    fallback_quality = assess_table_quality(fallback)
    if raw_quality.low_quality and fallback and fallback_quality.score >= raw_quality.score:
        return [fallback]
    return [raw]


def extract_tables(file_path: str) -> list[list[list[str]]]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError("Document file not found")

    _configure_tesseract()
    ocr = TesseractOCR(n_threads=1, lang="eng")
    document = PDF(src=str(path)) if path.suffix.lower() == ".pdf" else Image(src=str(path))
    extracted = _extract_with_options(document, ocr, psm=11)
    if not extracted:
        extracted = _extract_with_options(document, ocr, psm=6)
    raw_tables = [
        normalized for table in extracted if (normalized := _normalize_table(table))
    ]
    if path.suffix.lower() == ".pdf":
        return raw_tables
    return _fallback_dispatch(str(path), raw_tables)


def extract_tables_from_image(file_path: str) -> list[list[list[str]]]:
    if Path(file_path).suffix.lower() == ".pdf":
        raise ValueError("Expected an image file")
    return extract_tables(file_path)


def tables_to_csv(tables: Iterable[Iterable[Iterable[str]]]) -> BytesIO:
    output = StringIO()
    frames = [pd.DataFrame(table) for table in tables]
    if frames:
        pd.concat(frames, ignore_index=True).to_csv(
            output, index=False, header=False, encoding="utf-8-sig"
        )
    return BytesIO(output.getvalue().encode("utf-8-sig"))


def tables_to_xlsx(tables: Iterable[Iterable[Iterable[str]]]) -> BytesIO:
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        for number, table in enumerate(tables, start=1):
            pd.DataFrame(table).to_excel(
                writer, sheet_name=f"Table {number}"[:31], index=False, header=False
            )
    output.seek(0)
    return output
