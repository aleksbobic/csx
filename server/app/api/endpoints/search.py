import app.services.search.autocomplete as csx_auto
from fastapi import APIRouter, status

router = APIRouter(prefix="/datasets/{dataset}/search", tags=["search"])


@router.get("/suggest", status_code=status.HTTP_200_OK)
def get_suggestion(dataset: str, value: str, feature: str):
    return csx_auto.get_suggestions(dataset, value, feature)
