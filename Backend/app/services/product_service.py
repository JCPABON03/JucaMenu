from sqlalchemy.orm import Session
from app import models
from app.schemas import product_schema


class ProductService:
    @staticmethod
    def create_product(db: Session, restaurant_id: int, category_id: int, name: str, description: str | None, price: float) -> models.Product:
        product = models.Product(
            restaurant_id=restaurant_id,
            category_id=category_id,
            name=name,
            description=description,
            price=price,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update_product(db: Session, product: models.Product, updates: dict) -> models.Product:
        for key, value in updates.items():
            setattr(product, key, value)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product: models.Product):
        db.delete(product)
        db.commit()

    @staticmethod
    def add_image(db: Session, product: models.Product, image_url: str) -> models.ProductImage:
        pic = models.ProductImage(product_id=product.id, image_url=image_url)
        db.add(pic)
        db.commit()
        db.refresh(pic)
        return pic

    @staticmethod
    def remove_image(db: Session, image: models.ProductImage):
        db.delete(image)
        db.commit()

    @staticmethod
    def list_products_for_restaurant(db: Session, restaurant_id: int):
        from sqlalchemy.orm import joinedload
        return (
            db.query(models.Product)
            .options(joinedload(models.Product.images))
            .filter(models.Product.restaurant_id == restaurant_id)
            .all()
        )

    @staticmethod
    def list_products_for_category(db: Session, category_id: int):
        from sqlalchemy.orm import joinedload
        return (
            db.query(models.Product)
            .options(joinedload(models.Product.images))
            .filter(models.Product.category_id == category_id)
            .all()
        )
    @staticmethod
    def get_product(db: Session, product_id: int):
        return db.query(models.Product).get(product_id)
