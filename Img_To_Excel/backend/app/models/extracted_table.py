from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, func
from app.database import Base


class ExtractedTable(Base):
    __tablename__ = "extracted_tables"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(
        Integer,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    table_number = Column(Integer, nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(
        DateTime,
        server_default=func.current_timestamp(),
        nullable=False,
    )
