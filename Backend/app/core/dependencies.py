from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app import models, core, database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_db() -> Generator[Session, None, None]:
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = core.security.decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if not user:
        raise credentials_exception
    return user


def get_current_restaurant(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)) -> models.Restaurant:
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.user_id == user.id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant
