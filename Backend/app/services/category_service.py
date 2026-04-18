from sqlalchemy.orm import Session
from app import models
from app.schemas import category_schema


class CategoryService:
    @staticmethod
    def create_category(db: Session, category_in: category_schema.CategoryCreate) -> models.Category:
        category = models.Category(**category_in.dict())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def update_category(db: Session, category: models.Category, updates: dict) -> models.Category:
        for key, value in updates.items():
            setattr(category, key, value)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete_category(db: Session, category: models.Category):
        db.delete(category)
        db.commit()

    @staticmethod
    def get_category(db: Session, category_id: int) -> models.Category | None:
        return db.query(models.Category).get(category_id)

    @staticmethod
    def list_categories_for_restaurant(db: Session, restaurant_id: int):
        from sqlalchemy.orm import joinedload
        return (
            db.query(models.Category)
            .options(joinedload(models.Category.products).joinedload(models.Product.images))
            .filter(models.Category.restaurant_id == restaurant_id)
            .all()
        )
