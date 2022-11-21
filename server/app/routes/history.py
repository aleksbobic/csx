from fastapi import APIRouter
from pydantic import BaseModel
import app.services.study.history as csx_history


router = APIRouter()


class HistoryDeleteData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_indexes: list


@router.post("/delete")
def delete_item(data: HistoryDeleteData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_indexes = data.history_item_indexes

    csx_history.delete_history_item(study_uuid, user_uuid, history_item_indexes)

    return
