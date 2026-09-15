from fastapi.routing import APIRoute

from website.api.routes.health import router as health_router
from website.config import Environment, Settings
from website.main import create_app


def test_app_registers_health_route() -> None:
    settings = Settings(
        environment=Environment.DEVELOPMENT,
        database_url=None,
        wood_data_platform_database_url=None,
    )
    app = create_app(settings)
    paths = {
        route.path for route in health_router.routes if isinstance(route, APIRoute)
    }

    assert app.title == "website"
    assert "" in paths
    assert app.state.settings is settings
