"""Production serving contract for the built frontend."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from portfolio_website.config import Environment, Settings
from portfolio_website.production import create_production_app


def test_production_serves_api_and_frontend_with_runtime_config(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    assets = tmp_path / "assets"
    assets.mkdir()
    (assets / "app.js").write_text("console.log('ready')", encoding="utf-8")
    (tmp_path / "index.html").write_text(
        "<html><head></head><body><div id='root'></div></body></html>",
        encoding="utf-8",
    )
    monkeypatch.setenv("RUDDERSTACK_WRITE_KEY", "public-key")
    monkeypatch.setenv("RUDDERSTACK_DATA_PLANE_URL", "https://example.com")
    settings = Settings(Environment.DEVELOPMENT, None, None)
    client = TestClient(create_production_app(settings, tmp_path))

    assert client.get("/health").json() == {"status": "ok"}
    page = client.get("/blog/example")
    assert page.status_code == 200
    assert page.headers["cache-control"] == "no-store"
    assert '"rudderstackWriteKey": "public-key"' in page.text
    assert client.get("/assets/app.js").text == "console.log('ready')"
    assert client.get("/missing.js").status_code == 404
