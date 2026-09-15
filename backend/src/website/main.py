"""Application factory for the FastAPI backend."""

from fastapi import FastAPI

from website.api.router import api_router
from website.config import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create the FastAPI application."""
    runtime_settings = settings or Settings.from_environment()
    app = FastAPI(title="website")
    app.state.settings = runtime_settings
    app.include_router(api_router)
    return app


app = create_app()
