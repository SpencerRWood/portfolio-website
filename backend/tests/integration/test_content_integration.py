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
    area_response = client().get("/content/topics")
    blog_response = client().get("/content/blog")
    project_response = client().get("/content/projects")
    page_response = client().get("/content/topics/data-modeling")

    assert area_response.status_code == 200
    assert [item["slug"] for item in area_response.json()] == [
        "data-generation",
        "data-collection",
        "data-modeling",
        "analytics",
        "machine-learning",
        "communication",
        "systems-infrastructure",
    ]
    assert blog_response.status_code == 200
    assert project_response.status_code == 200
    assert page_response.status_code == 200
    assert page_response.json()["title"] == "Data Modeling"
    assert page_response.json()["group"] == "Analytics"
    assert "areas" in page_response.json()
    assert "Data Generation" in {
        item["title"] for item in blog_response.json()[0]["related_content"]
    }


def test_retired_content_routes_are_unavailable() -> None:
    retired_section = "areas"
    for path in (
        f"/content/{retired_section}",
        f"/content/{retired_section}/navigation",
        f"/content/{retired_section}/data-modeling",
        f"/content/site/{retired_section}",
    ):
        assert client().get(path).status_code in {404, 422}


def test_api_exposes_derived_relationships_in_indexes_and_details() -> None:
    area = client().get("/content/topics/analytics").json()
    project = client().get("/content/projects/wood-charts").json()
    writing = (
        client().get("/content/blog/building-reusable-analytical-reporting").json()
    )
    assert {item["section"] for item in area["related_content"]} == {"blog", "projects"}
    assert any(item["slug"] == "wood-charts" for item in area["related_content"])
    for page in (project, writing):
        assert {item["slug"] for item in page["related_content"]} == set(page["areas"])
        assert all(item["section"] == "areas" for item in page["related_content"])
        assert all("body_html" not in item for item in page["related_content"])
    index = client().get("/content/projects").json()
    assert next(item for item in index if item["slug"] == project["slug"]) == project


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


def test_public_route_mapping_preserves_internal_area_metadata() -> None:
    response = client().get("/content/topics/analytics")
    assert response.status_code == 200
    assert response.json()["section"] == "areas"
    assert client().get("/content/site/topics").json()["slug"] == "areas"
    navigation = client().get("/content/topics/navigation")
    assert navigation.status_code == 200
    assert all(item["section"] == "areas" for item in navigation.json())
