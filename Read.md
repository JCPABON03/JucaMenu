# JucaMenu

Proyecto que permite a restaurantes crear y gestionar menús digitales con generación de QR.

## Backend (FastAPI)

1. Crea un entorno virtual e instala dependencias:

```powershell
cd Backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
```

> Nota: `requirements.txt` incluye `pydantic[email]` para manejar validación de correos.
>
> Para el hashing de contraseñas ya no se utiliza `passlib`; el backend llama
> directamente a la librería `bcrypt` para evitar un bug en la detección del
> backend que hacía fallar cualquier intento de crear hashes. Solo se requiere
> que el paquete `bcrypt` (por ejemplo `bcrypt>=4.0.1`) esté instalado.
>
> La versión actual en PyPI es **5.0.0**, la cual no expone el submódulo
> `__about__`. Paslib incorporaba un chequeo que producía un mensaje de
> advertencia `(trapped) error reading bcrypt version`, pero ese warning ya no
> aparece y en cualquier caso se silencia mediante configuración de logging.
>
> Si más adelante aparece una versión nueva con `__about__`, basta con
> actualizar:
>
> ```powershell
> pip install --upgrade bcrypt
> ```
>
> Además, recuerda que bcrypt sólo admite contraseñas de hasta 72 bytes; la API
> rechazará con 400 si se supera ese límite.

2. La aplicación utiliza PostgreSQL por defecto; ajusta `DATABASE_URL` en el entorno con tu conexión local (por ejemplo `postgresql://user:password@localhost/jucamenu`). Si prefieres SQLite para pruebas rápidas, también puedes establecer `DATABASE_URL` apuntando a `sqlite:///./jucamenu.db`.
3. Ejecuta las migraciones (o permite que SQLAlchemy cree las tablas):

```powershell
uvicorn app.main:app --reload
```

4. La API queda disponible en `http://localhost:8000`.
   - Documentación automática: `http://localhost:8000/docs`

## Frontend (React + Vite)

1. Instala Node.js (preferiblemente v18 o superior) y luego descarga las dependencias:

```bash
cd Frontend
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm run dev
```


3. La aplicación estará en `http://localhost:3000`. El proxy está configurado para redirigir `/api` y `/static` al backend.

4. La aplicación estará en `http://localhost:3000`. El proxy está configurado para redirigir `/api` y `/static` al backend.

## Flujo básico

1. Regístrate como propietario de restaurante (`/register`).
2. En el panel (`/dashboard`) crea tu restaurante en el perfil.
3. Agrega categorías y productos.
4. Consulta la URL pública del menú o descarga el QR en el perfil.
5. El cliente escanea el QR y visita `/menu/:slug` para ver el menú.

---

