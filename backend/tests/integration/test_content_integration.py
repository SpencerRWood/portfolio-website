from fastapi.testclient import TestClient

from portfolio_website.config import Environment, Settings
from portfolio_website.main import create_app


def client() -> TestClient:
    settings = Settings(
        environment=Environment.DEVELOPMENT,
        database_url=None,
        wood_data_platform_database_url=None,
    )
    return TestClient(create_app(settings))


def test_content_indexes_and_page_are_exposed() -> None:
    topic_response = client().get("/content/topics")
    writing_response = client().get("/content/writing")
    project_response = client().get("/content/projects")
    page_response = client().get("/content/topics/data-modeling")

    assert topic_response.status_code == 200
    assert [item["slug"] for item in topic_response.json()] == [
        "data-generation",
        "data-collection",
        "data-modeling",
        "analytics",
        "machine-learning",
        "communication",
    ]
    assert writing_response.status_code == 200
    assert project_response.status_code == 200
    assert page_response.status_code == 200
    assert page_response.json()["title"] == "Data Modeling"


def test_content_navigation_and_missing_page_responses() -> None:
    navigation_response = client().get("/content/navigation")
    missing_response = client().get("/content/topics/not-a-page")

    assert navigation_response.status_code == 200
    assert [item["slug"] for item in navigation_response.json()] == [
        "data-generation",
        "data-collection",
        "data-modeling",
        "analytics",
        "machine-learning",
        "communication",
    ]
    assert missing_response.status_code == 404
