from pydantic import BaseModel
from typing import List

from app.schemas.product_schema import ProductResponse


class CategoryBase(BaseModel):
    name: str
    position: int | None = None


class CategoryCreate(CategoryBase):
    restaurant_id: int


class CategoryResponse(CategoryBase):
    id: int
    restaurant_id: int
    products: List[ProductResponse] = []

    class Config:
        from_attributes = True