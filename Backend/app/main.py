from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import logging

from app.database import Base, engine
from app.routers import auth_router, restaurant_router, category_router, product_router, public_menu_router

app = FastAPI(
    title="JucaMenu API",
    redirect_slashes=True
)

# ── 1. Middlewares ──────────────────────────────────────────

# Middleware para forzar HTTPS (Útil para Railway)
class GlobalHTTPSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request.scope["scheme"] = "https"
        response = await call_next(request)
        return response

app.add_middleware(GlobalHTTPSMiddleware)

# CONFIGURACIÓN DE CORS
# Mantenemos origins para local y producción fija
origins = [
    "https://juca-menu.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # El regex es la clave para las URLs dinámicas de Vercel
    allow_origin_regex=r"https://juca-menu-.*\.vercel\.app", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ── 2. Routers ─────────────────────────────────────────────
app.include_router(auth_router.router,       prefix="/api")
app.include_router(restaurant_router.router,  prefix="/api")
app.include_router(category_router.router,    prefix="/api")
app.include_router(product_router.router,     prefix="/api")
app.include_router(public_menu_router.router, prefix="/api")

# ── 3. Static files ────────────────────────────────────────
# Asegúrate de que la carpeta 'static' exista en la raíz para evitar errores al arrancar
import os
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

# ── 4. Base de datos ───────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── 5. Startup ─────────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    # Simplificamos la verificación de bcrypt
    try:
        import bcrypt
        logging.info("Bcrypt verificado correctamente")
    except ImportError:
        logging.error("Bcrypt no está instalado")
