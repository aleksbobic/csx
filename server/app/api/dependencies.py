import os
from typing import Generator

from app.config import settings
from app.services.search.base import BaseSearchConnector
from app.services.search.elastic_search_connector import ElasticSearchConnector
from app.services.search.external.base import BaseExternalSearchConnector
from app.services.search.external.openalex_connector import OpeanAlexSearchConnector
from app.services.search.mongo_search_connector import MongoSearchConnector
from app.services.storage.base import BaseStorageConnector
from app.services.storage.mongo_storage_connector import MongoStorageConnector
from fastapi import Depends, Header, HTTPException, status
from typing_extensions import Annotated


def verify_user_exists(user_id: Annotated[str, Header(convert_underscores=False)]):
    """Get the user_id from the request header and verify that the user exists."""

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user_id


def get_storage_connector() -> Generator[BaseStorageConnector, None, None]:
    """Get a connector to the storage backend"""

    try:
        connector = MongoStorageConnector()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not connect to storage backend: {e}",
        )

    try:
        yield connector
    finally:
        connector.disconnect()


def initiate_search_connector():
    if settings.search_source == "mongo":
        print("Using mongo search connector")
        return MongoSearchConnector()

    print("Using elastic search connector")
    return ElasticSearchConnector()


def get_search_connector() -> Generator[BaseSearchConnector, None, None]:
    """Get a connector to the search backend"""

    try:
        connector = initiate_search_connector()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not connect to search backend: {e}",
        )

    try:
        yield connector
    finally:
        connector.disconnect()


def get_external_search_connector() -> (
    Generator[BaseExternalSearchConnector, None, None]
):
    yield OpeanAlexSearchConnector()


def get_current_study(
    study_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> dict:
    """Get the study_id from the request header and verify that the study exists."""

    if not study_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    study = storage.get_study(user_id, study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    return study
