"""Focused auto-merge safety checks."""

from __future__ import annotations

import copy
import unittest

from verify_infrastructure_pr import validate

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
        self.files = [{
            "filename": "environments/dev.yml",
            "status": "modified",
            "additions": 1,
            "deletions": 1,
            "patch": "@@ -15 +15 @@\n-portfolio_website_image_ref: old\n+" + LINE,
        }]

    def verify(self) -> tuple[str, bool]:
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


if __name__ == "__main__":
    unittest.main()
