"""Focused auto-merge safety checks."""

from __future__ import annotations

import copy
import subprocess
import unittest
from unittest.mock import patch

from verify_infrastructure_pr import check_runs, ensure_head, validate, validation_result

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
        self.check = {
            "id": 1,
            "name": "validation / validation",
            "head_sha": self.sha,
            "app": {"slug": "github-actions"},
            "status": "completed",
            "conclusion": "success",
        }

    def test_successful_validation_allows_merge(self) -> None:
        self.assertEqual(validation_result([self.check], self.sha), "success")

    def test_failed_validation_blocks_merge(self) -> None:
        self.check["conclusion"] = "failure"
        with self.assertRaisesRegex(ValueError, "failure"):
            validation_result([self.check], self.sha)

    def test_cancelled_validation_blocks_merge(self) -> None:
        self.check["conclusion"] = "cancelled"
        with self.assertRaisesRegex(ValueError, "cancelled"):
            validation_result([self.check], self.sha)

    def test_latest_rerun_must_succeed(self) -> None:
        rerun = {**self.check, "id": 2, "status": "in_progress", "conclusion": None}
        self.assertEqual(validation_result([self.check, rerun], self.sha), "pending")

    def test_other_sha_does_not_count(self) -> None:
        self.assertEqual(validation_result([self.check], "c" * 40), "pending")

    def test_missing_check_read_permission_has_actionable_error(self) -> None:
        error = subprocess.CalledProcessError(1, ["gh", "api"], stderr="HTTP 403")
        with patch("verify_infrastructure_pr.api", side_effect=error):
            with self.assertRaisesRegex(RuntimeError, "Checks: read.*HTTP 403"):
                check_runs(self.sha)


if __name__ == "__main__":
    unittest.main()
