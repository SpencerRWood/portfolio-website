"""Discovery and validation for Jinja2-backed Markdown content."""

import re
from collections.abc import Iterable
from dataclasses import replace
from datetime import date
from pathlib import Path
from typing import Any

from portfolio_website.content.models import (
    Area,
    AreaGroup,
    BlogEntry,
    ContentPage,
    ContentReference,
    ContentSection,
    FooterNavigation,
    Homepage,
    NavigationItem,
    Project,
    SiteNavigationItem,
    SitePage,
)
from portfolio_website.content.renderer import render_document, render_markdown

CONTENT_SECTIONS: tuple[ContentSection, ...] = ("areas", "blog", "projects")
CONTENT_ROOT = Path(__file__).parent
SLUG_PATTERN = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")


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


def _required_slug(metadata: dict[str, Any], path: Path) -> str:
    slug = _required_string(metadata, "slug", path)
    if not SLUG_PATTERN.fullmatch(slug):
        raise ContentError(f"{path}: slug must use lowercase kebab-case.")
    return slug


def _optional_bool(metadata: dict[str, Any], field: str, path: Path) -> bool:
    value = metadata.get(field, False)
    if not isinstance(value, bool):
        raise ContentError(f"{path}: {field} must be true or false.")
    return value


def _optional_areas(metadata: dict[str, Any], path: Path) -> tuple[str, ...]:
    value = metadata.get("areas", [])
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ContentError(f"{path}: areas must be a list of slugs.")
    return tuple(value)


def _page_type(section: ContentSection) -> type[ContentPage]:
    return {"areas": Area, "blog": BlogEntry, "projects": Project}[section]


class ContentLoader:
    """Load all supported content files from a content root."""

    def __init__(self, content_root: Path = CONTENT_ROOT) -> None:
        self.content_root = content_root

    def discover(self) -> list[ContentPage]:
        """Discover, validate, render, and deterministically sort all pages."""
        documents = [
            (path, section, *parse_front_matter(path.read_text(encoding="utf-8"), path))
            for section in CONTENT_SECTIONS
            for path in sorted((self.content_root / section).glob("*.md.j2"))
        ]
        pages = [
            self._page_from_metadata(path, section, metadata)
            for path, section, metadata, _ in documents
        ]
        self._validate_unique_slugs(pages)
        self._validate_area_references(pages)
        pages = [
            replace(page, related_content=self._related_content(page, pages))
            for page in pages
        ]
        rendered = [
            replace(
                page,
                body_html=render_markdown(
                    render_document(
                        markdown_source,
                        self.content_root,
                        self._template_context(page),
                    )
                ),
            )
            for page, (_, _, _, markdown_source) in zip(pages, documents, strict=True)
        ]
        return sorted(rendered, key=self._sort_key)

    def navigation(self) -> list[NavigationItem]:
        """Return area navigation derived from pages that opt into it."""
        return [
            NavigationItem(page.title, page.slug, page.section, page.order, page.group)
            for page in self.discover()
            if page.nav
        ]

    def _page_from_metadata(
        self, path: Path, expected_section: ContentSection, metadata: dict[str, Any]
    ) -> ContentPage:
        unknown_fields = metadata.keys() - (
            ContentPage.__dataclass_fields__.keys() - {"body_html", "related_content"}
        )
        if unknown_fields:
            raise ContentError(
                f"{path}: unsupported metadata fields: {sorted(unknown_fields)}."
            )
        section = _required_string(metadata, "section", path)
        if section not in CONTENT_SECTIONS:
            raise ContentError(f"{path}: section must be one of {CONTENT_SECTIONS}.")
        typed_section: ContentSection = section
        if typed_section != expected_section:
            raise ContentError(f"{path}: section does not match its directory.")
        group: AreaGroup | None = None
        if typed_section == "areas":
            group_value = metadata.get("group")
            if not isinstance(group_value, str) or group_value not in {
                "Analytics",
                "Engineering",
            }:
                raise ContentError(f"{path}: group must be Analytics or Engineering.")
            group = "Analytics" if group_value == "Analytics" else "Engineering"
        order = (
            metadata.get("order")
            if typed_section == "areas"
            else metadata.get("order", 0)
        )
        if type(order) is not int:
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
            slug=_required_slug(metadata, path),
            section=typed_section,
            summary=_required_string(metadata, "summary", path),
            body_html="",
            order=order,
            areas=_optional_areas(metadata, path),
            nav=_optional_bool(metadata, "nav", path),
            featured=_optional_bool(metadata, "featured", path),
            published=published,
            repository=repository,
            group=group,
        )

    @staticmethod
    def _template_context(page: ContentPage) -> dict[str, Any]:
        return {
            "page": page,
            "related_content": page.related_content,
        }

    @classmethod
    def _related_content(
        cls, page: ContentPage, pages: list[ContentPage]
    ) -> tuple[ContentReference, ...]:
        related = (
            [
                item
                for item in pages
                if item.section in {"blog", "projects"} and page.slug in item.areas
            ]
            if page.section == "areas"
            else [
                item
                for item in pages
                if item.section == "areas" and item.slug in page.areas
            ]
        )
        return tuple(
            ContentReference(item.title, item.slug, item.section, item.summary)
            for item in sorted(related, key=cls._sort_key)
        )

    @staticmethod
    def _validate_area_references(pages: list[ContentPage]) -> None:
        area_slugs = {page.slug for page in pages if page.section == "areas"}
        for page in pages:
            if page.section == "areas" and page.areas:
                raise ContentError(f"{page.slug}: Area pages cannot declare areas.")
            if len(page.areas) != len(set(page.areas)):
                raise ContentError(f"{page.slug}: duplicate Area references.")
            for slug in page.areas:
                if slug not in area_slugs:
                    raise ContentError(f"{page.slug}: unknown Area reference: {slug}.")

    @staticmethod
    def _sort_key(page: ContentPage) -> tuple[str, int, int, int, str]:
        """Sort blog by published DESC, order ASC, then title; others by order ASC."""
        if page.section == "blog":
            published_rank = page.published.toordinal() if page.published else -1
            return (page.section, 0, -published_rank, page.order, page.title)
        group_rank = 0 if page.group == "Analytics" else 1
        return (page.section, group_rank, 0, page.order, page.title)

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


def _site_metadata(filename: str) -> dict[str, Any]:
    path = CONTENT_ROOT / "site" / filename
    metadata, _ = parse_front_matter(path.read_text(encoding="utf-8"), path)
    return metadata


def load_homepage() -> Homepage:
    """Load the homepage's editorial copy from its content document."""
    metadata = _site_metadata("homepage.md.j2")
    path = CONTENT_ROOT / "site" / "homepage.md.j2"
    return Homepage(
        **{
            field: _required_string(metadata, field, path)
            for field in Homepage.__dataclass_fields__
        }
    )


def load_site_page(slug: str) -> SitePage:
    """Load and render one stable site page without exposing file paths."""
    path = CONTENT_ROOT / "site" / f"{slug}.md.j2"
    if not path.is_file():
        raise ContentError(f"Site page was not found: {slug}.")
    metadata, markdown_source = parse_front_matter(
        path.read_text(encoding="utf-8"), path
    )
    if _required_slug(metadata, path) != slug:
        raise ContentError(f"{path}: slug must match its filename.")
    return SitePage(
        title=_required_string(metadata, "title", path),
        slug=slug,
        summary=_required_string(metadata, "summary", path),
        body_html=render_markdown(render_document(markdown_source, CONTENT_ROOT)),
    )


def load_site_navigation() -> list[SiteNavigationItem]:
    """Load stable global navigation from a compact content list."""
    path = CONTENT_ROOT / "_partials" / "header.md.j2"
    metadata, _ = parse_front_matter(path.read_text(encoding="utf-8"), path)
    return _navigation_items(metadata, path)


def load_footer_navigation() -> FooterNavigation:
    """Load footer navigation and its area-column label from content."""
    path = CONTENT_ROOT / "_partials" / "footer.md.j2"
    metadata, _ = parse_front_matter(path.read_text(encoding="utf-8"), path)
    return FooterNavigation(
        areas_title=_required_string(metadata, "areas_title", path),
        items=tuple(_navigation_items(metadata, path)),
    )


def _navigation_items(metadata: dict[str, Any], path: Path) -> list[SiteNavigationItem]:
    """Parse ordered title|destination navigation entries from a partial."""
    items = metadata.get("items")
    if not isinstance(items, list) or not all(isinstance(item, str) for item in items):
        raise ContentError(f"{path}: items must be a list of title|destination values.")
    navigation = []
    for order, item in enumerate(items, start=1):
        title, separator, destination = item.partition("|")
        if not separator or not title or not destination:
            raise ContentError(f"{path}: each item must use title|destination.")
        navigation.append(SiteNavigationItem(title, destination, order))
    return navigation
