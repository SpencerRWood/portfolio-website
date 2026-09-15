"""Markdown/Jinja2 primitives for conceptual portfolio content."""

from dataclasses import dataclass
from typing import cast

from jinja2 import Template


@dataclass(frozen=True)
class PortfolioSection:
    """Reusable conceptual-section content authored as structured Markdown inputs."""

    title: str
    objective: str
    conceptual_model: str
    design_principles: tuple[str, ...]
    workflow: str
    implementation_example: str
    tradeoffs: str
    references: tuple[tuple[str, str], ...] = ()


_SECTION_TEMPLATE = Template(
    """# {{ section.title }}

## Objective
{{ section.objective }}

## Conceptual model
{{ section.conceptual_model }}

## Design principles
{% for principle in section.design_principles %}- {{ principle }}
{% endfor %}
## Workflow
{{ section.workflow }}

## Implementation example
{{ section.implementation_example }}

## Tradeoffs and findings
{{ section.tradeoffs }}
{% if section.references %}
## Reference implementations
{% for label, url in section.references %}- [{{ label }}]({{ url }})
{% endfor %}{% endif %}"""
)


def render_section_markdown(section: PortfolioSection) -> str:
    """Render a conceptual section into reusable Markdown through Jinja2."""
    return cast("str", _SECTION_TEMPLATE.render(section=section))
