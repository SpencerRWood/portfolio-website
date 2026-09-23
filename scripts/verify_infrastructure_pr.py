"""Merge only a validated, exact portfolio dev image promotion PR."""

from __future__ import annotations

import json
import re
import subprocess
import sys
import time
from base64 import b64decode

from update_infrastructure_pin import (
    DIGEST_PATTERN,
    IMAGE_REPOSITORY,
    VERSION_PATTERN,
    check_promotion_order,
)

REPOSITORY = "SpencerRWood/infrastructure"
PIN_FILE = "environments/dev.yml"
CHECK_NAME = "validation / validation"
CHECK_TIMEOUT_SECONDS = 20 * 60
CHECK_POLL_SECONDS = 15


def validate(
    pull: dict, files: list[dict], version: str, digest: str, branch: str
) -> str:
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
        raise ValueError(
            "PR base, head, title, or state differs from the expected automation PR"
        )
    sha = head.get("sha", "")
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("PR has no valid head commit SHA")

    expected_line = (
        f"portfolio_website_image_ref: {IMAGE_REPOSITORY}:{version}@{digest}"
    )
    if (
        pull.get("changed_files") != 1
        or len(files) != 1
        or files[0].get("filename") != PIN_FILE
    ):
        raise ValueError("PR modifies files outside the canonical dev image pin")
    file = files[0]
    if (
        file.get("status") != "modified"
        or file.get("additions") != 1
        or file.get("deletions") != 1
    ):
        raise ValueError("PR must replace exactly one line in the dev image pin file")
    patch = file.get("patch") or ""
    added = [
        line[1:]
        for line in patch.splitlines()
        if line.startswith("+") and not line.startswith("+++")
    ]
    removed = [
        line[1:]
        for line in patch.splitlines()
        if line.startswith("-") and not line.startswith("---")
    ]
    if (
        added != [expected_line]
        or len(removed) != 1
        or not removed[0].startswith("portfolio_website_image_ref: ")
    ):
        raise ValueError(
            "PR diff is not the exact requested Website Portfolio pin replacement"
        )
    return sha


def validation_result(check_runs: list[dict], head_sha: str) -> str:
    """Return pending/success; reject any completed non-success result."""
    matching = [
        check
        for check in check_runs
        if check.get("name") == CHECK_NAME
        and check.get("head_sha") == head_sha
        and (check.get("app") or {}).get("slug") == "github-actions"
    ]
    if not matching:
        return "pending"
    latest = max(matching, key=lambda check: check.get("id", 0))
    if latest.get("status") != "completed":
        return "pending"
    conclusion = latest.get("conclusion")
    if conclusion != "success":
        raise ValueError(f"infrastructure {CHECK_NAME} finished with {conclusion!r}")
    return "success"


def ensure_head(pull: dict, expected_sha: str) -> None:
    if (
        pull.get("state") != "open"
        or (pull.get("head") or {}).get("sha") != expected_sha
    ):
        raise ValueError("promotion PR closed or head SHA changed after verification")


def main_pin() -> tuple[str, str]:
    response = api(f"repos/{REPOSITORY}/contents/{PIN_FILE}?ref=main")
    if not isinstance(response, dict) or response.get("encoding") != "base64":
        raise ValueError("could not read infrastructure main dev pin")
    content = b64decode(response["content"], validate=False).decode("utf-8")
    return content, response["sha"]


def check_main_order(version: str, digest: str) -> bool:
    content, _ = main_pin()
    reference = f"{IMAGE_REPOSITORY}:{version}@{digest}"
    return check_promotion_order(content, version, reference)


def api(path: str) -> dict | list[dict]:
    completed = subprocess.run(
        ["gh", "api", path], check=True, text=True, capture_output=True
    )
    return json.loads(completed.stdout)


def pull_and_files(number: str) -> tuple[dict, list[dict]]:
    pull = api(f"repos/{REPOSITORY}/pulls/{number}")
    files = api(f"repos/{REPOSITORY}/pulls/{number}/files?per_page=100")
    if not isinstance(pull, dict) or not isinstance(files, list):
        raise TypeError("invalid infrastructure PR API response")
    return pull, files


def check_runs(head_sha: str) -> list[dict]:
    response = api(f"repos/{REPOSITORY}/commits/{head_sha}/check-runs?per_page=100")
    if not isinstance(response, dict) or not isinstance(
        response.get("check_runs"), list
    ):
        raise TypeError("invalid infrastructure checks API response")
    return response["check_runs"]


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit(
            "usage: verify_infrastructure_pr.py PR_NUMBER VERSION DIGEST BRANCH"
        )
    number, version, digest, branch = sys.argv[1:]
    if not number.isdecimal():
        raise ValueError("invalid PR number")
    print(f"Application version: {version}", flush=True)
    print(f"Immutable image: {IMAGE_REPOSITORY}:{version}@{digest}", flush=True)
    print(f"Infrastructure PR: #{number}", flush=True)
    pull, files = pull_and_files(number)
    head_sha = validate(pull, files, version, digest, branch)
    print(f"Initial PR head SHA: {head_sha}", flush=True)

    deadline = time.monotonic() + CHECK_TIMEOUT_SECONDS
    while True:
        current_pull, _ = pull_and_files(number)
        ensure_head(current_pull, head_sha)
        result = validation_result(check_runs(head_sha), head_sha)
        if result == "success":
            break
        if time.monotonic() >= deadline:
            raise TimeoutError(f"timed out waiting for infrastructure {CHECK_NAME}")
        print(f"Infrastructure {CHECK_NAME}: pending", flush=True)
        time.sleep(CHECK_POLL_SECONDS)
    print(f"Infrastructure {CHECK_NAME}: success", flush=True)

    pull, files = pull_and_files(number)
    ensure_head(pull, head_sha)
    verified_sha = validate(pull, files, version, digest, branch)
    if verified_sha != head_sha:
        raise ValueError("promotion PR head SHA changed after validation passed")
    if validation_result(check_runs(head_sha), head_sha) != "success":
        raise ValueError("infrastructure validation no longer succeeds")
    if check_main_order(version, digest):
        print(
            "Exact artifact is already on infrastructure main; skipping merge",
            flush=True,
        )
        return
    print(f"Verified PR head SHA before merge: {head_sha}", flush=True)

    title = f"chore(deps): update website portfolio to {version}"
    subprocess.run(
        [
            "gh",
            "pr",
            "merge",
            number,
            "--repo",
            REPOSITORY,
            "--squash",
            "--delete-branch",
            "--match-head-commit",
            head_sha,
            "--subject",
            title,
        ],
        check=True,
    )
    merged = api(f"repos/{REPOSITORY}/pulls/{number}")
    if not isinstance(merged, dict) or merged.get("merged") is not True:
        raise ValueError("infrastructure PR merge could not be confirmed")
    merge_sha = merged.get("merge_commit_sha")
    print(f"Merged infrastructure PR #{number}: {merge_sha}", flush=True)
    main_ref = api(f"repos/{REPOSITORY}/git/ref/heads/main")
    if not isinstance(main_ref, dict):
        raise TypeError("infrastructure main SHA could not be read")
    print(
        f"Infrastructure main SHA: {(main_ref.get('object') or {}).get('sha')}",
        flush=True,
    )


if __name__ == "__main__":
    main()
