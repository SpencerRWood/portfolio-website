"""Top-level API router."""

from fastapi import APIRouter

from portfolio_website.api.routes.contact import router as contact_router
from portfolio_website.api.routes.content import router as content_router
from portfolio_website.api.routes.health import router as health_router

api_router = APIRouter()
api_router.include_router(contact_router, prefix="/contact", tags=["contact"])
api_router.include_router(content_router, prefix="/content", tags=["content"])
api_router.include_router(health_router, prefix="/health", tags=["health"])
