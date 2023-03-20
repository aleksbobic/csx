from fastapi import APIRouter
from pydantic import BaseModel
import app.services.study.history as csx_history
import app.services.study.study as csx_study


router = APIRouter(prefix="/history", tags=["history"])


class HistoryDeleteData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_item_indexes: list


@router.delete("/")
def delete_history_items(data: HistoryDeleteData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_item_indexes = data.history_item_indexes

    csx_history.delete_history_item(study_uuid, user_uuid, history_item_indexes)

    return


@router.get("/")
def get_study_history(study_uuid: str, user_uuid: str):
    study = csx_study.get_study(user_uuid, study_uuid)
    if study:
        history = csx_study.extract_history_items(study)
        return {
            "name": study["study_name"],
            "author": study["study_author"] if "study_author" in study else "",
            "description": study["study_description"],
            "history": history,
            "empty": False,
        }
    else:
        return {"empty": True}


@router.get("/public")
def get_public_study_history(public_study_uuid: str):
    study = csx_study.get_public_study(public_study_uuid)
    if study:
        history = csx_study.extract_history_items(study)
        return {
            "name": study["study_name"],
            "author": study["study_author"] if "study_author" in study else "",
            "description": study["study_description"],
            "history": history,
            "empty": False,
        }
    else:
        return {"empty": True}
