import ast
from typing import Any, Dict, Generator, List, Union

import gridfs
import pandas as pd
from app.services.search.base import BaseSearchConnector
from bson import ObjectId
from pymongo import MongoClient


class MongoSearchConnector(BaseSearchConnector):
    def __init__(self, hostname="mongo", port="27017", db="csx_datasets"):
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

    def __get_processed_row_val(self, val, val_type):
        if val_type == "integer":
            return int(val)
        if val_type == "float":
            return float(val)
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

    def __convert_df_to_entries(
        self, config: dict, dataset: pd.DataFrame
    ) -> List[Dict[str, Any]]:
        feature_types = config["dimension_types"]
        features = list(config["dimension_types"].keys())

        processed_data = []

        for index, row in dataset.iterrows():
            processed_data.append(
                {
                    feature: self.__get_processed_row_val(
                        row[feature], feature_types[feature]
                    )
                    for feature in features
                }
            )

        return processed_data

    def insert_dataset(
        self, dataset_name: str, dataset_config: dict, dataset: pd.DataFrame
    ) -> None:
        dataset_list = self.__convert_df_to_entries(dataset_config, dataset)
        self.database[dataset_name].insert_many(dataset_list)

    def get_all_datasets(self) -> List[str]:
        return [name for name in self.database.list_collection_names()]

    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        random_document = self.database[dataset_name].aggregate(
            [{"$sample": {"size": 1}}]
        )

        if random_document:
            return random_document.next().keys()

        return {}

    def delete_dataset(self, dataset_name: str) -> None:
        try:
            self.database[dataset_name].drop()
        except ConnectionError as e:
            raise e

    def get_full_dataset(self, dataset_name: str) -> pd.DataFrame:
        all_docs = list(self.database[dataset_name].find({}))

        return pd.DataFrame(all_docs).rename(columns={"_id": "entry"})

    def simple_search(
        self, dataset_name: str, query: str, features: List[str]
    ) -> pd.DataFrame:
        search_results = list(
            self.database[dataset_name].find(
                {feature: {"$regex": query} for feature in features}, {}
            )
        )
        if not search_results:
            return pd.DataFrame()

        search_results = pd.DataFrame(search_results)
        search_results["_id"] = search_results["_id"].astype(str)

        return search_results.rename(columns={"_id": "entry"})

    def advanced_search(
        self, dataset_name: str, query: dict, features: List[str]
    ) -> pd.DataFrame:
        return pd.DataFrame()

    def get_entries_by_id(
        self, dataset_name: str, entry_ids: List[str]
    ) -> pd.DataFrame:
        return pd.DataFrame()
