"""Keep retired internal taxonomy names out while allowing public Topics routes."""

import re
import subprocess
from pathlib import Path


def test_active_repository_files_use_current_content_terminology() -> None:
    root = Path(__file__).resolve().parents[3]
    result = subprocess.run(
        [
            "/usr/bin/git",
            "ls-files",
            "--cached",
            "--others",
            "--exclude-standard",
            "-z",
        ],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    )
    stem = "to" + "pic"
    retired = re.compile(
        rf"\b(?:{stem}(?!s\b)\w*|{stem.title()}(?!s\b)\w*|\w+_{stem}\w*|\w+{stem.title()}\w*)\b"
    )
    findings = []
    for relative in result.stdout.split("\0"):
        if not relative or relative == "backend/CHANGELOG.md":
            continue
        path = root / relative
        if not path.is_file():
            continue
        if retired.search(relative):
            findings.append(relative)
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        findings.extend(
            f"{relative}:{number}"
            for number, line in enumerate(source.splitlines(), start=1)
            if retired.search(line)
        )

    assert not findings, f"Retired content terminology found: {findings}"
