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
    blog_response = client().get("/content/blog")
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
    assert blog_response.status_code == 200
    assert project_response.status_code == 200
    assert page_response.status_code == 200
    assert page_response.json()["title"] == "Data Modeling"
    assert "Data Generation" in blog_response.json()[0]["body_html"]


def test_content_navigation_and_missing_page_responses() -> None:
    navigation_response = client().get("/content/navigation")
    footer_navigation_response = client().get("/content/footer-navigation")
    site_page_response = client().get("/content/site/topics")
    missing_response = client().get("/content/topics/not-a-page")
    retired_writing_response = client().get("/content/writing")

    assert navigation_response.status_code == 200
    assert footer_navigation_response.status_code == 200
    assert footer_navigation_response.json()["items"][0] == {
        "title": "Blog",
        "destination": "/blog",
        "order": 1,
    }
    assert navigation_response.json() == [
        {"title": "Topics", "destination": "/topics", "order": 1},
        {"title": "Blog", "destination": "/blog", "order": 2},
        {"title": "Projects", "destination": "/projects", "order": 3},
        {"title": "Contact", "destination": "/contact", "order": 4},
        {"title": "About", "destination": "/about", "order": 5},
    ]
    assert site_page_response.status_code == 200
    assert site_page_response.json()["title"] == "Topics"
    assert missing_response.status_code == 404
    assert retired_writing_response.status_code == 404
