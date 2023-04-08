from typing import Any, List

import gridfs
from app.types import Node
from app.utils.timer import use_timing
from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017/csx")
database = client.csx
fs = gridfs.GridFS(database)


def insert_large_document(doc) -> str:
    return fs.put(doc)


def update_document(collection_name: str, conditions: Any, new_values) -> None:
    """Update a single value in a collection"""
    database[collection_name].update_one(conditions, new_values)


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
