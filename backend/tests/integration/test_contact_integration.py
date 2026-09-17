import pytest
from fastapi.testclient import TestClient

from portfolio_website.api.routes import contact
from portfolio_website.config import Environment, Settings
from portfolio_website.main import create_app
from portfolio_website.services.contact import ContactPersistenceError


def client() -> TestClient:
    settings = Settings(
        environment=Environment.DEVELOPMENT,
        database_url="postgresql://unused/contact",
        wood_data_platform_database_url=None,
    )
    return TestClient(create_app(settings))


def test_contact_submission_returns_explicit_success(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(contact, "persist_contact_submission", lambda **_: 12)

    response = client().post(
        "/contact", json={"name": "Ada", "email": "ada@example.com", "message": "Hello"}
    )

    assert response.status_code == 201
    assert response.json() == {"id": 12, "status": "accepted"}


def test_contact_submission_rejects_invalid_input() -> None:
    response = client().post(
        "/contact", json={"name": " ", "email": "not-an-email", "message": " "}
    )

    assert response.status_code == 422


def test_contact_submission_does_not_report_success_after_persistence_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail(**_: object) -> int:
        raise ContactPersistenceError("database down")

    monkeypatch.setattr(contact, "persist_contact_submission", fail)

    response = client().post(
        "/contact", json={"name": "Ada", "email": "ada@example.com", "message": "Hello"}
    )

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "Contact submission could not be saved. Please try again later."
    )
