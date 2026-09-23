"""Focused tests for the release-to-infrastructure image pin mutation."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from update_infrastructure_pin import IMAGE_REPOSITORY, update_pin

VERSION = "v1.2.3"
DIGEST = "sha256:" + "a" * 64
REFERENCE = f"{IMAGE_REPOSITORY}:{VERSION}@{DIGEST}"
ORIGINAL = (
    "environment_name: dev\n"
    "# keep this comment\n"
    f"website_portfolio_image_ref: {IMAGE_REPOSITORY}:v0.6.0@sha256:{'b' * 64}\n"
    "services:\n  postgres: true\n"
)


class PinUpdateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "dev.yml"
        self.path.write_text(ORIGINAL, encoding="utf-8")

    def update(self, *, version: str = VERSION, digest: str = DIGEST) -> bool:
        return update_pin(
            self.path,
            version,
            digest,
            IMAGE_REPOSITORY,
            f"{IMAGE_REPOSITORY}:{version}",
            f"{IMAGE_REPOSITORY}:{version}@{digest}",
        )

    def test_updates_only_image_pin(self) -> None:
        self.assertTrue(self.update())
        self.assertEqual(self.path.read_text(encoding="utf-8"), ORIGINAL.replace(
            f"{IMAGE_REPOSITORY}:v0.6.0@sha256:{'b' * 64}", REFERENCE
        ))

    def test_exact_pin_is_noop(self) -> None:
        self.update()
        self.assertFalse(self.update())

    def test_rejects_invalid_version(self) -> None:
        with self.assertRaisesRegex(ValueError, "invalid stable release version"):
            self.update(version="v1.2.3-rc1")

    def test_rejects_invalid_digest(self) -> None:
        with self.assertRaisesRegex(ValueError, "invalid sha256 image digest"):
            self.update(digest="sha256:abc")

    def test_missing_key_fails(self) -> None:
        self.path.write_text("services:\n  postgres: true\n", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "expected exactly one website_portfolio_image_ref"):
            self.update()

    def test_duplicate_key_fails(self) -> None:
        self.path.write_text(ORIGINAL + "website_portfolio_image_ref: unexpected\n", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "found 2"):
            self.update()

    def test_rejects_other_repository(self) -> None:
        with self.assertRaisesRegex(ValueError, "unexpected image repository"):
            update_pin(self.path, VERSION, DIGEST, "ghcr.io/other/image", "other", "other")

    def test_publisher_outputs_must_agree(self) -> None:
        with self.assertRaisesRegex(ValueError, "publisher outputs disagree"):
            update_pin(self.path, VERSION, DIGEST, IMAGE_REPOSITORY, "wrong", REFERENCE)


if __name__ == "__main__":
    unittest.main()
