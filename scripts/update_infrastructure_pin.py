"""Replace the single Website Portfolio image pin in infrastructure dev state."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

IMAGE_REPOSITORY = "ghcr.io/spencerrwood/portfolio-website"
VERSION_PATTERN = re.compile(r"v(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\Z")
DIGEST_PATTERN = re.compile(r"sha256:[0-9a-f]{64}\Z")
PIN_PATTERN = re.compile(r"^portfolio_website_image_ref: .+$", re.MULTILINE)


def update_pin(path: Path, version: str, digest: str, repository: str, image: str, reference: str) -> bool:
    """Validate publisher outputs and update exactly one YAML line; return whether it changed."""
    if not VERSION_PATTERN.fullmatch(version):
        raise ValueError(f"invalid stable release version: {version!r}")
    if not DIGEST_PATTERN.fullmatch(digest):
        raise ValueError("invalid sha256 image digest")
    if repository != IMAGE_REPOSITORY:
        raise ValueError(f"unexpected image repository: {repository!r}")
    expected_image = f"{repository}:{version}"
    expected_reference = f"{expected_image}@{digest}"
    if image != expected_image or reference != expected_reference:
        raise ValueError("container publisher outputs disagree with version or digest")

    content = path.read_text(encoding="utf-8")
    matches = list(PIN_PATTERN.finditer(content))
    if len(matches) != 1:
        raise ValueError(f"expected exactly one portfolio_website_image_ref in {path}; found {len(matches)}")
    replacement = f"portfolio_website_image_ref: {expected_reference}"
    if matches[0].group() == replacement:
        return False
    updated = content[: matches[0].start()] + replacement + content[matches[0].end() :]
    path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", type=Path)
    parser.add_argument("--version", required=True)
    parser.add_argument("--digest", required=True)
    parser.add_argument("--repository", required=True)
    parser.add_argument("--image", required=True)
    parser.add_argument("--reference", required=True)
    args = parser.parse_args()
    changed = update_pin(args.path, args.version, args.digest, args.repository, args.image, args.reference)
    print("Image pin updated" if changed else "No update required", file=sys.stderr)
    print(f"changed={'true' if changed else 'false'}")


if __name__ == "__main__":
    main()
