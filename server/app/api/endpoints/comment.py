from typing import Union

import app.services.study.study as csx_study
from app.api.dependencies import (
    get_current_study,
    get_storage_connector,
    verify_user_exists,
)
from app.services.storage.base import BaseStorageConnector
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel

router = APIRouter(
    prefix=("/studies/{study_id}/history/{history_item_id}/comments"), tags=["comments"]
)


class Comment(BaseModel):
    comment: str
    comment_time: str
    screenshot: Union[str, None]
    screenshot_width: Union[int, None]
    screenshot_height: Union[int, None]
    chart: Union[str, None]


@router.post("/", status_code=status.HTTP_201_CREATED)
def add_comment(
    data: Comment,
    study_id: str,
    history_item_id: str,
    user_id: str = Depends(verify_user_exists),
):
    study = csx_study.get_study(user_id, study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study not found",
        )

    csx_study.add_comment(study_id, user_id, history_item_id, **data.dict())

    return


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    study_id: str,
    history_item_id: str,
    comment_id: str,
    user_id: str = Depends(verify_user_exists),
    study: dict = Depends(get_current_study),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    storage.delete_comment(user_id, study_id, history_item_id, comment_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)


class EditComment(BaseModel):
    comment: str
    comment_time: str
    screenshot: Union[str, None]
    screenshot_width: Union[int, None]
    screenshot_height: Union[int, None]
    chart: Union[str, None]


@router.put("/{comment_id}")
def edit_comment(
    data: EditComment,
    study_id: str,
    history_item_id: str,
    comment_id: str,
    user_id: str = Depends(verify_user_exists),
    study: dict = Depends(get_current_study),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    storage.edit_comment(study_id, user_id, history_item_id, comment_id, **data.dict())

    return Response(status_code=status.HTTP_200_OK)
