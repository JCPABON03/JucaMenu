from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# default to PostgreSQL; override with DATABASE_URL if needed
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:juca0304@localhost/jucamenu",
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()