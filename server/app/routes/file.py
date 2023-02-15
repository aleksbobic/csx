import ast
import itertools
import json
import os
from os.path import exists

import app.services.data.elastic as csx_es
import app.services.data.mongo as csx_data
import app.services.graph.nodes as csx_nodes
import app.services.data.autocomplete as csx_auto

import pandas as pd
import polars as pl
from elasticsearch_dsl import Q
from fastapi import APIRouter, UploadFile
import base64
import random


router = APIRouter()


@router.post("/upload")
def uploadfile(file: UploadFile):
    if os.getenv("DISABLE_UPLOAD") == "true":
        return {}

    data = pl.read_csv(file.file)
    df_columns = data.schema
    columns = {}

    for column in list(df_columns.keys()):
        if df_columns[column] == pl.Utf8:
            if data[column][0][0] == "[" and data[column][0][-1] == "]":
                columns[column] = "list"
            elif (
                data.shape[0] > 20
                and data.select([pl.col(column).n_unique()])[0, 0] < 10
            ):
                columns[column] = "category"
            else:
                columns[column] = "string"
        elif df_columns[column] in [pl.Float32, pl.Float64]:
            columns[column] = "float"
        else:
            columns[column] = "integer"

    if not os.path.exists("./app/data/files"):
        os.makedirs("./app/data/files")

    data.write_csv(f'./app/data/files/{file.filename.rpartition(".")[0]}.csv')

    return {"name": file.filename.rpartition(".")[0], "columns": columns}


@router.get("/randomimage", responses={200: {"content": {"image/png": {}}}})
def get_random_image():
    image_number = random.randint(1, 10)

    num_to_animal = {
        1: "parrot",
        2: "dog",
        3: "bird",
        4: "dog",
        5: "dog",
        6: "bunny",
        7: "dog",
        8: "cat",
        9: "dog",
        10: "cat",
    }

    with open(f"./app/data/images/{image_number}.png", "rb") as f:
        base64image = base64.b64encode(f.read())
    return {"image": base64image, "animal": num_to_animal[image_number]}


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


def transform_to_list(raw_entry):
    return [
        entry.lstrip("'").rstrip("'")
        for entry in raw_entry.lstrip("[").rstrip("]").split("', '")
    ]


@router.get("/settings")
def set_defaults(
    original_name: str, name="", anchor="", defaults="{}", default_schemas="{}"
):
    defaults = json.loads(defaults)

    # Generate default config
    config = {
        "default_visible_dimensions": get_default_visible_dimensions(defaults),
        "anchor": defaults[anchor]["name"],
        "links": get_default_link_dimensions(defaults),
        "dimension_types": get_dimension_types(defaults),
        "default_search_fields": get_default_searchable_dimensions(defaults),
        "schemas": [{"name": "default", "relations": []}],
        "default_schemas": json.loads(default_schemas),
    }

    dest_type = config["dimension_types"][get_default_link_dimensions(defaults)[0]]
    src_type = config["dimension_types"][defaults[anchor]["name"]]

    initial_relationship = {
        "dest": get_default_link_dimensions(defaults)[0],
        "src": defaults[anchor]["name"],
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

    config["schemas"][0]["relations"].append(initial_relationship)

    if not os.path.exists("./app/data/config"):
        os.makedirs("./app/data/config")

    data = pd.read_csv(f"./app/data/files/{original_name}.csv", lineterminator="\n")

    rename_mapping = get_renamed_dimensions(defaults)
    if bool(rename_mapping):
        data.rename(columns=rename_mapping, inplace=True)

    null_dimensions = get_remove_row_if_null_dimensions(defaults)
    if len(null_dimensions) != 0:
        data.dropna(axis=0, subset=null_dimensions, inplace=True)

    for null_dim in null_dimensions:
        data = data[data[null_dim] != ""]

    columns = get_dimensions(defaults)

    mapping = {
        "mappings": {
            "properties": {
                dim: {"type": get_elastic_type(config["dimension_types"][dim])}
                for dim in config["dimension_types"]
            }
        },
    }

    dimension_search_hints = {}

    for key in config["dimension_types"]:
        if config["dimension_types"][key] == "integer":
            dimension_search_hints[key] = {
                "min": int(data[key].min()),
                "max": int(data[key].max()),
            }
        elif config["dimension_types"][key] == "float":
            dimension_search_hints[key] = {
                "min": float(data[key].min()),
                "max": float(data[key].max()),
            }
        elif config["dimension_types"][key] == "category":
            dimension_search_hints[key] = {"values": list(data[key].unique())}
        elif config["dimension_types"][key] == "list":
            dimension_search_hints[key] = {
                "values": sorted(
                    list(
                        set(
                            itertools.chain.from_iterable(
                                data[key].apply(transform_to_list).tolist()
                            )
                        )
                    )
                )
            }

    config["search_hints"] = dimension_search_hints

    with open(f"./app/data/config/{name}.json", "w") as f:
        json.dump(config, f)

    csx_es.create_index(name, mapping)

    try:
        print("***** Populating elastic")
        csx_es.bulk_populate(
            generate_entries_from_dataframe(
                data, columns, name, config["dimension_types"]
            )
        )
    except Exception as exception:
        os.remove(f"./app/data/files/{original_name}.csv")
        delete_dataset(name)
        print("\n\n\n\n", exception)
        return exception

    list_properties = [
        key for key, value in config["dimension_types"].items() if value == "list"
    ]

    if len(list_properties) > 0:
        print("***** Retrieving elastic")
        elastic_list_df = csx_es.query_to_dataframe(Q("match_all"), name, False)
        print("***** Generating nodes")
        nodes, entries_with_nodes = csx_nodes.get_nodes(elastic_list_df)

        print("***** Generating mongo nodes")

        mongo_nodes = [node for node in nodes if node["feature"] in list_properties]

        print("***** Populating mongo")
        csx_data.insert_documents(name, mongo_nodes)
    else:
        print("***** Skipped populating mongo")

    string_properties = [
        key for key, value in config["dimension_types"].items() if value == "string"
    ]

    for prop in string_properties:
        csx_auto.generate_auto_index(name, prop, data[prop].astype(str).to_list())

    for prop in list_properties:
        unique_entries = list(
            set(
                itertools.chain.from_iterable(
                    [
                        entry.lstrip("[").rstrip("]").replace("'", "").split(", ")
                        for entry in data[prop].astype(str).to_list()
                    ]
                )
            )
        )

        csx_auto.generate_list_auto_index(name, prop, unique_entries)

    string_search_fields = []
    other_search_fields = []

    for search_field in config["default_search_fields"]:
        if config["dimension_types"][search_field] == "string":
            string_search_fields.append(search_field)
        else:
            other_search_fields.append(search_field)

    csx_auto.generate_main_auto_index(
        name, other_search_fields, string_search_fields, data
    )

    os.remove(f"./app/data/files/{original_name}.csv")

    return {"status": "success"}


def convert_entry_with_nodes_to_mongo(entry, key, list_props):
    new_entries = []

    for prop in entry:
        if prop["feature"] in list_props:
            prop["esid"] = key
            new_entries.append(prop)

    return new_entries


@router.get("/cancel")
def cancel_dataset_upload(name: str):
    os.remove(f"./app/data/files/{name}.csv")
    return {"status": "success"}


@router.get("/delete")
def delete_dataset(name: str):
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

    return {"status": "success"}


@router.get("/config")
def get_dataset_config(name: str):
    with open(f"./app/data/config/{name}.json") as f:
        data = json.load(f)
        return {"config": data}


@router.get("/settingsupdate")
def update_settings(name="", anchor="", defaults="{}"):
    defaults = json.loads(defaults)
    schemas = []
    search_hints = {}

    with open(f"./app/data/config/{name}.json") as f:
        data = json.load(f)
        schemas = data["schemas"]
        search_hints = data["search_hints"]

    # Generate default config
    config = {
        "default_visible_dimensions": get_default_visible_dimensions(defaults),
        "anchor": anchor,
        "links": get_default_link_dimensions(defaults),
        "dimension_types": get_dimension_types(defaults),
        "default_search_fields": get_default_searchable_dimensions(defaults),
        "schemas": schemas,
        "search_hints": search_hints,
    }

    with open(f"./app/data/config/{name}.json", "w") as f:
        json.dump(config, f)

    return {"status": "success"}
