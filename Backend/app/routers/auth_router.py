from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.config import Config
from starlette.responses import JSONResponse

from app.schemas import user_schema
from app.services import auth_service
from app.services.google_auth import oauth
from app.core.dependencies import get_db, get_current_user
from app import models
import logging

router = APIRouter(prefix="/auth", tags=["auth"])

CONFIG = Config()  # used by authlib


@router.post("/register", response_model=user_schema.UserResponse)


def register(user_in: user_schema.UserCreate, db: Session = Depends(get_db)):
    # log the attempt (do NOT log the password)
    logging.info("register attempt for %s", user_in.email)
    # ensure we have a password for manual registration
    if not user_in.password:
        raise HTTPException(status_code=400, detail="Password is required for registration")
    # ensure email is unique
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    try:
        created = auth_service.AuthService.create_user(db, user_in)
        logging.info("user created: %s", created.email)
        return created
    except HTTPException:
        raise
    except Exception:
        logging.exception("unexpected error during registration")
        raise HTTPException(status_code=500, detail="internal server error")


@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_service.AuthService.create_access_token_for_user(user)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/google")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = oauth.google.parse_id_token(request, token)
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to obtain user info from Google")
    # user_info contains sub, email, name, picture, etc.
    user = auth_service.AuthService.get_or_create_google_user(
        db,
        email=user_info.get("email"),
        name=user_info.get("name") or user_info.get("email"),
        google_id=user_info.get("sub"),
    )
    jwt = auth_service.AuthService.create_access_token_for_user(user)
    frontend = CONFIG("FRONTEND_URL", default="http://localhost:3000")
    # instead of redirecting with query parameters, return a small HTML page
    # that contains the token in JSON and stores it in localStorage before
    # navigating to the dashboard. the frontend can safely consume this as a
    # JSON-like payload.
    from fastapi.responses import HTMLResponse
    import json

    safe_token = json.dumps(jwt)
    html = f"""<!DOCTYPE html>
<html>
  <head><meta charset=\"utf-8\"></head>
  <body>
    <script>
      const token = {safe_token};
      localStorage.setItem('access_token', token);
      window.location.href = '{frontend}/dashboard';
    </script>
    <p>Logging in…</p>
  </body>
</html>"""
    return HTMLResponse(html)


@router.get("/me", response_model=user_schema.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user
