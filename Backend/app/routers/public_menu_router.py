# app/routers/public_menu_router.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app import models

router = APIRouter(prefix="/menu", tags=["public menu"])

@router.get("/{slug}/") 
def get_public_menu(slug: str, db: Session = Depends(get_db)):
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.slug == slug).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    data = {
        "restaurant": {
            "id":            restaurant.id,
            "name":          restaurant.name,
            "description":   restaurant.description,
            "instagram":     restaurant.instagram,
            "facebook":      restaurant.facebook,
            "tiktok":        restaurant.tiktok,
            "schedule":      restaurant.schedule,
            "maps_url":      restaurant.maps_url,
            "logo":          restaurant.logo,
            "banner":        restaurant.banner,
            "theme_primary": restaurant.theme_primary or '#faf6f0',
            "theme_accent":  restaurant.theme_accent  or '#c8860a',
            "theme_text":    restaurant.theme_text    or '#1a1209',
            "theme_card":    restaurant.theme_card    or '#ffffff',
            "slug":          restaurant.slug,
        },
        "categories": [],
    }

    # --- ORDENAMIENTO SEGURO DE CATEGORÍAS ---
    # Usamos (x.position or 0) para que si es None, use 0 y no crashee el servidor
    categories = sorted(
        restaurant.categories, 
        key=lambda x: (x.position if x.position is not None else 0)
    )

    for cat in categories:
        cat_data = {
            "id": cat.id, 
            "name": cat.name, 
            "position": cat.position or 0, 
            "products": []
        }
        
        # --- ORDENAMIENTO SEGURO DE PRODUCTOS ---
        # Por si en el futuro añades posición a los productos
        products = sorted(
            cat.products,
            key=lambda p: (getattr(p, 'position', 0) if getattr(p, 'position', 0) is not None else 0)
        )

        for prod in products:
            if prod.available:
                prod_data = {
                    "id":          prod.id,
                    "name":        prod.name,
                    "description": prod.description,
                    "price":       prod.price,
                    "available":   prod.available,
                    "images":      [img.image_url for img in prod.images],
                }
                cat_data["products"].append(prod_data)
        
        data["categories"].append(cat_data)

    return data
