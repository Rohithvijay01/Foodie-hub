import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

# Middleware and dependencies
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import models  # noqa: F401
from app.api.router import api_router
from app.core.config import settings

# Exception handlers
from app.core.exception_handlers import setup_exception_handlers
from app.core.logger import setup_logging
from app.core.middleware.logging_middleware import CorrelationIDMiddleware
from app.core.middleware.rate_limiter import RedisRateLimiterMiddleware
from app.core.session import check_db_connection, check_redis_connection, init_db, init_redis
from app.models.base import Base


# Setup Logging
setup_logging()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info(f"Starting up {settings.PROJECT_NAME}..")
    if settings.AUTO_CREATE_TABLES:
        logger.warning("AUTO_CREATE_TABLES is enabled; creating tables from SQLAlchemy metadata")
        await init_db(Base.metadata)
        
        # Seed default terms and conditions if not present
        from app.core.session import AsyncSessionLocal
        from app.repositories.terms_and_conditions_repository import TermsAndConditionsRepository
        try:
            async with AsyncSessionLocal() as session:
                repo = TermsAndConditionsRepository(session)
                active_terms = await repo.get_active_terms()
                if not active_terms:
                    logger.info("No active terms and conditions found. Seeding default terms.")
                    await repo.create_terms(
                        "Welcome to Foodie Hub! By using this platform, you agree to our terms and conditions. "
                        "Please treat delivery partners and mess operators with respect."
                    )
                    await session.commit()
        except Exception as e:
            logger.error(f"Error seeding default terms and conditions: {e}")
    redis_client = await init_redis(settings.REDIS_URL)
    app.state.redis = redis_client
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}..")
    if getattr(app.state, "redis", None) is not None:
        await app.state.redis.aclose()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.add_middleware(CorrelationIDMiddleware)
app.add_middleware(RedisRateLimiterMiddleware)

setup_exception_handlers(app)

# Include API and WebSocket routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["System"])
async def health_check() -> dict[str, str]:
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "db": "connected" if await check_db_connection() else "disconnected",
        "redis": "connected" if await check_redis_connection(app=app) else "disconnected",
    }


os.makedirs("static", exist_ok=True)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
# trigger reload
