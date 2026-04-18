from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Product(Base):

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=True)

    name = Column(String, nullable=False)

    description = Column(String)

    price = Column(Float, nullable=False)

    available = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="products")

    category = relationship("Category", back_populates="products")

    images = relationship("ProductImage", back_populates="product")