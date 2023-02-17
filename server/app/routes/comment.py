from fastapi import APIRouter
from pydantic import BaseModel
import app.services.study.study as csx_study
import app.services.data.mongo as csx_data
from bson import ObjectId
from typing import Union

router = APIRouter()


class HistoryCommentData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment: str
    comment_time: str
    screenshot: Union[str, None]
    screenshot_width: Union[int, None]
    screenshot_height: Union[int, None]
    screenshot_x_offset: Union[int, None]
    chart: Union[str, None]


@router.post("/")
def add_comment(data: HistoryCommentData):
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
        data.screenshot_x_offset,
        data.chart
    )

    return


class HistoryDeleteCommentData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment_index: int


@router.post("/delete")
def delete_comment(data: HistoryDeleteCommentData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_index = data.history_item_index
    comment_index = data.comment_index

    csx_study.delete_comment(study_uuid, user_uuid, history_item_index, comment_index)

    return


class HistoryEditCommentData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment_index: int
    comment: str
    comment_time: str


@router.post("/edit")
def edit_comment(data: HistoryEditCommentData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_index = data.history_item_index
    comment_index = data.comment_index
    comment = data.comment
    comment_time = data.comment_time

    csx_study.edit_comment(
        study_uuid, user_uuid, history_item_index, comment_index, comment, comment_time
    )

    return
