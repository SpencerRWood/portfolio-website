"""Typed models for repository-authored editorial content."""

from dataclasses import dataclass
from datetime import date
from typing import Literal

ContentSection = Literal["areas", "blog", "projects"]
AreaGroup = Literal["Analytics", "Engineering"]


@dataclass(frozen=True)
class ContentPage:
    """A rendered page and the metadata needed to index it."""

    title: str
    slug: str
    section: ContentSection
    summary: str
    body_html: str
    # ``order`` orders areas/projects and breaks same-date blog publication ties.
    order: int = 0
    areas: tuple[str, ...] = ()
    nav: bool = False
    # ``featured`` is editorial promotion; ``published`` is primary blog chronology.
    featured: bool = False
    published: date | None = None
    repository: str | None = None
    group: AreaGroup | None = None


@dataclass(frozen=True)
class Area(ContentPage):
    """A area index entry."""


@dataclass(frozen=True)
class BlogEntry(ContentPage):
    """A blog index entry."""


@dataclass(frozen=True)
class Project(ContentPage):
    """A project index entry."""


@dataclass(frozen=True)
class NavigationItem:
    """A navigable, content-derived index entry."""

    title: str
    slug: str
    section: ContentSection
    order: int
    group: AreaGroup | None = None


@dataclass(frozen=True)
class SiteNavigationItem:
    """A stable global navigation item authored in site content."""

    title: str
    destination: str
    order: int


@dataclass(frozen=True)
class FooterNavigation:
    """Footer navigation authored in the reusable footer partial."""

    areas_title: str
    items: tuple[SiteNavigationItem, ...]


@dataclass(frozen=True)
class SitePage:
    """A rendered, stable page authored under ``content/site``."""

    title: str
    slug: str
    summary: str
    body_html: str


@dataclass(frozen=True)
class Homepage:
    """Editorial copy for the site homepage shell."""

    identity: str
    hero_eyebrow: str
    title: str
    summary: str
    primary_link_label: str
    primary_link_destination: str
    aside_title: str
    aside_summary: str
    areas_eyebrow: str
    areas_title: str
    areas_summary: str
    blog_eyebrow: str
    blog_title: str
    blog_summary: str
    projects_eyebrow: str
    projects_title: str
    projects_summary: str
    about_eyebrow: str
    about_title: str
    about_summary: str
