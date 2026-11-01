from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TableDataUpdate(BaseModel):
    data: list[list[str]] = Field(min_length=1)


class ExtractedTableResponse(BaseModel):
    id: int
    table_number: int
    data: list[list[str]]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
