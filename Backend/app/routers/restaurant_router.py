# app/routers/restaurant_router.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from sqlalchemy.orm import Session

from app.schemas import restaurant_schema
from app.services import restaurant_service
from app.core.dependencies import get_db, get_current_restaurant, get_current_user
from app.utils import image_upload
from app import models

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.post("/", response_model=restaurant_schema.RestaurantResponse)
def create_restaurant(
    restaurant_in: restaurant_schema.RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Restaurant).filter(models.Restaurant.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already has a restaurant")
    return restaurant_service.RestaurantService.create_restaurant(db, restaurant_in, user_id=current_user.id)


@router.get("/me", response_model=restaurant_schema.RestaurantResponse)
def read_my_restaurant(restaurant: models.Restaurant = Depends(get_current_restaurant)):
    return restaurant


@router.put("/me", response_model=restaurant_schema.RestaurantResponse)
def update_my_restaurant(
    name:        str           = Form(...),
    description: Optional[str] = Form(None),
    address:     Optional[str] = Form(None),
    phone:       Optional[str] = Form(None),
    instagram:   Optional[str] = Form(None),
    facebook:    Optional[str] = Form(None),
    tiktok:      Optional[str] = Form(None),
    schedule:    Optional[str] = Form(None),
    maps_url:    Optional[str] = Form(None),
    logo:        Optional[UploadFile] = File(None),
    banner:      Optional[UploadFile] = File(None),
    restaurant:  models.Restaurant = Depends(get_current_restaurant),
    db:          Session = Depends(get_db),
):
    updates = {
        "name":        name,
        "description": description,
        "address":     address,
        "phone":       phone,
        "instagram":   instagram,
        "facebook":    facebook,
        "tiktok":      tiktok,
        "schedule":    schedule,
        "maps_url":    maps_url,
    }

    if logo and logo.filename:
        urls = image_upload.handle_product_images([logo])
        updates["logo"] = urls[0]

    if banner and banner.filename:
        urls = image_upload.handle_product_images([banner])
        updates["banner"] = urls[0]

    return restaurant_service.RestaurantService.update_restaurant(db, restaurant, updates)


@router.patch("/me/theme", response_model=restaurant_schema.RestaurantResponse)
def update_my_theme(
    theme:      restaurant_schema.RestaurantThemeUpdate,
    restaurant: models.Restaurant = Depends(get_current_restaurant),
    db:         Session = Depends(get_db),
):
    updates = theme.model_dump(exclude_none=True)
    return restaurant_service.RestaurantService.update_restaurant(db, restaurant, updates)


@router.get("/me/qr")
def get_my_qr(restaurant: models.Restaurant = Depends(get_current_restaurant)):
    from app.utils import qr_generator
    menu_url = f"http://localhost:3000/menu/{restaurant.slug}"
    qr_local = qr_generator.generate_qr(menu_url, restaurant.slug)
    qr_url   = f"http://localhost:8000/{qr_local}"
    return {"menu_url": menu_url, "qr_path": qr_url}