from datetime import timedelta
from sqlalchemy.orm import Session

from app import models, core
from app.schemas import user_schema


class AuthService:
    @staticmethod
    def create_user(db: Session, user_in: user_schema.UserCreate) -> models.User:
        hashed_password = None
        if user_in.password:
            hashed_password = core.security.get_password_hash(user_in.password)
        user = models.User(
            email=user_in.email,
            name=user_in.name,
            password_hash=hashed_password,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_or_create_google_user(db: Session, email: str, name: str, google_id: str) -> models.User:
        # try to find by google_id first
        user = db.query(models.User).filter(models.User.google_id == google_id).first()
        if user:
            return user
        # if not, maybe find by email and attach google_id
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
            return user
        # else create new user without password
        user = models.User(email=email, name=name, google_id=google_id)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> models.User | None:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user or not user.password_hash:
            return None
        if not core.security.verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def create_access_token_for_user(user: models.User) -> str:
        data = {"sub": str(user.id)}
        # expire in ACCESS_TOKEN_EXPIRE_MINUTES
        return core.security.create_access_token(data=data)
