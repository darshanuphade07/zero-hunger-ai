from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal, init_db
from .models import HistoryRecord
from .routes import weather, irrigation, soil, crop_health, dashboard, chat, history
from .routes.history import seed_demo_history

# Guarantee tables are created on import
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    # Automatically seed initial sample farm observations if database is empty
    db = SessionLocal()
    try:
        seed_demo_history(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-agent precision agriculture system for sustainable smallholder farming.",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard.router)
app.include_router(weather.router)
app.include_router(irrigation.router)
app.include_router(soil.router)
app.include_router(crop_health.router)
app.include_router(chat.router)
app.include_router(history.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "database": "sqlite_connected"
    }
