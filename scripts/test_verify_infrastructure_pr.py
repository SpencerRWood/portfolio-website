"""Focused auto-merge safety checks."""

from __future__ import annotations

import copy
import subprocess
import unittest
from unittest.mock import patch

from verify_infrastructure_pr import commit_statuses, ensure_head, validate, validation_result

VERSION = "v1.2.3"
DIGEST = "sha256:" + "a" * 64
BRANCH = f"chore/portfolio-website-{VERSION}"
REPOSITORY = "SpencerRWood/infrastructure"
LINE = f"portfolio_website_image_ref: ghcr.io/spencerrwood/portfolio-website:{VERSION}@{DIGEST}"


class AutoMergeSafetyTests(unittest.TestCase):
    def setUp(self) -> None:
        self.pull = {
            "base": {"ref": "main", "repo": {"full_name": REPOSITORY}},
            "head": {"ref": BRANCH, "repo": {"full_name": REPOSITORY}, "sha": "b" * 40},
            "title": f"chore(deps): update website portfolio to {VERSION}",
            "state": "open",
            "changed_files": 1,
        }
        self.files = [
            {
                "filename": "environments/dev.yml",
                "status": "modified",
                "additions": 1,
                "deletions": 1,
                "patch": "@@ -15 +15 @@\n-portfolio_website_image_ref: old\n+" + LINE,
            }
        ]

    def verify(self) -> str:
        return validate(self.pull, self.files, VERSION, DIGEST, BRANCH)

    def test_exact_pr_is_eligible(self) -> None:
        self.assertEqual(self.verify(), "b" * 40)

    def test_unrelated_file_fails(self) -> None:
        self.files.append(copy.deepcopy(self.files[0]))
        self.files[1]["filename"] = "ansible/playbooks/dev.yml"
        with self.assertRaisesRegex(ValueError, "outside the canonical"):
            self.verify()

    def test_extra_line_fails(self) -> None:
        self.files[0]["additions"] = 2
        self.files[0]["patch"] += "\n+services: {}"
        with self.assertRaisesRegex(ValueError, "exactly one line"):
            self.verify()

    def test_wrong_target_fails(self) -> None:
        self.pull["base"]["ref"] = "production"
        with self.assertRaisesRegex(ValueError, "base, head, title"):
            self.verify()

    def test_wrong_branch_fails(self) -> None:
        with self.assertRaisesRegex(ValueError, "unexpected automation branch"):
            validate(self.pull, self.files, VERSION, DIGEST, "chore/other")

    def test_wrong_digest_blocks_merge(self) -> None:
        with self.assertRaisesRegex(ValueError, "exact requested"):
            validate(self.pull, self.files, VERSION, "sha256:" + "c" * 64, BRANCH)

    def test_wrong_version_blocks_merge(self) -> None:
        with self.assertRaisesRegex(ValueError, "unexpected automation branch"):
            validate(self.pull, self.files, "v1.2.4", DIGEST, BRANCH)

    def test_changed_head_after_validation_blocks_merge(self) -> None:
        self.pull["head"]["sha"] = "c" * 40
        with self.assertRaisesRegex(ValueError, "head SHA changed"):
            ensure_head(self.pull, "b" * 40)


class ValidationGateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.sha = "b" * 40
        self.status = {
            "id": 1,
            "context": "infrastructure-validation",
            "url": f"https://api.github.com/repos/{REPOSITORY}/statuses/{self.sha}",
            "target_url": f"https://github.com/{REPOSITORY}/actions/runs/123",
            "creator": {"login": "github-actions[bot]"},
            "state": "success",
        }

    def test_successful_validation_allows_merge(self) -> None:
        self.assertEqual(validation_result([self.status], self.sha), "success")

    def test_missing_status_waits(self) -> None:
        self.assertEqual(validation_result([], self.sha), "pending")

    def test_pending_status_waits(self) -> None:
        self.status["state"] = "pending"
        self.assertEqual(validation_result([self.status], self.sha), "pending")

    def test_failed_validation_blocks_merge(self) -> None:
        self.status["state"] = "failure"
        with self.assertRaisesRegex(ValueError, "failure"):
            validation_result([self.status], self.sha)

    def test_error_status_blocks_merge(self) -> None:
        self.status["state"] = "error"
        with self.assertRaisesRegex(ValueError, "error"):
            validation_result([self.status], self.sha)

    def test_latest_rerun_must_succeed(self) -> None:
        rerun = {**self.status, "id": 2, "state": "pending"}
        self.assertEqual(validation_result([self.status, rerun], self.sha), "pending")

    def test_wrong_context_is_ignored(self) -> None:
        self.status["context"] = "unrelated"
        self.assertEqual(validation_result([self.status], self.sha), "pending")

    def test_stale_sha_is_ignored(self) -> None:
        self.assertEqual(validation_result([self.status], "c" * 40), "pending")

    def test_missing_status_read_permission_has_actionable_error(self) -> None:
        error = subprocess.CalledProcessError(1, ["gh", "api"], stderr="HTTP 403")
        with patch("verify_infrastructure_pr.api", side_effect=error):
            with self.assertRaisesRegex(RuntimeError, "Commit statuses: read.*HTTP 403"):
                commit_statuses(self.sha)


if __name__ == "__main__":
    unittest.main()
