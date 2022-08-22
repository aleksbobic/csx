from app.utils.timer import use_timing
import pymongo
from pymongo import MongoClient
import itertools

client = MongoClient("mongodb://mongo:27017/csx")
database = client.csx


def list_collections():
    print("\n\n\n\n collection names: ", database.list_collection_names())


def delete_collection(collection_name):
    database[collection_name].drop()


def insert_document(collection_name, value):
    res = database[collection_name].insert_one(value)
    print(
        "\n\n\n\n\n mongo insertion results",
        res.acknowledged,
        res.inserted_id,
        collection_name,
    )


def insert_documents(collection_name, values):
    database[collection_name].insert_many(values)


def get_all_documents(collection_name):
    return database[collection_name].find({})


def get_documents_by_id_values(collection_name, id_list, fields=[], hide_ids=True):
    fields = {field: 1 for field in fields}

    if hide_ids:
        fields["_id"] = 0

    return database[collection_name].find({"_id": {"$in": id_list}}, fields)


@use_timing
def retireve_from_mongo(index, ids, dimensions):
    return get_documents_by_id_values(
        index,
        ids,
        dimensions,
    )


@use_timing
def retrieve_raw_nodes_from_mongo(collection_name, id_list, features):
    return database[collection_name].find(
        {"entries": {"$in": id_list}, "feature": {"$in": features}}, {"_id": 0}
    )


@use_timing
def retrieve_nodes_from_mongo(index, nodes, entries_with_nodes, ids=[], dimensions=[]):

    mongo_results = retrieve_raw_nodes_from_mongo(index, ids, dimensions)

    list_nodes = list(mongo_results)

    for node in list_nodes:
        for entry in node["entries"]:
            if entry in entries_with_nodes:
                entries_with_nodes[entry].append(node)
            else:
                entries_with_nodes[entry] = [node]

    nodes = nodes + list_nodes

    return nodes, entries_with_nodes
