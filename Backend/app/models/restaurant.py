from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Restaurant(Base):

    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    description = Column(String)
    address = Column(String)
    phone = Column(String)
    logo = Column(String)
    banner      = Column(String)  
    maps_url    = Column(String)  
    instagram = Column(String)
    facebook = Column(String)
    tiktok = Column(String)
    schedule = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ← Tema del menú
    theme_primary = Column(String, default='#faf6f0')
    theme_accent  = Column(String, default='#c8860a')
    theme_text    = Column(String, default='#1a1209')
    theme_card    = Column(String, default='#ffffff')

    owner = relationship("User", back_populates="restaurants")
    categories = relationship("Category", back_populates="restaurant")
    products = relationship("Product", back_populates="restaurant")