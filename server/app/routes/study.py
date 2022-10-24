import uuid

import app.services.data.mongo as csx_data

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_study(study_uuid: str, user_uuid: str):
    return


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
    study_uuid: str, user_uuid: str, study_name: str, study_description=""
):
    return


@router.get("/save")
def save_study(study_uuid: str, user_uuid: str):
    return


@router.get("/delete")
def delete_study(study_uuid: str, user_uuid: str):
    csx_data.delete_document(
        "studies", {"study_uuid": study_uuid, "user_uuid": user_uuid}
    )
    # TODO: Delete also history items if there are any
    return
