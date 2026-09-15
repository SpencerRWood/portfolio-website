from portfolio_website.content import PortfolioSection, render_section_markdown


def test_section_markdown_includes_reusable_content_dimensions() -> None:
    section = PortfolioSection(
        title="Data Modeling",
        objective="Make data reliable for analytical use.",
        conceptual_model="A governed semantic layer.",
        design_principles=("Prefer explicit contracts.",),
        workflow="Model, test, and publish.",
        implementation_example="A dbt model.",
        tradeoffs="More governance requires more discipline.",
        references=(("Example repository", "https://github.com/example/model"),),
    )

    markdown = render_section_markdown(section)

    assert "# Data Modeling" in markdown
    assert "## Conceptual model" in markdown
    assert "- Prefer explicit contracts." in markdown
    assert "[Example repository](https://github.com/example/model)" in markdown
