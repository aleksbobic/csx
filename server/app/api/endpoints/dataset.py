import ast
import itertools
import json
import os
from os.path import exists
from typing import Union

import app.services.graph.nodes as csx_nodes
import app.services.search.autocomplete as csx_auto
import pandas as pd
import polars as pl
from app.api.dependencies import get_search_connector, get_storage_connector
from app.config import settings
from app.schemas.dataset import SettingsCreate, SettingsUpdate
from app.services.search.base import BaseSearchConnector
from app.services.storage.base import BaseStorageConnector
from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, status

router = APIRouter(prefix="/datasets", tags=["datasets"])


@router.get("/", status_code=status.HTTP_200_OK)
def get_datasets(
    search: BaseSearchConnector = Depends(get_search_connector),
    storage: BaseStorageConnector = Depends(get_storage_connector),
) -> dict:
    """Get list of all datasets and their schemas if they have one"""

    datasets = {}

    for index in search.get_all_datasets():
        if not search.get_dataset_features(index):
            continue

        config = storage.get_config(index)

        if not config:
            continue

        datasets[index] = {"types": config["dimension_types"]}
        datasets[index]["schemas"] = config["schemas"]
        datasets[index]["default_schemas"] = config["default_schemas"]
        datasets[index]["anchor"] = config["anchor"]
        datasets[index]["links"] = config["links"]
        datasets[index]["default_search_fields"] = config["default_search_fields"]

        datasets[index]["search_hints"] = {
            feature: config["search_hints"][feature]
            for feature in config["search_hints"]
            if config["dimension_types"][feature] in ["integer", "float", "category"]
        }

    return datasets


@router.post("/", status_code=status.HTTP_201_CREATED)
def upload_dataset(file: UploadFile):
    """Upload a dataset to the server"""

    if settings.disable_upload or not file.filename:
        return {}

    data = pl.read_csv(file.file)

    column_types = {column: get_column_type(data[column]) for column in data.schema}

    if not os.path.exists("./app/data/files"):
        os.makedirs("./app/data/files")

    data.write_csv(f'./app/data/files/{file.filename.rpartition(".")[0]}.csv')

    return {"name": file.filename.rpartition(".")[0], "columns": column_types}


def get_column_type(column: pl.Series):
    not_null_rows = column.filter(~column.is_null())

    if column.dtype == pl.Utf8:
        if not_null_rows[0][0] == "[" and not_null_rows[0][-1] == "]":
            return "list"
        if column.n_unique() < 10:
            return "category"
        return "string"

    if column.dtype in [pl.Float32, pl.Float64]:
        return "float"

    return "integer"


@router.delete("/{dataset_name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_name: str,
    storage: BaseStorageConnector = Depends(get_storage_connector),
    search: BaseSearchConnector = Depends(get_search_connector),
):
    config = storage.get_config(dataset_name)

    if config:
        search.delete_dataset(dataset_name)
        storage.delete_dataset(dataset_name)

        if exists(f"./app/data/autocomplete/auto_{dataset_name}"):
            os.remove(f"./app/data/autocomplete/auto_{dataset_name}")

            for dim in config["dimension_types"]:
                if exists(f"./app/data/autocomplete/auto_{dataset_name}_{dim}"):
                    os.remove(f"./app/data/autocomplete/auto_{dataset_name}_{dim}")

            storage.delete_config(dataset_name)
    else:
        os.remove(f"./app/data/files/{dataset_name}.csv")

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{dataset_name}/settings", status_code=status.HTTP_200_OK)
def get_dataset_settings(
    dataset_name: str, storage: BaseStorageConnector = Depends(get_storage_connector)
):
    """Get settings for a dataset"""

    config = storage.get_config(dataset_name)

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dataset config not found"
        )
    return {"config": config}


@router.post("/{dataset_name}/settings", status_code=status.HTTP_201_CREATED)
def save_dataset_settings(
    dataset_name: str,
    data: SettingsCreate,
    storage: BaseStorageConnector = Depends(get_storage_connector),
    search: BaseSearchConnector = Depends(get_search_connector),
):
    """Save settings for a dataset to the server and generate a config file for it to be used by the frontend and backend later on in the process of creating a study."""
    defaults = data.defaults

    # Generate default config
    config = {
        "default_visible_dimensions": get_default_visible_dimensions(defaults),
        "anchor": defaults[data.anchor]["name"],
        "links": get_default_link_dimensions(defaults),
        "dimension_types": get_dimension_types(defaults),
        "default_search_fields": get_default_searchable_dimensions(defaults),
        "schemas": [{"name": "default", "relations": []}],
        "default_schemas": data.default_schemas,
    }

    dest_type = config["dimension_types"][get_default_link_dimensions(defaults)[0]]
    src_type = config["dimension_types"][defaults[data.anchor]["name"]]

    initial_relationship = {
        "dest": get_default_link_dimensions(defaults)[0],
        "src": defaults[data.anchor]["name"],
        "relationship": generate_initial_detail_relationship(src_type, dest_type),
    }

    config["schemas"][0]["relations"].append(initial_relationship)

    dataset = pd.read_csv(f"./app/data/files/{dataset_name}.csv", lineterminator="\n")

    rename_mapping = get_renamed_dimensions(defaults)
    if bool(rename_mapping):
        dataset.rename(columns=rename_mapping, inplace=True)

    config["search_hints"] = {
        feature: get_dimension_search_hints(dataset, feature, feature_type)
        for feature, feature_type in config["dimension_types"].items()
        if feature_type != "string"
    }

    storage.insert_config({"dataset_name": data.name, **config})

    try:
        search.insert_dataset(data.name, config, dataset)
    except Exception as exception:
        os.remove(f"./app/data/files/{dataset_name}.csv")
        search.delete_dataset(data.name)
        storage.delete_dataset(data.name)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dataset upload failed: {exception}",
        )

    list_properties = [
        key for key, value in config["dimension_types"].items() if value == "list"
    ]

    if len(list_properties) > 0:
        print("***** Retrieving elastic")
        elastic_list_df = search.get_full_dataset(data.name)
        print("***** Generating nodes")
        nodes, entries_with_nodes = csx_nodes.get_nodes(elastic_list_df)

        print("***** Generating mongo nodes")

        list_nodes = [node for node in nodes if node["feature"] in list_properties]

        print("***** Populating mongo")
        storage.insert_nodes(data.name, list_nodes)
    else:
        print("***** Skipped populating mongo")

    string_properties = [
        key for key, value in config["dimension_types"].items() if value == "string"
    ]

    for prop in string_properties:
        csx_auto.generate_auto_index(
            data.name, prop, dataset[prop].astype(str).to_list()
        )

    for prop in list_properties:
        unique_entries = list(
            set(
                itertools.chain.from_iterable(
                    [
                        entry.lstrip("[").rstrip("]").replace("'", "").split(", ")
                        for entry in dataset[prop].astype(str).to_list()
                    ]
                )
            )
        )

        csx_auto.generate_list_auto_index(data.name, prop, unique_entries)

    string_search_fields = []
    other_search_fields = []

    for search_field in config["default_search_fields"]:
        if config["dimension_types"][search_field] == "string":
            string_search_fields.append(search_field)
        else:
            other_search_fields.append(search_field)

    csx_auto.generate_main_auto_index(
        data.name, other_search_fields, string_search_fields, dataset
    )

    os.remove(f"./app/data/files/{dataset_name}.csv")

    return {"status": "success"}


def get_dimension_search_hints(dataset, feature, feature_type):
    if feature_type == "integer":
        return {
            "min": int(dataset[feature].min()),
            "max": int(dataset[feature].max()),
        }
    if feature_type == "float":
        return {
            "min": float(dataset[feature].min()),
            "max": float(dataset[feature].max()),
        }
    if feature_type == "category":
        return {"values": list(dataset[feature].dropna().unique())}
    if feature_type == "list":
        return {
            "values": sorted(
                list(
                    set(
                        itertools.chain.from_iterable(
                            dataset[feature].apply(transform_to_list).tolist()
                        )
                    )
                )
            )
        }


def get_default_visible_dimensions(defaults):
    visible_dimensions = []

    for key in defaults:
        if defaults[key]["isDefaultVisible"]:
            visible_dimensions.append(defaults[key]["name"])

    return visible_dimensions


def get_default_searchable_dimensions(defaults):
    searchable_dimensions = []

    for key in defaults:
        if defaults[key]["isDefaultSearch"]:
            searchable_dimensions.append(defaults[key]["name"])

    return searchable_dimensions


def get_default_link_dimensions(defaults):
    link_dimensions = []

    for key in defaults:
        if defaults[key]["isDefaultLink"]:
            link_dimensions.append(defaults[key]["name"])

    return link_dimensions


def get_remove_row_if_null_dimensions(defaults):
    remove_row_if_null_dimensions = []

    for key in defaults:
        if defaults[key]["removeIfNull"]:
            remove_row_if_null_dimensions.append(defaults[key]["name"])

    return remove_row_if_null_dimensions


def get_renamed_dimensions(defaults):
    dimension_name_mapping = {}

    for key in defaults:
        if defaults[key]["name"] != key:
            dimension_name_mapping[key] = defaults[key]["name"]

    return dimension_name_mapping


def get_dimension_types(defaults):
    return {defaults[key]["name"]: defaults[key]["dataType"] for key in defaults}


def transform_to_list(raw_entry: Union[str, None]) -> list:
    if not isinstance(raw_entry, str):
        return []

    return [
        entry.lstrip("'").rstrip("'")
        for entry in raw_entry.lstrip("[").rstrip("]").split("', '")
    ]


def generate_initial_detail_relationship(src_type: str, dest_type: str):
    # Generates initial detail schema relationship based on source and destination type
    if src_type == "list" and dest_type == "list":
        return "manyToMany"

    if src_type == "list" and dest_type != "list":
        return "ManyToOne"

    if src_type != "list" and dest_type == "list":
        return "oneToMany"

    return "oneToOne"


def convert_entry_with_nodes_to_mongo(entry, key, list_props):
    new_entries = []

    for prop in entry:
        if prop["feature"] in list_props:
            prop["esid"] = key
            new_entries.append(prop)

    return new_entries


@router.put("/{dataset_name}/settings", status_code=status.HTTP_200_OK)
def update_dataset_settings(
    dataset_name: str,
    data: SettingsUpdate,
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    defaults = data.defaults
    schemas = []
    search_hints = {}
    initial_relationship = {}

    config = storage.get_config(dataset_name)

    schemas = config["schemas"]
    search_hints = config["search_hints"]
    default_schemas = config["default_schemas"]

    dest_type = config["dimension_types"][get_default_link_dimensions(defaults)[0]]
    src_type = config["dimension_types"][defaults[data.anchor]["name"]]

    initial_relationship = {
        "dest": get_default_link_dimensions(defaults)[0],
        "src": defaults[data.anchor]["name"],
        "relationship": "",
    }

    if src_type == "list" and dest_type == "list":
        initial_relationship["relationship"] = "manyToMany"
    elif src_type == "list" and dest_type != "list":
        initial_relationship["relationship"] = "ManyToOne"
    elif src_type != "list" and dest_type == "list":
        initial_relationship["relationship"] = "oneToMany"
    else:
        initial_relationship["relationship"] = "oneToOne"

    # Generate default config
    config = {
        "default_visible_dimensions": get_default_visible_dimensions(defaults),
        "anchor": data.anchor,
        "links": get_default_link_dimensions(defaults),
        "dimension_types": get_dimension_types(defaults),
        "default_search_fields": get_default_searchable_dimensions(defaults),
        "schemas": [{"name": "default", "relations": [initial_relationship]}],
        "default_schemas": default_schemas,
        "search_hints": search_hints,
    }

    storage.update_config(dataset_name, config)

    return Response(status_code=status.HTTP_200_OK)
