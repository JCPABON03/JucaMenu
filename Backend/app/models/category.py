from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Category(Base):

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    name = Column(String, nullable=False)

    position = Column(Integer)

    restaurant = relationship("Restaurant", back_populates="categories")

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")