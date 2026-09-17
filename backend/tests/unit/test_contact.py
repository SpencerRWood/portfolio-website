from sqlalchemy import create_engine

from portfolio_website.models import Base
from portfolio_website.services.contact import persist_contact_submission


def test_persists_contact_submission_in_operational_database(tmp_path) -> None:  # type: ignore[no-untyped-def]
    database_url = f"sqlite:///{tmp_path / 'contact.db'}"
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)

    submission_id = persist_contact_submission(
        name="Ada Lovelace",
        email="ada@example.com",
        message="Please get in touch.",
        database_url=database_url,
    )

    assert submission_id == 1
