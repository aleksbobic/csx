import app.services.study.study as csx_study
from app.api.dependencies import get_storage_connector
from app.services.storage.base import BaseStorageConnector
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/studies/public", tags=["public"])


@router.get("/{public_study_id}/history")
def get_public_study_history(
    public_study_id: str, storage: BaseStorageConnector = Depends(get_storage_connector)
):
    study = storage.get_public_study(public_study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    history = csx_study.extract_history_items(study)
    return {
        "name": study["study_name"],
        "author": study["study_author"] if "study_author" in study else "",
        "description": study["study_description"],
        "history": history,
        "empty": False,
    }
