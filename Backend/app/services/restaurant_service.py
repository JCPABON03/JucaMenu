from sqlalchemy.orm import Session
from app import models
from app.schemas import restaurant_schema


class RestaurantService:
    @staticmethod
    def create_restaurant(db: Session, restaurant_in: restaurant_schema.RestaurantCreate, user_id: int) -> models.Restaurant:
        # generate unique slug from name
        base = restaurant_in.name.lower().strip().replace(" ", "-")
        slug = base
        counter = 1
        while db.query(models.Restaurant).filter(models.Restaurant.slug == slug).first():
            slug = f"{base}-{counter}"
            counter += 1
        restaurant = models.Restaurant(**restaurant_in.dict(), user_id=user_id, slug=slug)
        db.add(restaurant)
        db.commit()
        db.refresh(restaurant)
        return restaurant

    @staticmethod
    def update_restaurant(db: Session, restaurant: models.Restaurant, updates: dict) -> models.Restaurant:
        for key, value in updates.items():
            setattr(restaurant, key, value)
        db.commit()
        db.refresh(restaurant)
        return restaurant

    @staticmethod
    def get_restaurant_by_slug(db: Session, slug: str) -> models.Restaurant | None:
        return db.query(models.Restaurant).filter(models.Restaurant.slug == slug).first()

    @staticmethod
    def get_restaurant(db: Session, restaurant_id: int) -> models.Restaurant | None:
        return db.query(models.Restaurant).get(restaurant_id)
