"""Discovery and validation for Jinja2-backed Markdown content."""

from collections.abc import Iterable
from datetime import date
from pathlib import Path
from typing import Any

from portfolio_website.content.models import (
    ContentPage,
    ContentSection,
    NavigationItem,
    Project,
    Topic,
    WritingEntry,
)
from portfolio_website.content.renderer import render_document, render_markdown

CONTENT_SECTIONS: tuple[ContentSection, ...] = ("topics", "writing", "projects")
CONTENT_ROOT = Path(__file__).parent


class ContentError(ValueError):
    """Raised when repository content cannot be safely indexed."""


def _parse_scalar(value: str) -> str | bool | int:
    normalized = value.strip()
    if normalized in {"true", "false"}:
        return normalized == "true"
    if normalized.isdigit():
        return int(normalized)
    return normalized.strip("\"'")


def parse_front_matter(source: str, source_path: Path) -> tuple[dict[str, Any], str]:
    """Parse the small YAML subset supported by content front matter."""
    if not source.startswith("---\n"):
        raise ContentError(f"{source_path}: front matter must start with ---.")
    try:
        _, raw_metadata, body = source.split("---\n", 2)
    except ValueError as error:
        raise ContentError(
            f"{source_path}: front matter must have a closing ---."
        ) from error

    metadata: dict[str, Any] = {}
    active_list: str | None = None
    for raw_line in raw_metadata.splitlines():
        if not raw_line.strip():
            continue
        if raw_line.startswith("  - "):
            if active_list is None:
                raise ContentError(f"{source_path}: list item has no metadata key.")
            metadata[active_list].append(raw_line.removeprefix("  - ").strip())
            continue
        key, separator, raw_value = raw_line.partition(":")
        if not separator or not key:
            raise ContentError(
                f"{source_path}: invalid front matter line: {raw_line!r}."
            )
        active_list = key.strip()
        value = raw_value.strip()
        metadata[active_list] = [] if not value else _parse_scalar(value)
    return metadata, body


def _required_string(metadata: dict[str, Any], field: str, path: Path) -> str:
    value = metadata.get(field)
    if not isinstance(value, str) or not value:
        raise ContentError(f"{path}: {field} must be a non-empty string.")
    return value


def _optional_bool(metadata: dict[str, Any], field: str, path: Path) -> bool:
    value = metadata.get(field, False)
    if not isinstance(value, bool):
        raise ContentError(f"{path}: {field} must be true or false.")
    return value


def _optional_topics(metadata: dict[str, Any], path: Path) -> tuple[str, ...]:
    value = metadata.get("topics", [])
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ContentError(f"{path}: topics must be a list of slugs.")
    return tuple(value)


def _page_type(section: ContentSection) -> type[ContentPage]:
    return {"topics": Topic, "writing": WritingEntry, "projects": Project}[section]


class ContentLoader:
    """Load all supported content files from a content root."""

    def __init__(self, content_root: Path = CONTENT_ROOT) -> None:
        self.content_root = content_root

    def discover(self) -> list[ContentPage]:
        """Discover, validate, render, and deterministically sort all pages."""
        pages = [
            self._load_path(path, section)
            for section in CONTENT_SECTIONS
            for path in sorted((self.content_root / section).glob("*.md.j2"))
        ]
        self._validate_unique_slugs(pages)
        return sorted(pages, key=lambda page: (page.section, page.order, page.title))

    def navigation(self) -> list[NavigationItem]:
        """Return topic navigation derived from pages that opt into it."""
        return [
            NavigationItem(page.title, page.slug, page.section, page.order)
            for page in self.discover()
            if page.nav
        ]

    def _load_path(self, path: Path, expected_section: ContentSection) -> ContentPage:
        metadata, markdown_source = parse_front_matter(
            path.read_text(encoding="utf-8"), path
        )
        section = _required_string(metadata, "section", path)
        if section not in CONTENT_SECTIONS:
            raise ContentError(f"{path}: section must be one of {CONTENT_SECTIONS}.")
        typed_section: ContentSection = section
        if typed_section != expected_section:
            raise ContentError(f"{path}: section does not match its directory.")
        order = metadata.get("order", 0)
        if not isinstance(order, int):
            raise ContentError(f"{path}: order must be an integer.")
        published_value = metadata.get("published")
        try:
            published = date.fromisoformat(published_value) if published_value else None
        except (TypeError, ValueError) as error:
            raise ContentError(f"{path}: published must be an ISO date.") from error
        repository = metadata.get("repository")
        if repository is not None and not isinstance(repository, str):
            raise ContentError(f"{path}: repository must be a string.")
        page_type = _page_type(typed_section)
        return page_type(
            title=_required_string(metadata, "title", path),
            slug=_required_string(metadata, "slug", path),
            section=typed_section,
            summary=_required_string(metadata, "summary", path),
            body_html=render_markdown(
                render_document(markdown_source, self.content_root)
            ),
            order=order,
            topics=_optional_topics(metadata, path),
            nav=_optional_bool(metadata, "nav", path),
            featured=_optional_bool(metadata, "featured", path),
            published=published,
            repository=repository,
        )

    @staticmethod
    def _validate_unique_slugs(pages: Iterable[ContentPage]) -> None:
        seen: set[str] = set()
        for page in pages:
            if page.slug in seen:
                raise ContentError(f"Duplicate content slug: {page.slug}.")
            seen.add(page.slug)


def load_site_content() -> list[ContentPage]:
    """Load the repository's production editorial content."""
    return ContentLoader().discover()
