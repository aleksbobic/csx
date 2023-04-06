from fastapi import APIRouter
import app.services.study.study as csx_study


import app.services.study.study as csx_study


router = APIRouter(prefix="/studies/public", tags=["public"])


@router.get("/{public_study_id}/history")
def get_public_study_history(public_study_id: str):
    study = csx_study.get_public_study(public_study_id)
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
