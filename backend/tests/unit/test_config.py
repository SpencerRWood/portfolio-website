import pytest

from website.config import Environment, Settings


def test_development_can_use_wood_data_platform_database() -> None:
    settings = Settings.from_environment(
        {
            "WEBSITE_ENV": "development",
            "WOOD_DATA_PLATFORM_DATABASE_URL": "postgresql://wood@localhost/wood_data",
        }
    )

    assert settings.environment is Environment.DEVELOPMENT
    assert settings.database_url == "postgresql://wood@localhost/wood_data"


def test_production_requires_explicit_database_url() -> None:
    with pytest.raises(ValueError, match="DATABASE_URL is required"):
        Settings.from_environment({"WEBSITE_ENV": "production"})


def test_production_uses_explicit_database_url() -> None:
    settings = Settings.from_environment(
        {
            "WEBSITE_ENV": "production",
            "DATABASE_URL": "postgresql://production-host/website",
        }
    )

    assert settings.environment is Environment.PRODUCTION
    assert settings.database_url == "postgresql://production-host/website"
