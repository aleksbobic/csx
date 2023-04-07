from typing import Generator

from app.services.storage.base import StorageConnector
from app.services.storage.mongo_connector import MongoConnector
from fastapi import Depends, Header, HTTPException, status
from typing_extensions import Annotated


def verify_user_exists(user_id: Annotated[str, Header(convert_underscores=False)]):
    """Get the user_id from the request header and verify that the user exists."""

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user_id


def get_storage_connector() -> Generator[StorageConnector, None, None]:
    """Get a connector to the storage backend"""

    try:
        connector = MongoConnector()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not connect to storage backend: {e}",
        )

    try:
        yield connector
    finally:
        connector.disconnect()


def get_current_study(
    study_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: StorageConnector = Depends(get_storage_connector),
) -> dict:
    """Get the study_id from the request header and verify that the study exists."""

    if not study_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    study = storage.get_study(user_id, study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    return study
