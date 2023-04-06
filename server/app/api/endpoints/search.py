from fastapi import APIRouter


import app.services.data.autocomplete as csx_auto

router = APIRouter(prefix="/datasets/{dataset}/search", tags=["search"])


@router.get("/suggest")
def get_suggestion(dataset: str, value: str, feature: str):
    return csx_auto.get_suggestions(dataset, value, feature)
