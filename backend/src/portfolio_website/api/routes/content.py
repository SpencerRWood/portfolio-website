"""Read-only API for repository-authored editorial content."""

from typing import Literal

from fastapi import APIRouter, HTTPException, status

from portfolio_website.content.loader import ContentLoader, load_site_content
from portfolio_website.content.models import ContentPage, ContentSection, NavigationItem

router = APIRouter()


def pages_for(section: ContentSection) -> list[ContentPage]:
    """Return a deterministic section index."""
    return [page for page in load_site_content() if page.section == section]


@router.get("/navigation")
def read_navigation() -> list[NavigationItem]:
    """Return content pages that opt into section navigation."""
    return ContentLoader().navigation()


@router.get("/topics")
def read_topics() -> list[ContentPage]:
    """Return all topic pages."""
    return pages_for("topics")


@router.get("/writing")
def read_writing() -> list[ContentPage]:
    """Return all writing entries."""
    return pages_for("writing")


@router.get("/projects")
def read_projects() -> list[ContentPage]:
    """Return all projects."""
    return pages_for("projects")


@router.get("/{section}/{slug}")
def read_content_page(
    section: Literal["topics", "writing", "projects"], slug: str
) -> ContentPage:
    """Return a single page without exposing content filesystem details."""
    for page in pages_for(section):
        if page.slug == slug:
            return page
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Content page was not found.",
    )
