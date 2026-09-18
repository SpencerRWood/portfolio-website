"""Typed models for repository-authored editorial content."""

from dataclasses import dataclass
from datetime import date
from typing import Literal

ContentSection = Literal["topics", "writing", "projects"]


@dataclass(frozen=True)
class ContentPage:
    """A rendered page and the metadata needed to index it."""

    title: str
    slug: str
    section: ContentSection
    summary: str
    body_html: str
    order: int = 0
    topics: tuple[str, ...] = ()
    nav: bool = False
    featured: bool = False
    published: date | None = None
    repository: str | None = None


@dataclass(frozen=True)
class Topic(ContentPage):
    """A topic index entry."""


@dataclass(frozen=True)
class WritingEntry(ContentPage):
    """A writing index entry."""


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
