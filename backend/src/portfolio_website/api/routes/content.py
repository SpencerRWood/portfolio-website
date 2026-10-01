"""Read-only API for repository-authored editorial content."""

from typing import Literal

from fastapi import APIRouter, HTTPException, status

from portfolio_website.content.loader import (
    ContentLoader,
    load_footer_navigation,
    load_homepage,
    load_site_content,
    load_site_navigation,
    load_site_page,
)
from portfolio_website.content.models import (
    ContentPage,
    ContentSection,
    FooterNavigation,
    Homepage,
    NavigationItem,
    SiteNavigationItem,
    SitePage,
)

router = APIRouter()


def pages_for(section: ContentSection) -> list[ContentPage]:
    """Return a deterministic section index."""
    return [page for page in load_site_content() if page.section == section]


@router.get("/navigation")
def read_navigation() -> list[SiteNavigationItem]:
    """Return stable global navigation authored in site content."""
    return load_site_navigation()


@router.get("/footer-navigation")
def read_footer_navigation() -> FooterNavigation:
    """Return the footer navigation authored in its reusable partial."""
    return load_footer_navigation()


@router.get("/areas/navigation")
def read_area_navigation() -> list[NavigationItem]:
    """Return area index navigation derived from content metadata."""
    return ContentLoader().navigation()


@router.get("/site/homepage")
def read_homepage() -> Homepage:
    """Return editorial copy for the public homepage."""
    return load_homepage()


@router.get("/site/{slug}")
def read_site_page(
    slug: Literal["areas", "blog", "projects", "contact", "about"],
) -> SitePage:
    """Return one authored stable page such as the Areas index introduction."""
    return load_site_page(slug)


@router.get("/areas")
def read_areas() -> list[ContentPage]:
    """Return all area pages."""
    return pages_for("areas")


@router.get("/blog")
def read_blog() -> list[ContentPage]:
    """Return all blog entries."""
    return pages_for("blog")


@router.get("/projects")
def read_projects() -> list[ContentPage]:
    """Return all projects."""
    return pages_for("projects")


@router.get("/{section}/{slug}")
def read_content_page(
    section: Literal["areas", "blog", "projects"], slug: str
) -> ContentPage:
    """Return a single page without exposing content filesystem details."""
    for page in pages_for(section):
        if page.slug == slug:
            return page
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Content page was not found.",
    )
