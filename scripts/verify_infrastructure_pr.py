"""Verify the proposed infrastructure PR contains only the dev image pin."""

from __future__ import annotations

import json
import re
import subprocess
import sys

from update_infrastructure_pin import DIGEST_PATTERN, IMAGE_REPOSITORY, VERSION_PATTERN

REPOSITORY = "SpencerRWood/infrastructure"
PIN_FILE = "environments/dev.yml"


def validate(pull: dict, files: list[dict], version: str, digest: str, branch: str) -> str:
    """Return the verified PR head SHA."""
    if not VERSION_PATTERN.fullmatch(version) or not DIGEST_PATTERN.fullmatch(digest):
        raise ValueError("invalid published version or digest")
    if branch != f"chore/portfolio-website-{version}":
        raise ValueError("unexpected automation branch")

    expected_title = f"chore(deps): update website portfolio to {version}"
    head = pull.get("head") or {}
    base = pull.get("base") or {}
    if (
        base.get("ref") != "main"
        or base.get("repo", {}).get("full_name") != REPOSITORY
        or head.get("ref") != branch
        or head.get("repo", {}).get("full_name") != REPOSITORY
        or pull.get("title") != expected_title
        or pull.get("state") != "open"
    ):
        raise ValueError("PR base, head, title, or state differs from the expected automation PR")
    sha = head.get("sha", "")
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("PR has no valid head commit SHA")

    expected_line = f"portfolio_website_image_ref: {IMAGE_REPOSITORY}:{version}@{digest}"
    if pull.get("changed_files") != 1 or len(files) != 1 or files[0].get("filename") != PIN_FILE:
        raise ValueError("PR modifies files outside the canonical dev image pin")
    file = files[0]
    if file.get("status") != "modified" or file.get("additions") != 1 or file.get("deletions") != 1:
        raise ValueError("PR must replace exactly one line in the dev image pin file")
    patch = file.get("patch") or ""
    added = [line[1:] for line in patch.splitlines() if line.startswith("+") and not line.startswith("+++")]
    removed = [line[1:] for line in patch.splitlines() if line.startswith("-") and not line.startswith("---")]
    if added != [expected_line] or len(removed) != 1 or not removed[0].startswith("portfolio_website_image_ref: "):
        raise ValueError("PR diff is not the exact requested Website Portfolio pin replacement")
    return sha


def api(path: str) -> dict | list[dict]:
    completed = subprocess.run(["gh", "api", path], check=True, text=True, capture_output=True)
    return json.loads(completed.stdout)


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit("usage: verify_infrastructure_pr.py PR_NUMBER VERSION DIGEST BRANCH")
    number, version, digest, branch = sys.argv[1:]
    if not number.isdecimal():
        raise ValueError("invalid PR number")
    sha = validate(
        api(f"repos/{REPOSITORY}/pulls/{number}"),
        api(f"repos/{REPOSITORY}/pulls/{number}/files?per_page=100"),
        version,
        digest,
        branch,
    )
    print(f"Verified infrastructure PR #{number} at {sha}")


if __name__ == "__main__":
    main()
