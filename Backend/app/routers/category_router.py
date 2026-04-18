# app/routers/category_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas import category_schema
from app.services import category_service
from app.core.dependencies import get_db, get_current_restaurant
from app import models

# Mantenemos el prefijo con barra para evitar ambigüedades
router = APIRouter(prefix="/categories", tags=["categories"])

@router.post("/", response_model=category_schema.CategoryResponse)
def create_category(
    category_in: category_schema.CategoryBase,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    # Usamos model_dump para Pydantic v2
    data = category_in.model_dump()
    data["restaurant_id"] = restaurant.id
    return category_service.CategoryService.create_category(db, category_schema.CategoryCreate(**data))

@router.get("/", response_model=list[category_schema.CategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    cats = category_service.CategoryService.list_categories_for_restaurant(db, restaurant.id)
    return cats

# Agregamos la barra final / al ID para evitar el 307 Redirect
@router.put("/{category_id}/", response_model=category_schema.CategoryResponse)
def update_category(
    category_id: int,
    updates: category_schema.CategoryBase,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    category = category_service.CategoryService.get_category(db, category_id)
    if not category or category.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    return category_service.CategoryService.update_category(
        db, 
        category, 
        updates.model_dump(exclude_unset=True)
    )

@router.delete("/{category_id}/")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    restaurant: models.Restaurant = Depends(get_current_restaurant),
):
    category = category_service.CategoryService.get_category(db, category_id)
    if not category or category.restaurant_id != restaurant.id:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    category_service.CategoryService.delete_category(db, category)
    return {"ok": True}
