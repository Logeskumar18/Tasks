
from app.database import Base, engine
from app.models import User, Document, ExtractedTable

try:
    Base.metadata.create_all(bind=engine)
    print("All database tables created successfully!")

except Exception as error:
    print("Table creation failed:", error)
