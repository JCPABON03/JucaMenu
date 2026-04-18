from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import category_schema
from app.services import category_service
from app.core.dependencies import get_db, get_current_restaurant
from app import models

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=category_schema.CategoryResponse)
def create_category(
    category_in: category_schema.CategoryBase,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    # ignore any restaurant_id provided by client; use the authenticated restaurant
    data = category_in.dict()
    data["restaurant_id"] = restaurant.id
    return category_service.CategoryService.create_category(db, category_schema.CategoryCreate(**data))


@router.get("/", response_model=list[category_schema.CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    cats = category_service.CategoryService.list_categories_for_restaurant(db, restaurant.id)
    # pydantic will handle nested products by relationship
    return cats


@router.put("/{category_id}", response_model=category_schema.CategoryResponse)
def update_category(
    category_id: int,
    updates: category_schema.CategoryBase,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    category = category_service.CategoryService.get_category(db, category_id)
    if not category or category.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Category not found")
    return category_service.CategoryService.update_category(db, category, updates.dict(exclude_unset=True))


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    category = category_service.CategoryService.get_category(db, category_id)
    if not category or category.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Category not found")
    category_service.CategoryService.delete_category(db, category)
    return {"ok": True}
