import tomllib
from importlib import import_module
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]


def load_pyproject() -> dict[str, Any]:
    return tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))


def test_package_can_be_imported() -> None:
    package = import_module("website")

    assert package.__all__ == ()


def test_template_project_metadata_describes_scaffold() -> None:
    pyproject = load_pyproject()
    project = pyproject["project"]

    assert project["name"] == "website"
    assert (
        project["description"]
        == "A minimal FastAPI and React full-stack template baseline."
    )
    assert project["requires-python"] == ">=3.14"
    assert project["dependencies"] == ["fastapi", "uvicorn[standard]"]


def test_template_declares_typed_src_package() -> None:
    pyproject = load_pyproject()
    project = pyproject["project"]
    tool = pyproject["tool"]
    hatch_targets = tool["hatch"]["build"]["targets"]

    assert (ROOT / "src" / "website" / "py.typed").is_file()
    assert "Typing :: Typed" in project["classifiers"]
    assert hatch_targets["wheel"]["packages"] == [
        "src/website",
    ]
    assert tool["coverage"]["run"]["source"] == ["website"]
