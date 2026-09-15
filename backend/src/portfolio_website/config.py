"""Environment-aware configuration for the FastAPI backend."""

import os
from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum


class Environment(StrEnum):
    """Supported runtime environments."""

    DEVELOPMENT = "development"
    PRODUCTION = "production"


@dataclass(frozen=True)
class Settings:
    """Runtime settings kept outside application code."""

    environment: Environment
    database_url: str | None
    wood_data_platform_database_url: str | None

    @classmethod
    def from_environment(cls, environ: Mapping[str, str] | None = None) -> Settings:
        """Create settings from process environment variables.

        Development may use the local Wood Data Platform connection. Production always
        requires an explicit ``DATABASE_URL`` supplied by deployment secrets.
        """
        source = os.environ if environ is None else environ
        raw_environment = source.get("WEBSITE_ENV", Environment.DEVELOPMENT).lower()
        try:
            environment = Environment(raw_environment)
        except ValueError as error:
            allowed = ", ".join(item.value for item in Environment)
            message = f"WEBSITE_ENV must be one of: {allowed}."
            raise ValueError(message) from error

        database_url = source.get("DATABASE_URL") or None
        wood_data_platform_database_url = (
            source.get("WOOD_DATA_PLATFORM_DATABASE_URL") or None
        )
        if environment is Environment.PRODUCTION and database_url is None:
            raise ValueError("DATABASE_URL is required when WEBSITE_ENV=production.")

        return cls(
            environment=environment,
            database_url=database_url or wood_data_platform_database_url,
            wood_data_platform_database_url=wood_data_platform_database_url,
        )
