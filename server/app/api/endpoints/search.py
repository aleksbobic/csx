import app.services.search.autocomplete as csx_auto
from app.api.dependencies import get_external_search_connector
from app.services.search.external.base import BaseExternalSearchConnector
from fastapi import APIRouter, Depends, status

router = APIRouter(prefix="/datasets/{dataset}/search", tags=["search"])


@router.get("/suggest", status_code=status.HTTP_200_OK)
def get_suggestion(
    dataset: str,
    value: str,
    feature: str,
    external_search: BaseExternalSearchConnector = Depends(
        get_external_search_connector
    ),
):
    if dataset == "openalex":
        return external_search.get_suggestions(dataset, value, feature)
    return csx_auto.get_suggestions(dataset, value, feature)
