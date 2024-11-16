from typing import Dict

import polars as pl
from app.api.dependencies import (
    get_external_search_connector,
    get_search_connector,
    get_storage_connector,
)
from app.config import settings
from app.services.search.base import BaseSearchConnector
from app.services.search.external.base import BaseExternalSearchConnector
from app.services.storage.base import BaseStorageConnector
from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, status
from fastapi.responses import JSONResponse

from . import service as ds_service
from .schemas import DatasetSettings, DatasetSettingsFull

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("", status_code=status.HTTP_200_OK)
def get_datasets(
    search: BaseSearchConnector = Depends(get_search_connector),
    search_external: BaseExternalSearchConnector = Depends(
        get_external_search_connector
    ),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> Dict[str, Dict]:
    """
    Get list of all datasets and their schemas if they have one.

    Args:
        search (BaseSearchConnector): The search connector (injected by Depends).
        search_external (BaseExternalSearchConnector): The external search connector (injected by Depends).
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        Dict[str, Dict]: A dictionary of datasets and their configurations.
    """
    datasets = ds_service.get_local_ds_props(search, storage)

    if settings.show_external_sources:
        datasets["openalex"] = ds_service.get_external_ds_props(search_external)

    return datasets


@router.post("", status_code=status.HTTP_201_CREATED)
def upload_dataset(file: UploadFile) -> JSONResponse:
    """
    Upload a dataset to the server.

    Args:
        file (UploadFile): The uploaded file.

    Returns:
        JSONResponse: A response containing the name of the dataset and its column types.
    """
    if settings.disable_upload:
        return JSONResponse(
            content={"detail": "File uploads are disabled."},
            status_code=status.HTTP_403_FORBIDDEN,
        )

    if not file.filename:
        return JSONResponse(
            content={"detail": "No file uploaded."},
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    try:
        data = pl.read_csv(file.file)
        ds_service.write_ds_to_disk(data, file)
        column_types = ds_service.get_column_types(data)

        return JSONResponse(
            content={"name": file.filename.rpartition(".")[0], "columns": column_types},
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload dataset",
        )


@router.delete("/{ds_name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    ds_name: str,
    storage: BaseStorageConnector = Depends(get_storage_connector),
    search: BaseSearchConnector = Depends(get_search_connector),
) -> Response:
    """
    Delete a dataset from the server.

    Args:
        ds_name (str): The name of the dataset to delete.
        storage (BaseStorageConnector): The storage connector (injected by Depends).
        search (BaseSearchConnector): The search connector (injected by Depends).

    Returns:
        Response: A response with status code 204 (No Content).
    """
    try:
        ds_service.delete_dataset(ds_name, storage, search)

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete dataset",
        )


@router.get("/{ds_name}/settings", status_code=status.HTTP_200_OK)
def get_dataset_settings(
    ds_name: str, storage: BaseStorageConnector = Depends(get_storage_connector)
) -> JSONResponse:
    """
    Get settings for a dataset.

    Args:
        ds_name (str): The name of the dataset.
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        JSONResponse: A JSON response containing the dataset settings.

    Raises:
        HTTPException: If the dataset config is not found.
    """
    config = storage.get_config(ds_name)

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset config not found"
        )
    return JSONResponse(content={"config": config}, status_code=status.HTTP_200_OK)


@router.post("/{ds_name}/settings", status_code=status.HTTP_201_CREATED)
async def save_dataset_settings(
    ds_name: str,
    data: DatasetSettingsFull,
    storage: BaseStorageConnector = Depends(get_storage_connector),
    search: BaseSearchConnector = Depends(get_search_connector),
) -> JSONResponse:
    """
    Save settings for a dataset to the server and generate a config file for it to be used by the frontend and backend later on in the process of creating a study.

    Args:
        ds_name (str): The name of the dataset.
        data (DatasetSettingsFull): The dataset settings.
        storage (BaseStorageConnector): The storage connector (injected by Depends).
        search (BaseSearchConnector): The search connector (injected by Depends).

    Returns:
        Response: A response object indicating the status of the operation.
    """
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided"
        )

    try:
        ds_service.save_ds_settings(ds_name, data, storage, search)
        return JSONResponse(
            content={"status": "success"}, status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save dataset settings: {str(e)}",
        )


@router.put("/{ds_name}/settings", status_code=status.HTTP_200_OK)
def update_dataset_settings(
    ds_name: str,
    data: DatasetSettings,
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> Response:
    """
    Update settings for a dataset.

    Args:
        ds_name (str): The name of the dataset.
        data (DatasetSettings): The dataset settings.
        storage (BaseStorageConnector): The storage connector (injected by Depends).

    Returns:
        Response: A response with status code 200 (OK).
    """
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided"
        )

    try:
        config = storage.get_config(ds_name)

        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Dataset config not found"
            )

        config = ds_service.update_config_with_defaults(config, data, data.anchor)

        storage.update_config(ds_name, config)

        return Response(status_code=status.HTTP_200_OK)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update dataset settings: {str(e)}",
        )
