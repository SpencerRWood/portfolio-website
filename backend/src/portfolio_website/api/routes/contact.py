"""Contact lead-capture endpoint."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator

from portfolio_website.services.contact import (
    ContactPersistenceError,
    persist_contact_submission,
)

router = APIRouter()


class ContactSubmissionRequest(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=120)]
    email: Annotated[str, Field(min_length=3, max_length=254)]
    message: Annotated[str, Field(min_length=1, max_length=5_000)]

    @field_validator("name", "message")
    @classmethod
    def require_non_whitespace(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("must not be blank")
        return normalized

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        local, separator, domain = normalized.partition("@")
        if not local or not separator or "." not in domain:
            raise ValueError("must be a valid email address")
        return normalized


class ContactSubmissionResponse(BaseModel):
    id: int
    status: str = "accepted"


@router.post(
    "", response_model=ContactSubmissionResponse, status_code=status.HTTP_201_CREATED
)
def create_contact_submission(
    payload: ContactSubmissionRequest, request: Request
) -> ContactSubmissionResponse:
    """Validate and persist a contact submission."""
    try:
        submission_id = persist_contact_submission(
            name=payload.name,
            email=payload.email,
            message=payload.message,
            database_url=request.app.state.settings.database_url,
        )
    except ContactPersistenceError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Contact submission could not be saved. Please try again later.",
        ) from error
    return ContactSubmissionResponse(id=submission_id)
