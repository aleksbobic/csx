from app.dependency import get_storage_connector, verify_user_exists
from app.services.storage.base import BaseStorageConnector
from fastapi import Depends, HTTPException, status


def get_current_study(
    study_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
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
