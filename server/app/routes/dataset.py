import itertools
import json
import os
import ast
from typing import List, Literal, Union

import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Q, Search
from fastapi import APIRouter, UploadFile
from pydantic import BaseModel
from os.path import exists
import polars as pl

import app.services.graph.graph as csx_graph
import app.services.data.elastic as csx_es
import app.services.graph.graph as csx_graph
import app.services.graph.nodes as csx_nodes
import app.services.data.autocomplete as csx_auto
import app.services.data.mongo as csx_data
import app.services.study.study as csx_study
from app.utils.typecheck import isJson, isNumber

router = APIRouter(prefix="/datasets", tags=["datasets"])
es = Elasticsearch(
    "csx_elastic:9200",
    retry_on_timeout=True,
    http_auth=("elastic", os.getenv("ELASTIC_PASSWORD")),
)


@router.get("/")
def get_datasets() -> dict:
    """Get list of all datasets and their schemas if they have one"""

    datasets = {}

    for index in csx_es.get_all_indices():
        if "properties" not in csx_es.get_index(index)[index]["mappings"]:
            continue

        with open(f"./app/data/config/{index}.json") as f:
            data = json.load(f)
            datasets[index] = {"types": data["dimension_types"]}

        try:
            with open(f"./app/data/config/{index}.json") as config:
                loaded_config = json.load(config)
                datasets[index]["schemas"] = loaded_config["schemas"]
                datasets[index]["default_schemas"] = loaded_config["default_schemas"]
                datasets[index]["anchor"] = loaded_config["anchor"]
                datasets[index]["links"] = loaded_config["links"]
                datasets[index]["default_search_fields"] = loaded_config[
                    "default_search_fields"
                ]

                datasets[index]["search_hints"] = {
                    feature: json.dumps(loaded_config["search_hints"][feature])
                    for feature in loaded_config["search_hints"]
                    if data["dimension_types"][feature]
                    in ["integer", "float", "category"]
                }
        except Exception as e:
            datasets[index]["schemas"] = []
            datasets[index]["default_schemas"] = []
            datasets[index]["anchor"] = []
            datasets[index]["links"] = []
            datasets[index]["search_hints"] = []
            datasets[index]["default_search_fields"] = []

    return datasets


@router.post("/")
def upload_dataset(file: UploadFile):
    """Upload a dataset to the server"""
    if os.getenv("DISABLE_UPLOAD") == "true" or not file.filename:
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


@router.delete("/{name}")
def delete_dataset(name: str):
    if exists(f"./app/data/config/{name}.json"):
        csx_es.delete_index(name)
        csx_data.delete_collection(name)

        if exists(f"./app/data/autocomplete/auto_{name}"):
            os.remove(f"./app/data/autocomplete/auto_{name}")

            with open(f"./app/data/config/{name}.json") as config:
                config = json.load(config)
                dimension_types = config["dimension_types"]
                for dim in dimension_types:
                    if exists(f"./app/data/autocomplete/auto_{name}_{dim}"):
                        os.remove(f"./app/data/autocomplete/auto_{name}_{dim}")

            os.remove(f"./app/data/config/{name}.json")
    else:
        os.remove(f"./app/data/files/{name}.csv")

    return {"status": "success"}


class SettingsData(BaseModel):
    original_name: str
    name: str
    anchor: str
    defaults: dict
    default_schemas: dict


@router.get("/settings/{name}")
def get_dataset_settings(name: str):
    """Get settings for a dataset"""
    with open(f"./app/data/config/{name}.json") as f:
        data = json.load(f)
        return {"config": data}


@router.post("/settings")
def save_dataset_settings(data: SettingsData):
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

    if not os.path.exists("./app/data/config"):
        os.makedirs("./app/data/config")

    dataset = pd.read_csv(
        f"./app/data/files/{data.original_name}.csv", lineterminator="\n"
    )

    rename_mapping = get_renamed_dimensions(defaults)
    if bool(rename_mapping):
        dataset.rename(columns=rename_mapping, inplace=True)

    columns = get_dimensions(defaults)

    mapping = {
        "mappings": {
            "properties": {
                dim: {"type": get_elastic_type(config["dimension_types"][dim])}
                for dim in config["dimension_types"]
            }
        },
    }

    config["search_hints"] = {
        feature: get_dimension_search_hints(dataset, feature, feature_type)
        for feature, feature_type in config["dimension_types"].items()
        if feature_type != "string"
    }

    with open(f"./app/data/config/{data.name}.json", "w") as f:
        json.dump(config, f)

    csx_es.create_index(data.name, mapping)
    csx_es.set_result_window(data.name)

    es_entries = generate_entries_from_dataframe(
        dataset, columns, data.name, config["dimension_types"]
    )

    try:
        print("***** Populating elastic")
        csx_es.bulk_populate(es_entries)
    except Exception as exception:
        os.remove(f"./app/data/files/{data.original_name}.csv")
        delete_dataset(data.name)
        print("\n\n\n\n", exception)
        return exception

    list_properties = [
        key for key, value in config["dimension_types"].items() if value == "list"
    ]

    if len(list_properties) > 0:
        print("***** Retrieving elastic")
        elastic_list_df = csx_es.query_to_dataframe(Q("match_all"), data.name, False)
        print("***** Generating nodes")
        nodes, entries_with_nodes = csx_nodes.get_nodes(elastic_list_df)

        print("***** Generating mongo nodes")

        mongo_nodes = [node for node in nodes if node["feature"] in list_properties]

        print("***** Populating mongo")
        csx_data.insert_documents(data.name, mongo_nodes)
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

    os.remove(f"./app/data/files/{data.original_name}.csv")

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


def get_dimensions(defaults):
    return [defaults[key]["name"] for key in defaults]


def get_processed_row_val(val, val_type):
    if val_type == "integer":
        return str(round(val))
    if val_type == "list":
        try:
            return ast.literal_eval(val)
        except:
            new_val = str(val)
            if new_val == "":
                return []
            else:
                return [new_val]
    else:
        return str(val)


def generate_entries_from_dataframe(data, columns, index, data_types):
    for i, row in data.iterrows():
        doc = {col: get_processed_row_val(row[col], data_types[col]) for col in columns}
        doc["_index"] = index
        yield doc


def get_dimension_types(defaults):
    return {defaults[key]["name"]: defaults[key]["dataType"] for key in defaults}


def get_elastic_type(dim_type):
    if dim_type == "string":
        return "text"
    if dim_type == "integer":
        return "integer"
    if dim_type == "float":
        return "float"
    return "text"


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


class UpdateSettingsData(BaseModel):
    name: str
    anchor: str
    defaults: dict


@router.put("/settings")
def update_dataset_settings(data: UpdateSettingsData):
    defaults = data.defaults
    schemas = []
    search_hints = {}
    initial_relationship = {}

    with open(f"./app/data/config/{data.name}.json") as f:
        config_data = json.load(f)
        schemas = config_data["schemas"]
        search_hints = config_data["search_hints"]
        default_schemas = config_data["default_schemas"]

        dest_type = config_data["dimension_types"][
            get_default_link_dimensions(defaults)[0]
        ]
        src_type = config_data["dimension_types"][defaults[data.anchor]["name"]]

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

    with open(f"./app/data/config/{data.name}.json", "w") as f:
        json.dump(config, f)

    return {"status": "success"}
