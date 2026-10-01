from pathlib import Path

import pytest

from portfolio_website.content.loader import CONTENT_ROOT, ContentError, ContentLoader


def write_document(root: Path, section: str, slug: str, metadata: str = "") -> None:
    directory = root / section
    directory.mkdir(exist_ok=True)
    area_metadata = "group: Analytics\norder: 10\n" if section == "areas" else ""
    (directory / f"{slug}.md.j2").write_text(
        f"---\ntitle: {slug}\nslug: {slug}\nsection: {section}\n"
        f"summary: Summary for {slug}.\n{area_metadata}{metadata}---\n\n"
        '{% include "_partials/related-content.md.j2" %}',
        encoding="utf-8",
    )


def prepare_partials(root: Path) -> None:
    partials = root / "_partials"
    partials.mkdir()
    name = "related-content.md.j2"
    (partials / name).write_text(
        (CONTENT_ROOT / "_partials" / name).read_text(), encoding="utf-8"
    )


def test_relationships_are_bidirectional_sorted_and_renderable(tmp_path: Path) -> None:
    prepare_partials(tmp_path)
    write_document(tmp_path, "areas", "analytics")
    write_document(tmp_path, "areas", "empty")
    for slug, date in [("older", "2026-01-01"), ("newer", "2026-09-18")]:
        write_document(
            tmp_path,
            "blog",
            slug,
            f"published: {date}\nareas:\n  - analytics\n",
        )
    write_document(tmp_path, "projects", "project", "areas:\n  - analytics\n")
    pages = {page.slug: page for page in ContentLoader(tmp_path).discover()}

    assert [item.slug for item in pages["analytics"].related_content] == [
        "newer",
        "older",
        "project",
    ]
    for slug in ("newer", "older", "project"):
        assert [item.slug for item in pages[slug].related_content] == ["analytics"]
        assert 'href="/topics/analytics"' in pages[slug].body_html
    assert 'href="/blog/newer"' in pages["analytics"].body_html
    assert 'href="/projects/project"' in pages["analytics"].body_html
    assert pages["empty"].related_content == ()
    assert pages["empty"].body_html == ""


@pytest.mark.parametrize(
    ("section", "metadata", "error"),
    [
        ("blog", "areas:\n  - missing\n", "unknown Area reference"),
        ("projects", "areas:\n  - writing\n", "unknown Area reference"),
        ("blog", "areas:\n  - analytics\n  - analytics\n", "duplicate Area"),
        ("blog", "areas: analytics\n", "areas must be a list"),
        ("areas", "areas:\n  - analytics\n", "cannot declare areas"),
        ("blog", "related_content:\n  - analytics\n", "unsupported metadata"),
    ],
)
def test_invalid_relationships_fail_before_rendering(
    tmp_path: Path, section: str, metadata: str, error: str
) -> None:
    write_document(tmp_path, "areas", "analytics")
    write_document(tmp_path, "blog", "writing")
    write_document(tmp_path, section, "invalid", metadata)
    with pytest.raises(ContentError, match=error):
        ContentLoader(tmp_path).discover()
