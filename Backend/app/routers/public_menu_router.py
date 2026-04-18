# app/routers/public_menu_router.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app import models

# Mantenemos el prefijo /menu
router = APIRouter(prefix="/menu", tags=["public menu"])

# SOLUCIÓN: Agregamos la barra final '/' para evitar el 307 Redirect
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
            "slug":          restaurant.slug, # Útil tener el slug a mano
        },
        "categories": [],
    }

    # Ordenar categorías por posición si tienes ese campo
    categories = sorted(restaurant.categories, key=lambda x: x.position if hasattr(x, 'position') else 0)

    for cat in categories:
        cat_data = {"id": cat.id, "name": cat.name, "position": cat.position, "products": []}
        for prod in cat.products:
            # Solo mostrar productos si están disponibles (opcional pero recomendado para menú público)
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
