from pathlib import Path

import pytest

from portfolio_website.content.loader import (
    ContentError,
    ContentLoader,
    parse_front_matter,
)


def write_page(root: Path, section: str, filename: str, front_matter: str) -> None:
    directory = root / section
    directory.mkdir(parents=True, exist_ok=True)
    (directory / filename).write_text(front_matter, encoding="utf-8")


def topic_document(slug: str, order: int = 10) -> str:
    return f"""---
title: {slug.title()}
slug: {slug}
section: topics
order: {order}
summary: A test topic.
nav: true
featured: false
---

{{% include \"_partials/body.md.j2\" %}}
"""


def test_loader_parses_front_matter_and_renders_jinja_markdown(tmp_path: Path) -> None:
    partials = tmp_path / "_partials"
    partials.mkdir()
    (partials / "body.md.j2").write_text("**{{ page.title }}**", encoding="utf-8")
    write_page(tmp_path, "topics", "topic.md.j2", topic_document("analytics"))

    page = ContentLoader(tmp_path).discover()[0]

    assert page.title == "Analytics"
    assert page.nav is True
    assert page.body_html == "<p><strong>Analytics</strong></p>"


def test_front_matter_requires_expected_delimiters(tmp_path: Path) -> None:
    with pytest.raises(ContentError, match="must start"):
        parse_front_matter("title: Missing delimiters", tmp_path / "bad.md.j2")


def test_loader_rejects_duplicate_slugs(tmp_path: Path) -> None:
    partials = tmp_path / "_partials"
    partials.mkdir()
    (partials / "body.md.j2").write_text("Body", encoding="utf-8")
    write_page(tmp_path, "topics", "first.md.j2", topic_document("duplicate"))
    write_page(
        tmp_path,
        "blog",
        "second.md.j2",
        """---
title: Duplicate
slug: duplicate
section: blog
summary: A test entry.
published: 2026-09-18
nav: false
featured: true
---

Placeholder.
""",
    )

    with pytest.raises(ContentError, match="Duplicate content slug"):
        ContentLoader(tmp_path).discover()


def test_loader_sorts_content_by_section_then_order(tmp_path: Path) -> None:
    partials = tmp_path / "_partials"
    partials.mkdir()
    (partials / "body.md.j2").write_text("Body", encoding="utf-8")
    write_page(tmp_path, "topics", "second.md.j2", topic_document("second", 20))
    write_page(tmp_path, "topics", "first.md.j2", topic_document("first", 10))

    assert [page.slug for page in ContentLoader(tmp_path).discover()] == [
        "first",
        "second",
    ]


def test_navigation_is_derived_from_nav_metadata(tmp_path: Path) -> None:
    partials = tmp_path / "_partials"
    partials.mkdir()
    (partials / "body.md.j2").write_text("Body", encoding="utf-8")
    write_page(tmp_path, "topics", "topic.md.j2", topic_document("analytics"))

    assert [item.slug for item in ContentLoader(tmp_path).navigation()] == ["analytics"]
