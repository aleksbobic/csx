import os
import pickle
from typing import List, Union

import gridfs
from app.config import settings
from app.services.storage.base import BaseStorageConnector
from app.utils.timer import use_timing
from bson import ObjectId
from pymongo import MongoClient


class MongoStorageConnector(BaseStorageConnector):
    def __init__(self, hostname="mongo", port="27017", db="csx"):
        self.hostname = hostname
        self.port = port
        self.db = db
        self.connect()

    def __del__(self):
        self.disconnect()

    def connect(self) -> None:
        self.client = MongoClient(
            f"mongodb://{settings.mongo_username}:{settings.mongo_password}@{self.hostname}:{self.port}/{self.db}?authSource=admin"
        )

        self.database = self.client[self.db]
        self.fs = gridfs.GridFS(self.database)

    def disconnect(self) -> None:
        self.client.close()

    def delete_dataset(self, dataset_name: str) -> None:
        try:
            self.database[dataset_name].drop()
        except ConnectionError as e:
            raise e

    @use_timing
    def insert_nodes(self, collection_name: str, nodes: list) -> None:
        self.database[collection_name].insert_many(nodes)

    def insert_config(self, config: dict) -> None:
        self.database["configs"].insert_one(config)

    def get_config(self, dataset_name: str) -> dict:
        try:
            config = self.database["configs"].find_one({"dataset_name": dataset_name})
        except ConnectionError as e:
            return {}

        if not config:
            return {}

        config.pop("_id", None)

        return config

    def delete_config(self, dataset_name: str) -> None:
        self.database["configs"].delete_one({"dataset_name": dataset_name})

    def update_config(self, dataset_name: str, config: dict) -> None:
        self.database["configs"].update_one(
            {"dataset_name": dataset_name}, {"$set": config}
        )

    def get_history_item(self, item_id: str) -> dict:
        try:
            history_item = self.fs.get(ObjectId(item_id)).read()
        except ConnectionError as e:
            raise e

        return pickle.loads(history_item)

    def get_history_items(self, study_id: str, user_id: str) -> List[dict]:
        try:
            study = self.get_study(user_id, study_id)
        except ConnectionError as e:
            raise e

        if not study:
            return []

        history = [
            {
                **item,
                "id": str(item["item_id"]),
                "item_id": None,
                "parent_id": str(item["parent"]),
                "parent": None,
                "comments": [
                    {
                        **comment,
                        "id": str(comment["_id"]),
                        "_id": None,
                    }
                    for comment in item["comments"]
                ],
            }
            for item in study["history"]
        ]

        return history

    def insert_history_item(self, study_id: str, user_id: str, history_item_data: dict):
        fs_id = self.fs.put(history_item_data["graph_data"])
        self.database["studies"].update_one(
            {"study_uuid": study_id, "user_uuid": user_id},
            {
                "$push": {
                    "history": {
                        "item_id": fs_id,
                        "action": history_item_data["action"],
                        "graph_type": history_item_data["graph_type"],
                        "query": history_item_data["query"],
                        "action_time": history_item_data["action_time"],
                        "schema": history_item_data["schema"],
                        "anchor_properties": history_item_data["anchor_properties"],
                        "anchor": history_item_data["anchor"],
                        "links": history_item_data["links"],
                        "visible_dimensions": history_item_data["visible_dimensions"],
                        "comments": [],
                        "parent": history_item_data["history_parent_id"],
                        "charts": history_item_data["charts"],
                        "edge_count": history_item_data["edge_count"],
                        "node_count": history_item_data["node_count"],
                    }
                }
            },
        )

    def get_history_ids_from_parent(self, nodes, id) -> List[str]:
        currentNode = [node for node in nodes if node["item_id"] == ObjectId(id)][0]
        currentNodeChildren = [node for node in nodes if str(node["parent"]) == str(id)]

        if len(currentNodeChildren) == 0:
            return [str(currentNode["item_id"])]

        all_children = [str(currentNode["item_id"])]

        for childNode in currentNodeChildren:
            all_children = all_children + self.get_history_ids_from_parent(
                nodes, childNode["item_id"]
            )

        return all_children

    def delete_history_item(self, study_id, user_id, item_id):
        study = self.get_study(user_id, study_id)
        nodes_to_delete = self.get_history_ids_from_parent(study["history"], item_id)

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

    def insert_study(self, study: dict):
        self.database["studies"].insert_one(study)

    def get_study(self, user_id, study_id):
        studies = list(
            self.database["studies"].find(
                {"$and": [{"user_uuid": user_id}, {"study_uuid": study_id}]}, {"_id": 0}
            )
        )

        if len(studies) == 0:
            return None

        return studies[0]

    def get_public_study(self, study_id):
        studies = list(
            self.database["studies"].find(
                {"$and": [{"public_url": study_id}]}, {"_id": 0}
            )
        )

        if len(studies) == 0:
            return None

        return studies[0]

    def update_study_settings(self, study_id: str, user_id: str, settings: dict):
        self.database["studies"].update_one(
            {"study_uuid": study_id, "user_uuid": user_id},
            {"$set": settings},
        )

    def delete_study(self, user_id: str, study_id: str):
        study = self.get_study(user_id, study_id)

        history_ids = [item["item_id"] for item in study["history"]]
        for item_id in history_ids:
            self.fs.delete(item_id)

        self.database["studies"].delete_one(
            {"study_uuid": study_id, "user_uuid": user_id}
        )

    def get_user_studies(self, user_id) -> List[dict]:
        return list(
            self.database["studies"].find(
                {"$and": [{"user_uuid": user_id}, {"saved": True}]}, {"_id": 0}
            )
        )

    def insert_comment(
        self,
        user_id: str,
        study_id: str,
        history_id: str,
        comment: str,
        comment_time: str,
        screenshot: Union[str, None],
        screenshot_width: Union[int, None],
        screenshot_height: Union[int, None],
        chart: Union[str, None],
    ):
        comment_id = ObjectId()

        self.database["studies"].update_one(
            {
                "study_uuid": study_id,
                "user_uuid": user_id,
                "history.item_id": ObjectId(history_id),
            },
            {
                "$push": {
                    "history.$.comments": {
                        "_id": comment_id,
                        "comment": comment,
                        "time": comment_time,
                        "screenshot": screenshot,
                        "screenshot_width": screenshot_width,
                        "screenshot_height": screenshot_height,
                        "chart": chart,
                    }
                }
            },
        )
        return str(comment_id)

    def delete_comment(
        self, user_id: str, study_id: str, history_id: str, comment_id: str
    ):
        self.database["studies"].update_one(
            {
                "study_uuid": study_id,
                "user_uuid": user_id,
                "history.item_id": ObjectId(history_id),
                "history.comments._id": ObjectId(comment_id),
            },
            {"$pull": {"history.$.comments": {"_id": ObjectId(comment_id)}}},
        )

    def edit_comment(
        self,
        study_id: str,
        user_id: str,
        history_item_id: str,
        comment_id: str,
        comment: str,
        comment_time: str,
        screenshot: Union[str, None],
        screenshot_width: Union[int, None],
        screenshot_height: Union[int, None],
        chart: Union[str, None],
    ):
        self.database["studies"].update_one(
            {"study_uuid": study_id, "user_uuid": user_id},
            {
                "$set": {
                    f"history.$[i].comments.$[j].comment": comment,
                    f"history.$[i].comments.$[j].screenshot": screenshot,
                    f"history.$[i].comments.$[j].screenshot_width": screenshot_width,
                    f"history.$[i].comments.$[j].screenshot_height": screenshot_height,
                    f"history.$[i].comments.$[j].chart": chart,
                    f"history.$[i].comments.$[j].time": comment_time,
                    f"history.$[i].comments.$[j].edited": True,
                }
            },
            array_filters=[
                {"i.item_id": ObjectId(history_item_id)},
                {"j._id": ObjectId(comment_id)},
            ],
        )

    def get_precomputed_nodes(self, dataset, node_ids, node_features):
        """Retrieve nodes stored in mongo by id list and feature"""
        nodes = list(
            self.database[dataset].find(
                {"entries": {"$in": node_ids}, "feature": {"$in": node_features}},
                {"_id": 0},
            )
        )
        for node in nodes:
            node["entries"] = [entry for entry in node["entries"] if entry in node_ids]

        return nodes
