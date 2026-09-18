"""Jinja2 and Markdown rendering for trusted repository content."""

from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined
from markdown import markdown


def render_document(template_source: str, content_root: Path) -> str:
    """Render a content body, allowing includes rooted at ``content_root``."""
    environment = Environment(
        loader=FileSystemLoader(content_root),
        autoescape=True,
        keep_trailing_newline=True,
        undefined=StrictUndefined,
    )
    return environment.from_string(template_source).render()


def render_markdown(markdown_source: str) -> str:
    """Render trusted Markdown authored in this repository into HTML."""
    return markdown(markdown_source, extensions=["extra"])
