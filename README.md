# 🍽️ JucaMenu — Plataforma SaaS de Menús Digitales

> Solución SaaS multi-tenant que permite a restaurantes crear, gestionar y compartir su menú digital mediante código QR — sin necesidad de apps ni conocimientos técnicos.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql)](https://neon.tech/)
[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel)](https://vercel.com/)
[![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://render.com/)

---

## 📌 ¿Qué es JucaMenu?

JucaMenu es una plataforma SaaS orientada a restaurantes que permite:

- **Crear y gestionar** categorías y productos del menú desde un panel de administración
- **Personalizar** la apariencia visual del menú (colores, logo, tema)
- **Subir imágenes** de productos con almacenamiento en la nube via Cloudinary
- **Generar un QR** único por restaurante para que los clientes accedan al menú desde su celular
- **Escalar de forma aislada** gracias a la arquitectura multi-tenant

---

## 🏗️ Arquitectura Multi-Tenant

Cada restaurante registrado en la plataforma opera como un **tenant independiente**: sus datos, configuración visual y menú están completamente aislados del resto. El acceso al menú público se realiza a través de una URL única por tenant.

```
Cliente (QR) → URL pública del restaurante → Frontend React → API FastAPI → PostgreSQL (Neon)
                                                                           ↕
                                                                      Cloudinary (imágenes)
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Base de datos | PostgreSQL — [Neon](https://neon.tech/) |
| Almacenamiento | Cloudinary |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |

---

## 🚀 Funcionalidades principales

- ✅ Registro y autenticación de restaurantes
- ✅ Panel de administración para gestión de menú
- ✅ Creación de categorías y productos con imagen
- ✅ Personalización del tema visual por tenant
- ✅ Menú público accesible por QR sin necesidad de login
- ✅ Almacenamiento de imágenes optimizado en Cloudinary
- ✅ API RESTful documentada con Swagger (`/docs`)

---

## 📁 Estructura del Proyecto

```
JucaMenu/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles
│   ├── hooks/
├── backend/           # FastAPI
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── core/      # Configuración, seguridad
│   ├── Stacic/
└── README.md
```

> ⚠️ Ajusta esta estructura si tu repo está organizado de forma diferente.

---

## ⚙️ Instalación local

### Requisitos previos

- Python 3.11+
- Node.js 18+
- PostgreSQL o cuenta en [Neon](https://neon.tech/)
- Cuenta en [Cloudinary](https://cloudinary.com/)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crea un archivo `.env`:

```env
DATABASE_URL=postgresql://usuario:password@host/db
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SECRET_KEY=tu_clave_secreta
```

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Crea un archivo `.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🌐 Demo en producción

> 🔗 [juca-menu.vercel.app/login](https://juca-menu.vercel.app/login)

---

## 👤 Autor

**Juan Carlos Pabón Jaimes**
Estudiante de Ingeniería de Sistemas — Universidad de Pamplona

[![GitHub](https://img.shields.io/badge/GitHub-JCPABON03-181717?style=flat&logo=github)](https://github.com/JCPABON03)
[![Portfolio](https://img.shields.io/badge/Portfolio-Ver%20sitio-0A66C2?style=flat&logo=vercel)](https://portafolio-juan-carlos-pabon.vercel.app/)

