from pathlib import Path

import pytest

from portfolio_website.content.loader import (
    SLUG_PATTERN,
    ContentError,
    ContentLoader,
    load_site_content,
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


def test_loader_rejects_slug_that_is_not_lowercase_kebab_case(tmp_path: Path) -> None:
    write_page(
        tmp_path,
        "topics",
        "invalid.md.j2",
        """---
title: Invalid
slug: Data Generation
section: topics
summary: A test topic.
---

Placeholder.
""",
    )

    with pytest.raises(ContentError, match="lowercase kebab-case"):
        ContentLoader(tmp_path).discover()


def test_production_content_supplies_analytics_metadata() -> None:
    pages = load_site_content()

    assert pages
    assert all(page.title and page.slug and page.section for page in pages)
    assert all(SLUG_PATTERN.fullmatch(page.slug) for page in pages)
    assert all(page.published is not None for page in pages if page.section == "blog")


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


def test_blog_dates_determine_order_not_featured_or_order(tmp_path: Path) -> None:
    write_page(
        tmp_path,
        "blog",
        "older.md.j2",
        """---
title: Older
slug: older
section: blog
order: 999
published: 2026-01-01
summary: An older post.
featured: true
---

Older.
""",
    )
    write_page(
        tmp_path,
        "blog",
        "newer.md.j2",
        """---
title: Newer
slug: newer
section: blog
order: 1
published: 2026-09-18
summary: A newer post.
featured: false
---

Newer.
""",
    )

    assert [page.slug for page in ContentLoader(tmp_path).discover()] == [
        "newer",
        "older",
    ]


def test_blog_order_breaks_same_date_ties_before_title(tmp_path: Path) -> None:
    for filename, slug, title, order in [
        ("second.md.j2", "second", "A title", 20),
        ("first.md.j2", "first", "Z title", 10),
        ("third.md.j2", "third", "B title", 20),
    ]:
        write_page(
            tmp_path,
            "blog",
            filename,
            f"""---
title: {title}
slug: {slug}
section: blog
order: {order}
published: 2026-09-18
summary: A post.
---

Post.
""",
        )

    assert [page.slug for page in ContentLoader(tmp_path).discover()] == [
        "first",
        "second",
        "third",
    ]


def test_navigation_is_derived_from_nav_metadata(tmp_path: Path) -> None:
    partials = tmp_path / "_partials"
    partials.mkdir()
    (partials / "body.md.j2").write_text("Body", encoding="utf-8")
    write_page(tmp_path, "topics", "topic.md.j2", topic_document("analytics"))

    assert [item.slug for item in ContentLoader(tmp_path).navigation()] == ["analytics"]
