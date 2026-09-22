"""Serve the built frontend and API from one production process."""

import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from portfolio_website.config import Settings
from portfolio_website.main import create_app


def create_production_app(
    settings: Settings | None = None, assets_dir: Path | None = None
) -> FastAPI:
    """Attach the built React assets to the existing FastAPI application."""
    app = create_app(settings)
    frontend_dir = assets_dir or Path(
        os.environ.get("PORTFOLIO_FRONTEND_DIR", "/app/frontend/dist")
    )
    app.mount(
        "/assets", StaticFiles(directory=frontend_dir / "assets", check_dir=False)
    )

    @app.get("/{path:path}", include_in_schema=False)
    def frontend_page(path: str) -> HTMLResponse:
        if path.startswith(("api/", "content/", "health/")) or "." in path:
            raise HTTPException(status_code=404)
        index_file = frontend_dir / "index.html"
        if not index_file.is_file():
            raise HTTPException(status_code=503, detail="Frontend is unavailable.")
        runtime_config = {
            "apiBaseUrl": "",
            "rudderstackWriteKey": os.environ.get("RUDDERSTACK_WRITE_KEY", ""),
            "rudderstackDataPlaneUrl": os.environ.get("RUDDERSTACK_DATA_PLANE_URL", ""),
        }
        script = (
            "<script>window.__PORTFOLIO_CONFIG__="
            + json.dumps(runtime_config).replace("<", "\\u003c")
            + ";</script>"
        )
        html = index_file.read_text(encoding="utf-8").replace(
            "</head>", f"{script}</head>", 1
        )
        return HTMLResponse(html, headers={"Cache-Control": "no-store"})

    return app


app = create_production_app()
