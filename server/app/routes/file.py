import pandas as pd
import json
import os
import ast
import itertools

from fastapi import APIRouter, UploadFile
from elasticsearch_dsl import Q

from app.services.graph.node import get_nodes
import app.utils.elastic as csx_es
import app.utils.data as csx_data

router = APIRouter()


@router.post("/upload")
def uploadfile(file: UploadFile):
    data = pd.read_csv(file.file, lineterminator="\n")

    columns = data.dtypes.to_dict()

    for column in list(columns.keys()):
        if columns[column] == object:
            if data.iloc[0][column][0] == "[" and data.iloc[0][column][-1] == "]":
                columns[column] = "list"
            elif len(data.index) > 20 and len(list(data[column].unique())) < 10:
                columns[column] = "category"
            else:
                columns[column] = "string"
        elif isinstance(columns[column], float):
            columns[column] = "float"
        else:
            columns[column] = "integer"

    if not os.path.exists("./app/data/files"):
        os.makedirs("./app/data/files")

    data.to_csv(f'./app/data/files/{file.filename.rpartition(".")[0]}.csv')

    return {"name": file.filename.rpartition(".")[0], "columns": columns}


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
def set_defaults(original_name: str, name="", anchor="", defaults="{}"):
    defaults = json.loads(defaults)

    # Generate default config
    config = {
        "default_visible_dimensions": get_default_visible_dimensions(defaults),
        "anchor": defaults[anchor]["name"],
        "links": get_default_link_dimensions(defaults),
        "dimension_types": get_dimension_types(defaults),
        "default_search_fields": get_default_searchable_dimensions(defaults),
        "schemas": [{"name": "default", "relations": []}],
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
                "values": list(
                    set(
                        itertools.chain.from_iterable(
                            data[key].apply(transform_to_list).tolist()
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
        elastic_list_df = csx_es.convert_query_to_df(Q("match_all"), name, False)
        print("***** Generating nodes")
        nodes, entries_with_nodes = get_nodes(elastic_list_df)

        print("***** Generating mongo nodes")

        mongo_nodes = [node for node in nodes if node["feature"] in list_properties]

        print("***** Populating mongo")
        csx_data.insert_documents(name, mongo_nodes)
    else:
        print("***** Skipped populating mongo")

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

    # Generate default config
    config = {
        "default_visible_dimensions": get_default_visible_dimensions(defaults),
        "anchor": anchor,
        "links": get_default_link_dimensions(defaults),
        "dimension_types": get_dimension_types(defaults),
        "default_search_fields": get_default_searchable_dimensions(defaults),
        "schemas": [{"name": "default", "relations": []}],
    }

    with open(f"./app/data/config/{name}.json", "w") as f:
        json.dump(config, f)

    return {"status": "success"}
