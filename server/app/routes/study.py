import uuid
import pickle
import os

from pydantic import BaseModel
from typing import Union, Optional
from fastapi import APIRouter, HTTPException, status, Depends

import app.services.data.mongo as csx_data
import app.services.study.study as csx_study
from app.routes.auth import verify_user_exists

from elasticsearch import Elasticsearch

es = Elasticsearch(
    "csx_elastic:9200",
    retry_on_timeout=True,
    http_auth=("elastic", os.getenv("ELASTIC_PASSWORD")),
)

router = APIRouter(prefix="/studies", tags=["studies"])


@router.get("/{study_id}")
def get_study(study_id: str, user_id: str = Depends(verify_user_exists)):

    study = csx_study.get_study(user_id, study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study not found",
        )

    if len(study["history"]) > 0:

        history_id = study["history"][-1]["item_id"]
        charts = study["history"][-1]["charts"]

        history_item = csx_data.get_large_document(history_id)

        history = csx_study.extract_history_items(study)

        graph_type = history[len(history) - 1]["graph_type"]

        return {
            "graph": pickle.loads(history_item)[graph_type],
            "name": study["study_name"],
            "description": study["study_description"],
            "author": study["study_author"] if "study_author" in study else "",
            "history": history,
            "index": study["index"],
            "charts": charts,
            "empty": False,
            "public": study["public"],
            "public_url": study["public_url"],
        }

    return {
        "graph": {},
        "name": study["study_name"],
        "description": study["study_description"],
        "author": study["study_author"] if "study_author" in study else "",
        "history": [],
        "index": study["index"],
        "empty": False,
        "public": study["public"],
        "public_url": study["public_url"],
    }


class CreateStudy(BaseModel):
    study_name: str


@router.post("/")
def create_study(data: CreateStudy, user_id: str = Depends(verify_user_exists)) -> str:
    study_uuid = uuid.uuid4().hex

    csx_data.insert_document(
        "studies",
        {
            "study_uuid": study_uuid,
            "user_uuid": user_id,
            "study_name": data.study_name,
            "study_description": "",
            "saved": False,
            "public": False,
            "public_url": "",
            "index": "",
            "history": [],
        },
    )
    return study_uuid


@router.get("/")
def get_studies(user_id: str = Depends(verify_user_exists)):
    """Get all studies for a user"""

    saved_studies = list(
        csx_data.get_all_documents_by_conditions(
            "studies", {"$and": [{"user_uuid": user_id}, {"saved": True}]}, {"_id": 0}
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


class StudyData(BaseModel):
    public: Optional[bool]
    study_name: Optional[str]
    study_description: Optional[str]
    study_author: Optional[Union[str, None]]


@router.patch("/{study_id}")
def update_study(
    study_id: str, data: StudyData, user_id: str = Depends(verify_user_exists)
) -> str:
    """Update study settings (public, name, description) and return public url if public is set to true for the first time"""
    study = csx_study.get_study(user_id, study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    updated_settings = {**data.dict(exclude_unset=True), "saved": True}

    if not study["public_url"] and data.public:
        updated_settings["public_url"] = uuid.uuid4().hex
    else:
        updated_settings["public_url"] = study["public_url"]

    csx_data.update_document(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        {
            "$set": updated_settings,
        },
    )

    return updated_settings["public_url"] if "public_url" in updated_settings else ""


class DeleteStudyData(BaseModel):
    user_trigger: bool


@router.delete("/{study_id}")
def delete_study(
    study_id: str, data: DeleteStudyData, user_id: str = Depends(verify_user_exists)
):

    if data.user_trigger:
        ## If study deletion is user triggered then delete study no matter if it is saved or not
        study_entry = list(
            csx_data.get_all_documents_by_conditions(
                "studies",
                {
                    "$and": [
                        {"study_uuid": study_id},
                        {"user_uuid": user_id},
                    ]
                },
                {"_id": 0},
            )
        )
    else:
        ## If study deletion is automatic then first check that the study is actually not saved
        study_entry = list(
            csx_data.get_all_documents_by_conditions(
                "studies",
                {
                    "$and": [
                        {"study_uuid": study_id},
                        {"user_uuid": user_id},
                        {"saved": False},
                    ]
                },
                {"_id": 0},
            )
        )

    if len(study_entry) > 0:
        history_ids = [item["item_id"] for item in study_entry[0]["history"]]
        for item_id in history_ids:
            csx_data.delete_large_document(item_id)

    csx_data.delete_document("studies", {"study_uuid": study_id, "user_uuid": user_id})

    return
