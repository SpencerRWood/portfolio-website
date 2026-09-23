"""Gate native auto-merge on the exact dev pin diff and required validation."""

from __future__ import annotations

import json
import re
import subprocess
import sys

from update_infrastructure_pin import DIGEST_PATTERN, IMAGE_REPOSITORY, VERSION_PATTERN

REPOSITORY = "SpencerRWood/infrastructure"
PIN_FILE = "environments/dev.yml"


def validate(
    repository: dict, protection: dict, pull: dict, files: list[dict], version: str, digest: str, branch: str
) -> tuple[str, bool]:
    """Return the reviewed head SHA and whether auto-merge is already enabled."""
    if not VERSION_PATTERN.fullmatch(version) or not DIGEST_PATTERN.fullmatch(digest):
        raise ValueError("invalid published version or digest")
    if branch != f"chore/website-portfolio-{version}":
        raise ValueError("unexpected automation branch")
    if not repository.get("allow_auto_merge") or not repository.get("allow_squash_merge"):
        raise ValueError("infrastructure must allow native auto-merge and squash merge")
    checks = protection.get("required_status_checks") or {}
    contexts = set(checks.get("contexts") or [])
    contexts.update(check.get("context") for check in checks.get("checks") or [])
    if "validation" not in contexts:
        raise ValueError("infrastructure/main must require the validation check before auto-merge")

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

    expected_line = f"website_portfolio_image_ref: {IMAGE_REPOSITORY}:{version}@{digest}"
    if pull.get("changed_files") != 1 or len(files) != 1 or files[0].get("filename") != PIN_FILE:
        raise ValueError("PR modifies files outside the canonical dev image pin")
    file = files[0]
    if file.get("status") != "modified" or file.get("additions") != 1 or file.get("deletions") != 1:
        raise ValueError("PR must replace exactly one line in the dev image pin file")
    patch = file.get("patch") or ""
    added = [line[1:] for line in patch.splitlines() if line.startswith("+") and not line.startswith("+++")]
    removed = [line[1:] for line in patch.splitlines() if line.startswith("-") and not line.startswith("---")]
    if added != [expected_line] or len(removed) != 1 or not removed[0].startswith("website_portfolio_image_ref: "):
        raise ValueError("PR diff is not the exact requested Website Portfolio pin replacement")
    return sha, pull.get("auto_merge") is not None


def api(path: str) -> dict | list[dict]:
    completed = subprocess.run(["gh", "api", path], check=True, text=True, capture_output=True)
    return json.loads(completed.stdout)


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit("usage: verify_infrastructure_pr.py PR_NUMBER VERSION DIGEST BRANCH")
    number, version, digest, branch = sys.argv[1:]
    if not number.isdecimal():
        raise ValueError("invalid PR number")
    try:
        protection = api(f"repos/{REPOSITORY}/branches/main/protection")
    except subprocess.CalledProcessError as error:
        raise ValueError(
            "Cannot read infrastructure/main branch protection; native auto-merge requires a plan and a required validation check"
        ) from error
    sha, enabled = validate(
        api(f"repos/{REPOSITORY}"),
        protection,
        api(f"repos/{REPOSITORY}/pulls/{number}"),
        api(f"repos/{REPOSITORY}/pulls/{number}/files?per_page=100"),
        version,
        digest,
        branch,
    )
    print(f"{sha} {'true' if enabled else 'false'}")


if __name__ == "__main__":
    main()
