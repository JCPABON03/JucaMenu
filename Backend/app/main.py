from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import auth_router
from app.routers import restaurant_router
from app.routers import category_router
from app.routers import product_router
from app.routers import public_menu_router

app = FastAPI(
    title="JucaMenu API"
)

# ── 1. Middleware ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 2. Routers ─────────────────────────────────────────────
app.include_router(auth_router.router,        prefix="/api")
app.include_router(restaurant_router.router,  prefix="/api")
app.include_router(category_router.router,    prefix="/api")
app.include_router(product_router.router,     prefix="/api")
app.include_router(public_menu_router.router, prefix="/api")

# ── 3. Static files ────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── 4. Base de datos ───────────────────────────────────────
Base.metadata.create_all(bind=engine)


# ── 5. Startup ─────────────────────────────────────────────
@app.on_event("startup")
def verify_bcrypt():
    """Ensure we can read the bcrypt package version."""
    try:
        import bcrypt
        try:
            ver = bcrypt.__about__.__version__
        except AttributeError:
            ver = getattr(bcrypt, "__version__", None)
        if not ver:
            raise AttributeError("no version attribute found")
        import logging
        logging.info(f"bcrypt version {ver} detected")
    except Exception:
        import logging
        logging.warning(
            "unable to determine bcrypt version; ensure bcrypt>=5.1.0 is installed",
        )