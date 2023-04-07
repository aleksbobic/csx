import pickle

import gridfs
from app.services.storage.base import StorageConnector
from pymongo import MongoClient


class MongoConnector(StorageConnector):
    def __init__(self, hostname="mongo", port="27017", db="csx"):
        self.hostname = hostname
        self.port = port
        self.db = db
        self.connect()

    def __del__(self):
        self.disconnect()

    def connect(self) -> None:
        self.client = MongoClient(f"mongodb://{self.hostname}:{self.port}/{self.db}")
        self.database = self.client[self.db]
        self.fs = gridfs.GridFS(self.database)

    def disconnect(self) -> None:
        self.client.close()

    def delete_dataset(self, dataset_name: str) -> None:
        try:
            self.database[dataset_name].drop()
        except ConnectionError as e:
            raise e

    def insert_nodes(self, collection_name: str, nodes: list) -> None:
        self.database[collection_name].insert_many(nodes)

    def get_history_item(self, item_id: str) -> dict:
        try:
            history_item = self.fs.get(item_id).read()
        except ConnectionError as e:
            raise e

        return pickle.loads(history_item)

    def update_history_item_charts(
        self,
        collection_name: str,
        study_id: str,
        user_id: str,
        item_index: int,
        charts: list,
    ) -> None:
        self.database[collection_name].update_one(
            {"study_uuid": study_id, "user_uuid": user_id},
            {
                "$set": {
                    f"history.{item_index}.charts": charts,
                }
            },
        )
