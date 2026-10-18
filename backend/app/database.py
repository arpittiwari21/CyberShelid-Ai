import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Database path in the backend folder
DB_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(DB_DIR, ".."))
DB_PATH = os.path.join(BACKEND_DIR, "cybershield.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy import text

def init_db():
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE scan_history ADD COLUMN user_id INTEGER"))
            conn.commit()
        except Exception:
            pass  # column already exists or table is fresh

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
