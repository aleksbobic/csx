from fastapi import APIRouter
from pydantic import BaseModel
import app.services.study.study as csx_study
import app.services.data.mongo as csx_data
from bson import ObjectId

router = APIRouter()


@router.get("/")
def get_item(study_uuid: str, item_uuid: str, uuid: str):
    return


@router.get("/insert")
def insert_item(study_uuid: str, item_uuid: str, uuid: str):
    return


class HistoryDeleteData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_indexes: list


@router.post("/delete")
def delete_item(data: HistoryDeleteData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_indexes = data.history_item_indexes

    study_entry = list(
        csx_data.get_all_documents_by_conditions(
            "studies",
            {"$and": [{"study_uuid": study_uuid}, {"user_uuid": user_uuid}]},
            {"_id": 0},
        )
    )[0]

    # csx_data.delete_documents(
    #     "history", {"_id": {"$in": [ObjectId(item) for item in history_item_indexes]}}
    # )

    for item_id in history_item_indexes:
        csx_data.delete_large_document(ObjectId(item_id))

    csx_data.update_document(
        "studies",
        {"study_uuid": study_uuid, "user_uuid": user_uuid},
        {
            "$set": {
                "history": [
                    entry
                    for entry in study_entry["history"]
                    if str(entry["item_id"]) not in history_item_indexes
                ]
            }
        },
    )

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
    comment_time: str


@router.post("/editcomment")
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
