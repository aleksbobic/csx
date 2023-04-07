import pickle
from typing import List

import gridfs
from app.services.storage.base import StorageConnector
from bson import ObjectId
from fastapi import HTTPException, status
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

    def get_all_child_node_ids(self, nodes, id) -> List[str]:
        currentNode = [node for node in nodes if node["item_id"] == ObjectId(id)][0]
        currentNodeChildren = [node for node in nodes if str(node["parent"]) == str(id)]

        if len(currentNodeChildren) > 0:
            all_children = [str(currentNode["item_id"])]

            for childNode in currentNodeChildren:
                all_children = all_children + self.get_all_child_node_ids(
                    nodes, childNode["item_id"]
                )

            return all_children
        else:
            return [str(currentNode["item_id"])]

    def delete_history_item(self, study_id, user_id, history_item_id):
        study = self.get_study(user_id, study_id)
        nodes_to_delete = self.get_all_child_node_ids(study["history"], history_item_id)

        for item_id in nodes_to_delete:
            self.fs.delete(ObjectId(item_id))

        self.database["studies"].update_one(
            {"study_uuid": study_id, "user_uuid": user_id},
            {
                "$set": {
                    "history": [
                        entry
                        for entry in study["history"]
                        if str(entry["item_id"]) not in nodes_to_delete
                    ]
                }
            },
        )

    def update_history_item_charts(
        self,
        study_id: str,
        user_id: str,
        item_id: str,
        charts: list,
    ) -> None:
        self.database["studies"].update_one(
            {
                "study_uuid": study_id,
                "user_uuid": user_id,
                "history.item_id": ObjectId(item_id),
            },
            {
                "$set": {
                    f"history.$.charts": charts,
                }
            },
        )

    def get_study(self, user_id, study_id):
        studies = list(
            self.database["studies"].find(
                {"$and": [{"user_uuid": user_id}, {"study_uuid": study_id}]}, {"_id": 0}
            )
        )

        if len(studies) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study not found",
            )

        return studies[0]

    def update_study_settings(self, study_id: str, user_id: str, settings: dict):
        self.database["studies"].update_one(
            {"study_uuid": study_id, "user_uuid": user_id},
            {"$set": settings},
        )
