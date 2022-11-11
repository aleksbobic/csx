from typing import Any, List

import pymongo
from app.types import Node
from app.utils.timer import use_timing
from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017/csx")
database = client.csx


def list_collections() -> None:
    """Print out all collection names"""
    print("\n\n\n\n collection names: ", database.list_collection_names())


def delete_collection(collection_name: str) -> None:
    """Delete a collection"""
    database[collection_name].drop()


def insert_document(collection_name: str, value: Any) -> None:
    """Insert a single value in a collection"""
    return database[collection_name].insert_one(value)


def update_document(collection_name: str, conditions: object, new_values) -> None:
    """Update a single value in a collection"""
    database[collection_name].update_one(conditions, new_values)


def delete_document(collection_name: str, conditions: object) -> None:
    """Delete a single value from a collection"""
    database[collection_name].delete_one(conditions)


def delete_documents(collection_name: str, conditions: object) -> None:
    """Delete a single value from a collection"""
    database[collection_name].delete_many(conditions)


def delete_from_array(
    collection_name: str, conditions: object, arr_name, index
) -> None:
    """Delete a value from an array"""
    # database[collection_name].update_many(conditions, new_values)
    database[collection_name].update_one(
        conditions, {"$unset": {f"{arr_name}.{index}": 1}}
    )
    database[collection_name].update_one(conditions, {"$pull": {f"{arr_name}": None}})


def insert_documents(collection_name: str, values: List[Any]) -> None:
    """Insert multiple values in a collection"""
    database[collection_name].insert_many(values)


def get_all_documents(collection_name: str):
    """Retireve all collection documents"""
    return database[collection_name].find({})


def get_all_documents_by_conditions(
    collection_name: str, conditions: object, visiblity_filter={}
):
    """Retireve all collection documents based on conditions"""
    return database[collection_name].find(conditions, visiblity_filter)


@use_timing
def retrieve_raw_nodes_from_mongo(
    collection_name: str, id_list: List, features: List
) -> List[Node]:
    """Retrieve nodes stored in mongo by id list and feature"""
    nodes = list(
        database[collection_name].find(
            {"entries": {"$in": id_list}, "feature": {"$in": features}}, {"_id": 0}
        )
    )
    for node in nodes:
        node["entries"] = [entry for entry in node["entries"] if entry in id_list]

    return nodes
