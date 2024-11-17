import json
import uuid
from typing import Any, Dict, List

from app.dependency import get_storage_connector, verify_user_exists
from app.services.storage.base import BaseStorageConnector
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import JSONResponse

from . import service as study_service
from .dependency import get_current_study
from .schema import Study, StudyCreate, StudyUpdate

router = APIRouter(prefix="/studies", tags=["studies"])


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


@router.get(
    "/{study_id}",
    response_model=Study,
    status_code=status.HTTP_200_OK,
)
def get_study(
    study_id: str,
    study: dict = Depends(get_current_study),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> JSONResponse:
    """
    Retrieve a study by its ID.

    Args:
        study_id (str): The ID of the study.
        study (dict): The current study (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        JSONResponse: A JSON response containing the study details.
    """
    if not study["history"]:
        return JSONResponse(
            content={
                "study_name": study["study_name"],
                "study_description": study["study_description"],
                "study_author": study.get("study_author", ""),
                "public": study["public"],
                "graph": {},
                "history": [],
                "index": study["index"],
                "empty": False,
                "public_url": study["public_url"],
            },
            status_code=status.HTTP_200_OK,
        )

    try:
        study_details = study_service.get_study_details(study, storage)
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return JSONResponse(
        content=json.dumps(study_details, cls=SetEncoder),
        status_code=status.HTTP_200_OK,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_study(
    data: StudyCreate,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> JSONResponse:
    """
    Create a new study.

    Args:
        data (StudyCreate): The study creation data.
        user_id (str): The ID of the user (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        JSONResponse: A JSON response containing the study UUID.
    """
    study_uuid = uuid.uuid4().hex

    storage.insert_study(
        {
            "study_uuid": study_uuid,
            "user_uuid": user_id,
            "study_name": data.study_name,
            "study_description": "",
            "saved": False,
            "public": False,
            "public_url": "",
            "index": "",
            "history": [],
        }
    )

    return JSONResponse(
        content={"study_uuid": study_uuid}, status_code=status.HTTP_201_CREATED
    )


@router.get("", status_code=status.HTTP_200_OK)
def get_studies(
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> JSONResponse:
    """
    Get all studies for a user.

    Args:
        user_id (str): The ID of the user (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        JSONResponse: A JSON response containing a list of studies.
    """

    saved_studies = storage.get_user_studies(user_id)

    studies = [
        {
            "study_uuid": study["study_uuid"],
            "study_description": study["study_description"],
            "study_name": study["study_name"],
        }
        for study in saved_studies
    ]

    return JSONResponse(content=studies, status_code=status.HTTP_200_OK)


@router.patch("/{study_id}", status_code=status.HTTP_200_OK)
def update_study(
    study_id: str,
    data: StudyUpdate,
    user_id: str = Depends(verify_user_exists),
    study: dict = Depends(get_current_study),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> JSONResponse:
    """
    Update study settings and return public URL if public is set to true for the first time.

    Args:
        study_id (str): The ID of the study.
        data (StudyUpdate): The study update data.
        user_id (str): The ID of the user (injected by Depends).
        study (dict): The current study (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        JSONResponse: A JSON response containing the public URL if updated.
    """

    public_url = study_service.update_study_settings(
        study_id, data.dict(exclude_unset=True), user_id, study, storage
    )

    return JSONResponse(
        content={"public_url": public_url},
        status_code=status.HTTP_200_OK,
    )


@router.delete("/{study_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study(
    study_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> Response:
    """
    Delete a study and all its history items from the database and search index.

    Args:
        study_id (str): The ID of the study.
        user_id (str): The ID of the user (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        Response: A response with status code 204 (No Content).
    """

    storage.delete_study(user_id, study_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
