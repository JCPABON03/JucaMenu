from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=True)

    google_id = Column(String, nullable=True)

    name = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    restaurants = relationship("Restaurant", back_populates="owner")