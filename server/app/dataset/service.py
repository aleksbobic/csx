import os
from typing import Dict, Union

import app.services.graph.nodes as csx_nodes
import app.services.search.autocomplete as csx_auto
import polars as pl
from app.services.search.base import BaseSearchConnector
from app.services.search.external.base import BaseExternalSearchConnector
from app.services.storage.base import BaseStorageConnector
from fastapi import UploadFile

from . import utils as ds_utils
from .schemas import DatasetSettings, DatasetSettingsFull, FeatureDefaults


def get_local_ds_props(
    search: BaseSearchConnector, storage: BaseStorageConnector
) -> Dict[str, Dict]:
    """
    Create a dictionary of datasets and their configurations from storage.

    Args:
        search (BaseSearchConnector): The search connector.
        storage (BaseStorageConnector): The storage connector.

    Returns:
        Dict[str, Dict]: A dictionary of datasets and their configurations.
    """
    datasets = {}
    ds_names = search.get_all_dataset_names()
    ds_configs = storage.get_configs(ds_names)

    for ds_name in ds_names:
        config = ds_configs.get(ds_name)
        if not config:
            continue

        datasets[ds_name] = get_ds_props(config)

    return datasets


def get_ds_props(config: Dict) -> Dict:
    """
    Create dataset properties from a dataset configuration.

    Args:
        config (Dict): a dataset configuration.

    Returns:
        Dict: a dataset properties
    """

    feature_types = config["dimension_types"]
    search_hints = {
        feature: hint
        for feature, hint in config["search_hints"].items()
        if feature_types[feature] in ["integer", "float", "category"]
    }

    return {
        "types": feature_types,
        "schemas": config["schemas"],
        "default_schemas": config["default_schemas"],
        "anchor": config["anchor"],
        "links": config["links"],
        "default_search_fields": config["default_search_fields"],
        "dataset_type": "uploaded",
        "search_hints": search_hints,
    }


def get_external_ds_props(search_external: BaseExternalSearchConnector) -> Dict:
    """
    Get external dataset properties

    Args:
        search_external (BaseExternalSearchConnector): The external search connector.

    Returns:
        Dict: The external dataset entry.
    """
    external_config = search_external.get_config()
    external_config["types"] = external_config.pop("dimension_types")
    return external_config


def write_ds_to_disk(data: pl.DataFrame, file: UploadFile) -> None:
    """
    Write the contents of an uploaded file to a CSV file on the disk.

    Args:
        file (UploadFile): The uploaded file.
        path (str): The path to write the file to.

    Returns:
        dict[str, str]: The column types of a dataset.
    """

    file_path = ds_utils.construct_file_path("./app/data/files", file)
    ds_utils.create_directories(file_path)
    data.write_csv(file_path)


def get_column_types(data: pl.DataFrame) -> dict[str, str]:
    """
    Get the column types of a dataset from an uploaded file.

    Args:
        file (UploadFile): The uploaded file.

    Returns:
        dict[str, str]: The column types of a dataset.
    """
    column_types = {
        column: ds_utils.get_column_type(data[column]) for column in data.schema
    }
    return column_types


def delete_dataset(
    ds_name: str, storage: BaseStorageConnector, search: BaseSearchConnector
) -> None:
    """
    Delete a dataset from the server.

    Args:
        ds_name (str): The name of a dataset to delete.
        storage (BaseStorageConnector): The storage connector.
        search (BaseSearchConnector): The search connector.
    """
    config = storage.get_config(ds_name)

    if config:
        ds_utils.delete_dataset_files(ds_name, config)
        search.delete_dataset(ds_name)
        storage.delete_dataset(ds_name)
        storage.delete_config(ds_name)
    else:
        ds_utils.delete_file(f"./app/data/files/{ds_name}.csv")


def save_ds_settings(
    ds_name: str,
    data: DatasetSettingsFull,
    storage: BaseStorageConnector,
    search: BaseSearchConnector,
) -> None:
    """
    Save settings for a dataset to the server and generate a config file for it to be used by the frontend and backend later on in the process of creating a study.

    Args:
        ds_name (str): The name of a dataset.
        data (DatasetSettingsFull): a dataset settings.
        storage (BaseStorageConnector): The storage connector.
        search (BaseSearchConnector): The search connector.
    """
    config = ds_utils.generate_default_config(data)
    dataset = pl.read_csv(f"./app/data/files/{ds_name}.csv")

    # Rename columns
    dataset = rename_columns(dataset, data.defaults)

    # Generate search hints
    config["search_hints"] = generate_search_hints(dataset, config)

    storage.insert_config({"dataset_name": data.name, **config})

    try:
        search.insert_dataset(data.name, config, dataset)
    except Exception as exception:
        handle_dataset_upload_failure(ds_name, search, storage, exception)

    # Populate MongoDB with nodes for list properties
    populate_mongo_with_nodes(data.name, search, storage, config)

    # Generate autocomplete indices
    generate_autocomplete_indices(data, dataset, config)

    os.remove(f"./app/data/files/{ds_name}.csv")


def rename_columns(
    pl_dataset: pl.DataFrame, defaults: Dict[str, FeatureDefaults]
) -> pl.DataFrame:
    """
    Rename columns in a dataset based on the provided defaults.

    Args:
        pl_dataset (pl.DataFrame): a dataset in Polars DataFrame format.
        defaults (Dict[str, Dict]): The dictionary containing default values for various settings.

    Returns:
        pl.DataFrame: a dataset with renamed columns.
    """
    rename_mapping = ds_utils.get_renamed_dimensions(defaults)
    return ds_utils.rename_columns(pl_dataset, rename_mapping)


def generate_search_hints(
    pl_dataset: pl.DataFrame, config: Dict
) -> Dict[str, Union[Dict[str, int], Dict[str, float], Dict[str, list], None]]:
    """
    Generate search hints for a dataset based on its configuration.

    Args:
        pl_dataset (pl.DataFrame): a dataset in Polars DataFrame format.
        config (Dict): The configuration dictionary containing dimension types.

    Returns:
        Dict[str, Union[Dict[str, int], Dict[str, float], Dict[str, list], None]]:
            A dictionary where keys are feature names and values are search hints.
            The search hints can be dictionaries with min and max values for numeric types,
            a list of unique values for categorical types, or None for unsupported types.
    """

    return {
        feature: ds_utils.get_search_hints(pl_dataset, feature, feature_type)
        for feature, feature_type in config["dimension_types"].items()
        if feature_type != "string"
    }


def handle_dataset_upload_failure(
    ds_name: str,
    search: BaseSearchConnector,
    storage: BaseStorageConnector,
    exception: Exception,
) -> None:
    """
    Handle dataset upload failure by cleaning up and raising an HTTP exception.

    Args:
        ds_name (str): The name of a dataset.
        search (BaseSearchConnector): The search connector.
        storage (BaseStorageConnector): The storage connector.
        exception (Exception): The exception that occurred.
    """
    ds_utils.handle_dataset_upload_failure(ds_name, search, storage, exception)


def populate_mongo_with_nodes(
    dataset_name: str,
    search: BaseSearchConnector,
    storage: BaseStorageConnector,
    config: Dict,
) -> None:
    """
    Populate MongoDB with nodes for list properties in a dataset.

    Args:
        dataset_name (str): The name of a dataset.
        search (BaseSearchConnector): The search connector.
        storage (BaseStorageConnector): The storage connector.
        config (Dict): The configuration dictionary containing dimension types.
    """
    list_properties = [
        key for key, value in config["dimension_types"].items() if value == "list"
    ]
    if list_properties:
        dataset_df = search.get_full_dataset(dataset_name)
        nodes, _ = csx_nodes.get_nodes(dataset_df)
        list_nodes = [node for node in nodes if node["feature"] in list_properties]
        storage.insert_nodes(dataset_name, list_nodes)


def generate_autocomplete_indices(
    data: DatasetSettingsFull,
    dataset: pl.DataFrame,
    config: Dict,
) -> None:
    """
    Generate autocomplete indices for a dataset.

    Args:
        data (DatasetSettingsFull): a dataset settings.
        pl_dataset (pl.DataFrame): a dataset in Polars DataFrame format.
        config (Dict): The configuration dictionary containing dimension types.
    """
    list_properties = [
        key for key, value in config["dimension_types"].items() if value == "list"
    ]
    string_properties = [
        key for key, value in config["dimension_types"].items() if value == "string"
    ]

    try:
        for feature in string_properties:
            csx_auto.generate_auto_index(
                data.name,
                feature,
                dataset.lazy()
                .select(feature)
                .drop_nulls()
                .unique()
                .collect()
                .to_numpy()
                .flatten()
                .tolist(),
            )

        for feature in list_properties:
            unique_entries = (
                dataset.select(
                    pl.col(feature)
                    .str.lstrip("[")
                    .str.rstrip("]")
                    .str.replace("'", "")
                    .str.split(", ")
                )
                .explode(feature)
                .unique()
                .to_numpy()
                .flatten()
                .tolist()
            )

            csx_auto.generate_list_auto_index(data.name, feature, unique_entries)

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
    except Exception as e:
        raise RuntimeError(f"Failed to generate autocomplete indices: {str(e)}")


def update_config_with_defaults(
    config: Dict, data: DatasetSettings, anchor: str
) -> Dict:
    """
    Update the configuration dictionary with default values and relationships.

    Args:
        config (Dict): The original configuration dictionary to be updated.
        data (DatasetSettings): The dictionary containing default values for various settings.
        anchor (str): The anchor key used to generate the initial relationship.

    Returns:
        Dict: The updated configuration dictionary with default values and relationships.
    """

    defaults = data.defaults

    initial_relationship = ds_utils.generate_initial_relationship(
        config, defaults, anchor
    )

    default_visible_dimensions = ds_utils.get_default_visible_dimensions(defaults)
    default_link_dimensions = ds_utils.get_default_link_dimensions(defaults)
    dimension_types = ds_utils.get_dimension_types(defaults)
    default_search_fields = ds_utils.get_default_searchable_dimensions(defaults)
    schemas = [{"name": "default", "relations": [initial_relationship]}]

    config.update(
        {
            "default_visible_dimensions": default_visible_dimensions,
            "anchor": anchor,
            "links": default_link_dimensions,
            "dimension_types": dimension_types,
            "default_search_fields": default_search_fields,
            "schemas": schemas,
        }
    )
    return config
