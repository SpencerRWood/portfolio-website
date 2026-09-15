"""Health route for infrastructure smoke checks."""

from typing import TypedDict

from fastapi import APIRouter

router = APIRouter()


class HealthResponse(TypedDict):
    """Health response shape."""

    status: str


@router.get("")
def read_health() -> HealthResponse:
    """Return backend health."""
    return {"status": "ok"}
