import os
from typing import Dict, List, Union

import polars as pl
from app.services.search.base import BaseSearchConnector
from app.services.storage.base import BaseStorageConnector
from fastapi import HTTPException, UploadFile, status

from .schema import DatasetSettingsFull


def delete_dataset_files(
    dataset_name: str, config: Dict, path_base: str = "./app/data/autocomplete/auto_"
) -> None:
    """
    Delete dataset files from the server.

    Args:
        dataset_name (str): The name of a dataset.
        config (Dict): a dataset configuration.
    """
    delete_file(f"{path_base}{dataset_name}")

    for dimension in config["dimension_types"]:
        delete_file(f"{path_base}{dataset_name}_{dimension}")


def delete_file(file_path: str) -> None:
    """
    Delete a file if it exists.

    Args:
        file_path (str): The path to the file to delete.
    """
    if os.path.exists(file_path):
        os.remove(file_path)


def generate_default_config(data: DatasetSettingsFull) -> Dict:
    """
    Generate the default configuration for a dataset.

    Args:
        data (DatasetSettingsFull): a dataset settings.

    Returns:
        Dict: The default configuration for a dataset.
    """
    try:
        config = {
            "default_visible_dimensions": get_default_visible_dimensions(data.defaults),
            "anchor": data.defaults[data.anchor].name,
            "links": get_default_link_dimensions(data.defaults),
            "dimension_types": get_dimension_types(data.defaults),
            "default_search_fields": get_default_searchable_dimensions(data.defaults),
            "schemas": [{"name": "default", "relations": []}],
            "default_schemas": data.default_schemas,
        }

        dest_type = config["dimension_types"][
            get_default_link_dimensions(data.defaults)[0]
        ]
        src_type = config["dimension_types"][data.defaults[data.anchor].name]

        initial_relationship = {
            "dest": get_default_link_dimensions(data.defaults)[0],
            "src": data.defaults[data.anchor].name,
            "relationship": generate_initial_detail_relationship(src_type, dest_type),
        }

        config["schemas"][0]["relations"].append(initial_relationship)

        return config
    except KeyError as e:
        raise ValueError(f"Missing key in dataset defaults: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Failed to generate default config: {str(e)}")


def get_default_visible_dimensions(defaults) -> List[str]:
    """
    Extracts the names of default visible dimensions from the given dictionary.

    Args:
        defaults (dict): A dictionary where each key maps to a dictionary containing dimension details.

    Returns:
        List[str]: A list of names of dimensions that are marked as default visible.
    """
    return [
        defaults[key]["name"] for key in defaults if defaults[key]["isDefaultVisible"]
    ]


def get_default_link_dimensions(defaults) -> List[str]:
    """
    Extracts the names of default link dimensions from the given dictionary.

    Args:
        defaults (dict): A dictionary where each key maps to a dictionary containing dimension details.

    Returns:
        List[str]: A list of names of dimensions that are marked as default link.
    """
    return [defaults[key]["name"] for key in defaults if defaults[key]["isDefaultLink"]]


def get_dimension_types(defaults: dict) -> dict:
    """
    Extracts dimension names and their corresponding data types from the given dictionary.

    Args:
        defaults (dict): A dictionary where each key maps to a dictionary containing dimension details.

    Returns:
        dict: A dictionary where keys are dimension names and values are their data types.
    """
    return {defaults[key]["name"]: defaults[key]["dataType"] for key in defaults}


def generate_initial_detail_relationship(src_type: str, dest_type: str) -> str:
    """
    Generates initial detail schema relationship based on source and destination type.

    Args:
        src_type (str): The type of the source entity (e.g., "list").
        dest_type (str): The type of the destination entity (e.g., "list").

    Returns:
        str: The relationship type, which can be "manyToMany", "ManyToOne", "oneToMany", or "oneToOne".
    """
    if src_type == "list" and dest_type == "list":
        return "manyToMany"

    if src_type == "list" and dest_type != "list":
        return "ManyToOne"

    if src_type != "list" and dest_type == "list":
        return "oneToMany"

    return "oneToOne"


def get_default_searchable_dimensions(defaults: dict) -> list:
    """
    Extracts the names of default searchable dimensions from the given dictionary.

    Args:
        defaults (dict): A dictionary where each key maps to a dictionary containing dimension details.

    Returns:
        list: A list of names of dimensions that are marked as default searchable.
    """
    return [
        value["name"] for key, value in defaults.items() if value.get("isDefaultSearch")
    ]


def handle_dataset_upload_failure(
    dataset_name: str,
    search: BaseSearchConnector,
    storage: BaseStorageConnector,
    exception: Exception,
) -> None:
    """
    Handle dataset upload failure by cleaning up and raising an HTTP exception.

    Args:
        dataset_name (str): The name of a dataset.
        search (BaseSearchConnector): The search connector.
        storage (BaseStorageConnector): The storage connector.
        exception (Exception): The exception that occurred.

    Raises:
        HTTPException: An HTTP exception with status code 500.
    """
    os.remove(f"./app/data/files/{dataset_name}.csv")
    search.delete_dataset(dataset_name)
    storage.delete_dataset(dataset_name)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Dataset upload failed: {exception}",
    )


def get_remove_row_if_null_dimensions(defaults):
    return [defaults[key]["name"] for key in defaults if defaults[key]["removeIfNull"]]


def get_renamed_dimensions(defaults):
    return {
        key: defaults[key]["name"] for key in defaults if defaults[key]["name"] != key
    }


def transform_to_list(raw_entry: Union[str, None]) -> list:
    if not isinstance(raw_entry, str):
        return []

    return [
        entry.lstrip("'").rstrip("'")
        for entry in raw_entry.lstrip("[").rstrip("]").split("', '")
    ]


def convert_entry_with_nodes_to_mongo(entry, key, list_props):
    new_entries = []

    for prop in entry:
        if prop["feature"] in list_props:
            prop["esid"] = key
            new_entries.append(prop)

    return new_entries


def generate_initial_relationship(config: Dict, defaults: Dict, anchor: str) -> Dict:
    """
    Generate the initial relationship for a dataset configuration.

    Args:
        config (Dict): a dataset configuration.
        defaults (Dict): a dataset defaults.
        anchor (str): The anchor dimension.

    Returns:
        Dict: The initial relationship.
    """
    dest_type = config["dimension_types"][get_default_link_dimensions(defaults)[0]]
    src_type = config["dimension_types"][defaults[anchor]["name"]]

    relationship = ""
    if src_type == "list" and dest_type == "list":
        relationship = "manyToMany"
    elif src_type == "list" and dest_type != "list":
        relationship = "ManyToOne"
    elif src_type != "list" and dest_type == "list":
        relationship = "oneToMany"
    else:
        relationship = "oneToOne"

    return {
        "dest": get_default_link_dimensions(defaults)[0],
        "src": defaults[anchor]["name"],
        "relationship": relationship,
    }


def rename_columns(
    pl_dataset: pl.DataFrame, rename_mapping: Dict[str, str]
) -> pl.DataFrame:
    """
    Rename columns in a dataset based on the provided mapping.

    Args:
        pl_dataset (pl.DataFrame): a dataset in Polars DataFrame format.
        rename_mapping (Dict[str, str]): A dictionary where keys are the original column names
                                         and values are the new column names.

    Returns:
        pl.DataFrame: a dataset with renamed columns.
    """

    if rename_mapping:
        pl_dataset = pl_dataset.rename(rename_mapping)
    return pl_dataset


def construct_file_path(base: str, file: UploadFile) -> str:
    """
    Construct the file path for the uploaded file.

    Args:
        file (UploadFile): The uploaded file.

    Returns:
        str: The constructed file path.
    """
    assert isinstance(file.filename, str)
    file_path = os.path.join(base, f'{file.filename.rpartition(".")[0]}.csv')
    return file_path


def create_directories(file_path: str) -> None:
    """
    Create directories if they don't exist.

    Args:
        file_path (str): The file path for the uploaded file.
    """
    if not os.path.exists(os.path.dirname(file_path)):
        os.makedirs(os.path.dirname(file_path))


def get_column_type(column: pl.Series) -> str:
    """
    Determine the type of a column in a dataset.

    Args:
        column (pl.Series): The column to determine the type of.

    Returns:
        str: The type of the column.
    """
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


def get_search_hints(dataset: pl.DataFrame, feature, feature_type):
    """
    Generate search hints for a given feature in a dataset based on its type.

    Parameters:
    dataset (pl.DataFrame): a dataset containing the feature.
    feature (str): The name of the feature to generate hints for.
    feature_type (str): The type of the feature. Can be "integer", "float", "category", or "list".

    Returns:
    dict: A dictionary containing search hints for the feature. The structure of the dictionary
          depends on the feature type:
          - For "integer" and "float": {"min": <minimum_value>, "max": <maximum_value>}
          - For "category": {"values": <list_of_unique_values>}
          - For "list": {"values": <sorted_list_of_unique_values>}
    """

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
        return {
            "values": dataset.lazy()
            .select(feature)
            .drop_nulls()
            .unique()
            .collect()
            .to_numpy()
            .flatten()
            .tolist()
        }
    if feature_type == "list":
        return {
            "values": sorted(
                dataset.lazy()
                .explode(feature)
                .select(feature)
                .drop_nulls()
                .unique()
                .collect()
                .to_numpy()
                .flatten()
                .tolist()
            )
        }
