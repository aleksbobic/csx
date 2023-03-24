from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import app.services.study.study as csx_study
import app.services.data.mongo as csx_data
from bson import ObjectId
from typing import Union
from .auth import verify_user_exists

router = APIRouter(
    prefix="/studies/{study_id}/history/{history_item_id}/comments", tags=["comments"]
)


class Comment(BaseModel):
    comment: str
    comment_time: str
    screenshot: Union[str, None]
    screenshot_width: Union[int, None]
    screenshot_height: Union[int, None]
    chart: Union[str, None]


@router.post("/")
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


@router.delete("/{comment_id}")
def delete_comment(
    study_id: str,
    history_item_id: str,
    comment_id: str,
    user_id: str = Depends(verify_user_exists),
):

    csx_study.delete_comment(study_id, user_id, history_item_id, comment_id)

    return


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
):

    csx_study.edit_comment(
        study_id, user_id, history_item_id, comment_id, **data.dict()
    )

    return
