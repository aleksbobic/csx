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
    database[collection_name].insert_one(value)


def insert_documents(collection_name: str, values: List[Any]) -> None:
    """Insert multiple values in a collection"""
    database[collection_name].insert_many(values)


def get_all_documents(collection_name: str):
    """Retireve all collection documents"""
    return database[collection_name].find({})


@use_timing
def retrieve_raw_nodes_from_mongo(
    collection_name: str, id_list: List, features: List
) -> List[Node]:
    """Retrieve nodes stored in mongo by id list and feature"""
    return list(
        database[collection_name].find(
            {"entries": {"$in": id_list}, "feature": {"$in": features}}, {"_id": 0}
        )
    )
