import uuid
import json

import app.services.data.mongo as csx_data

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_study(study_uuid: str, user_uuid: str):
    return


@router.get("/saved")
def get_studies(user_uuid: str):
    saved_studies = list(
        csx_data.get_all_documents_by_conditions(
            "studies", {"$and": [{"user_uuid": user_uuid}, {"saved": True}]}, {"_id": 0}
        )
    )

    return [
        {
            "study_uuid": study["study_uuid"],
            "study_description": study["study_description"],
            "study_name": study["study_name"],
        }
        for study in saved_studies
    ]


@router.get("/generate")
def generate_study(user_uuid: str, study_name: str) -> str:
    print("study name is", study_name)
    print("user id is", user_uuid)
    study_uuid = uuid.uuid4().hex
    csx_data.insert_document(
        "studies",
        {
            "study_uuid": study_uuid,
            "user_uuid": user_uuid,
            "study_name": study_name,
            "study_description": "",
            "saved": False,
            "history": [],
        },
    )
    return study_uuid


@router.get("/update")
def update_study(
    study_uuid: str, user_uuid: str, study_name: str, study_description: str
):
    csx_data.update_document(
        "studies",
        {"study_uuid": study_uuid, "user_uuid": user_uuid},
        {
            "$set": {
                "study_name": study_name,
                "study_description": study_description,
                "saved": True,
            }
        },
    )
    return


@router.get("/save")
def save_study(study_uuid: str, user_uuid: str):
    csx_data.update_document(
        "studies",
        {"study_uuid": study_uuid, "user_uuid": user_uuid},
        {"$set": {"saved": True}},
    )
    return


@router.get("/delete")
def delete_study(study_uuid: str, user_uuid: str):
    csx_data.delete_document(
        "studies", {"study_uuid": study_uuid, "user_uuid": user_uuid}
    )
    # TODO: Delete also history items if there are any
    return
