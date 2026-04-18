from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from sqlalchemy.orm import Session

from app.schemas import product_schema
from app.services import product_service
from app.core.dependencies import get_db, get_current_restaurant
from app import models
from app.utils import image_upload

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=product_schema.ProductResponse)
def create_product(
    name: str = Form(...),
    price: float = Form(...),
    category_id: int = Form(...),
    description: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    # ensure category belongs to restaurant
    cat = db.query(models.Category).filter(models.Category.id == category_id, models.Category.restaurant_id == restaurant.id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid category")
    product = product_service.ProductService.create_product(db, restaurant.id, category_id, name, description, price)
    # handle files (limit to 2)
    if files:
        if len(files) > 2:
            raise HTTPException(status_code=400, detail="Maximum 2 images allowed")
        urls = image_upload.handle_product_images(files)
        for u in urls:
            product_service.ProductService.add_image(db, product, u)
    return product


@router.get("/", response_model=List[product_schema.ProductResponse])
def list_products(
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    return product_service.ProductService.list_products_for_restaurant(db, restaurant.id)


@router.get("/{product_id}", response_model=product_schema.ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    product = product_service.ProductService.get_product(db, product_id)
    if not product or product.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=product_schema.ProductResponse)
def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    product = product_service.ProductService.get_product(db, product_id)
    if not product or product.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = {}
    if name is not None:
        updates["name"] = name
    if price is not None:
        updates["price"] = price
    if description is not None:
        updates["description"] = description
    if category_id is not None:
        # verify category
        cat = db.query(models.Category).filter(models.Category.id == category_id, models.Category.restaurant_id == restaurant.id).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category")
        updates["category_id"] = category_id
    updated = product_service.ProductService.update_product(db, product, updates)
    if files:
        if len(product.images) + len(files) > 2:
            raise HTTPException(status_code=400, detail="Maximum 2 images allowed in total")
        urls = image_upload.handle_product_images(files)
        for u in urls:
            product_service.ProductService.add_image(db, updated, u)
    return updated


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    product = product_service.ProductService.get_product(db, product_id)
    if not product or product.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Product not found")
    product_service.ProductService.delete_product(db, product)
    return {"ok": True}


@router.delete("/images/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    img = db.query(models.ProductImage).get(image_id)
    if not img or img.product.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Image not found")
    product_service.ProductService.remove_image(db, img)
    return {"ok": True}
