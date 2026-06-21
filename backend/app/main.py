import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.middleware import RateLimitMiddleware
from app.routers import auth, assessment, carbon, ai, challenges

# Configure Logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ecomind")

app = FastAPI(
    title="EcoMind AI API",
    description="Backend API powering the EcoMind AI Carbon Footprint Awareness platform, integrated with Vertex AI.",
    version="1.0.0"
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting for AI endpoints
app.add_middleware(RateLimitMiddleware, requests_per_minute=20)

# Register Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(assessment.router, prefix="/api/v1")
app.include_router(carbon.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(challenges.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "EcoMind AI Backend API",
        "version": "1.0.0",
        "health": "healthy"
    }

logger.info("EcoMind AI FastAPI Backend successfully initialized.")
