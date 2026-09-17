"""Persistence operation for inbound contact requests."""

from collections.abc import Callable

from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from portfolio_website.models.contact import ContactSubmission


class ContactPersistenceError(Exception):
    """Raised when a contact request cannot be persisted."""


def persist_contact_submission(
    *,
    name: str,
    email: str,
    message: str,
    database_url: str | None,
    session_factory: Callable[[], Session] | None = None,
) -> int:
    """Persist a submission and return its generated identifier."""
    if not database_url:
        raise ContactPersistenceError("Contact storage is not configured.")

    factory = session_factory
    if factory is None:
        engine = create_engine(database_url)
        factory = sessionmaker(bind=engine)

    try:
        with factory() as session, session.begin():
            submission = ContactSubmission(name=name, email=email, message=message)
            session.add(submission)
            session.flush()
            submission_id = submission.id
        if submission_id is None:
            raise ContactPersistenceError(
                "Contact storage did not create an identifier."
            )
        return submission_id
    except SQLAlchemyError as error:
        raise ContactPersistenceError("Unable to save contact submission.") from error
