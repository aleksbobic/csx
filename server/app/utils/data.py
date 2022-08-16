import pymongo
from pymongo import MongoClient

client = MongoClient("mongodb://mongo:27017/csx")
database = client.csx


def list_collections():
    print("\n\n\n\n collection names: ", database.list_collection_names())


def insert_documnet(collection_name, value):
    collection = database[collection_name]
    collection.insert_one(value)


def insert_documents(collection_name, values):
    collection = database[collection_name]
    collection.insert_many(values)
