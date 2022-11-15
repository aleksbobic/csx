from fastapi import APIRouter
from pydantic import BaseModel
import app.services.study.study as csx_study

router = APIRouter()


@router.get("/")
def get_item(study_uuid: str, item_uuid: str, uuid: str):
    return


@router.get("/insert")
def insert_item(study_uuid: str, item_uuid: str, uuid: str):
    return


@router.get("/delete")
def delete_item(study_uuid: str, item_uuid: str, uuid: str):
    return


class HistoryCommentData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment: str
    comment_time: str


@router.post("/comment")
def add_comment(data: HistoryCommentData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_index = data.history_item_index
    comment = data.comment
    comment_time = data.comment_time

    csx_study.add_comment(
        study_uuid, user_uuid, history_item_index, comment, comment_time
    )

    return


class HistoryDeleteCommentData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_index: int
    comment_index: int


@router.post("/deletecomment")
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


@router.post("/editcomment")
def edit_comment(data: HistoryEditCommentData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_index = data.history_item_index
    comment_index = data.comment_index
    comment = data.comment

    csx_study.edit_comment(
        study_uuid, user_uuid, history_item_index, comment_index, comment
    )

    return
