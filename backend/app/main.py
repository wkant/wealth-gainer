from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine
from app.routes import health

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Wealth Gainer backend", env=settings.app_env)
    yield
    await engine.dispose()
    logger.info("Wealth Gainer backend shut down")


app = FastAPI(
    title="Wealth Gainer API",
    version="0.1.0",
    description="Personal AI-powered hedge fund",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
