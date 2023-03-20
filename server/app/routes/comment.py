from fastapi import APIRouter
from pydantic import BaseModel
import app.services.study.study as csx_study
import app.services.data.mongo as csx_data
from bson import ObjectId
from typing import Union

router = APIRouter(prefix="/comments", tags=["comments"])


class Comment(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment: str
    comment_time: str
    screenshot: Union[str, None]
    screenshot_width: Union[int, None]
    screenshot_height: Union[int, None]
    chart: Union[str, None]


@router.post("/")
def add_comment(data: Comment):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_index = data.history_item_index
    comment = data.comment
    comment_time = data.comment_time

    csx_study.add_comment(
        study_uuid,
        user_uuid,
        history_item_index,
        comment,
        comment_time,
        data.screenshot,
        data.screenshot_width,
        data.screenshot_height,
        data.chart,
    )

    return


class DeleteComment(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment_index: int


@router.delete("/")
def delete_comment(data: DeleteComment):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_index = data.history_item_index
    comment_index = data.comment_index

    csx_study.delete_comment(study_uuid, user_uuid, history_item_index, comment_index)

    return


class EditComment(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment_index: int
    comment: str
    comment_time: str
    screenshot: Union[str, None]
    screenshot_width: Union[int, None]
    screenshot_height: Union[int, None]
    chart: Union[str, None]


@router.put("/")
def edit_comment(data: EditComment):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_index = data.history_item_index
    comment_index = data.comment_index
    comment = data.comment
    comment_time = data.comment_time

    csx_study.edit_comment(
        study_uuid,
        user_uuid,
        history_item_index,
        comment_index,
        comment,
        comment_time,
        data.screenshot,
        data.screenshot_width,
        data.screenshot_height,
        data.chart,
    )

    return
