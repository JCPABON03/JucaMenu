from pydantic import BaseModel
from datetime import datetime

class ProductImageBase(BaseModel):
    image_url: str


class ProductImageCreate(ProductImageBase):
    product_id: int


class ProductImageResponse(ProductImageBase):
    id: int

    class Config:
        from_attributes = True


# product models for CRUD
class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: float
    available: bool | None = True


class ProductCreate(ProductBase):
    restaurant_id: int
    category_id: int


class ProductResponse(ProductBase):
    id: int
    restaurant_id: int
    category_id: int | None = None 
    created_at: datetime
    images: list[ProductImageResponse] = []

    class Config:
        from_attributes = True