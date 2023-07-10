import ast
import os
from typing import Any, Dict, Generator, List, Union

import gridfs
import pandas as pd
import polars as pl
from app.config import settings
from app.services.search.base import BaseSearchConnector
from app.utils.timer import use_timing
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
        self.client = MongoClient(
            f"mongodb://{settings.mongo_username}:{settings.mongo_password}@{self.hostname}:{self.port}/{self.db}?authSource=admin"
        )
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
        self, dataset_name: str, dataset_config: dict, dataset: pl.DataFrame
    ) -> None:
        dataset_pd = dataset.to_pandas()
        dataset_list = self.__convert_df_to_entries(dataset_config, dataset_pd)
        self.database[dataset_name].insert_many(dataset_list)

    def get_all_datasets(self) -> List[str]:
        return [name for name in self.database.list_collection_names()]

    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        # get sample document and exclude _id field
        random_document = self.database[dataset_name].aggregate(
            [{"$sample": {"size": 1}}, {"$project": {"_id": 0}}]
        )

        if random_document:
            return random_document.next().keys()

        return {}

    def delete_dataset(self, dataset_name: str) -> None:
        try:
            self.database[dataset_name].drop_indexes()
            self.database[dataset_name].drop()
        except ConnectionError as e:
            raise e

    @use_timing
    def get_full_dataset(self, dataset_name: str) -> pd.DataFrame:
        all_docs = list(self.database[dataset_name].find({}))

        all_docs = pd.DataFrame(all_docs)
        all_docs["_id"] = all_docs["_id"].astype(str)

        return all_docs.rename(columns={"_id": "entry"})

    def simple_search(
        self, dataset_name: str, query: Union[str, int, float], features: Dict[str, str]
    ) -> pd.DataFrame:
        if isinstance(query, (int, float)):
            return self.__range_filter_to_dataframe(
                list(features.keys())[0], query, query, dataset_name
            )

        # performe a caseinsensitive regex search  on all features  and store results in search_results as a list
        search_results = list(
            self.database[dataset_name].find(
                {
                    feature: {"$eq": query}
                    if features[feature] == "category"
                    else {
                        "$regex": query,
                        "$options": "i",
                    }
                    for feature in features
                },
                {},
            )
        )

        if not search_results:
            return pd.DataFrame()

        search_results = pd.DataFrame(search_results)
        search_results["_id"] = search_results["_id"].astype(str)

        return search_results.rename(columns={"_id": "entry"})

    def __range_filter_to_dataframe(
        self,
        feature: str,
        min: Union[int, float],
        max: Union[int, float],
        dataset_name: str,
    ) -> pd.DataFrame:
        """Run a range filter betwee values min and max on the provided index and feature and retrieve results as a dataframe"""
        search_results = list(
            self.database[dataset_name].find({feature: {"$gte": min, "$lte": max}}, {})
        )

        search_results = pd.DataFrame(search_results)
        search_results["_id"] = search_results["_id"].astype(str)

        return search_results.rename(columns={"_id": "entry"})

    def __negated_search(
        self, dataset_name: str, query: str, feature: str
    ) -> pd.DataFrame:
        search_results = list(
            self.database[dataset_name].find({feature: {"$not": {"$regex": query}}}, {})
        )
        if not search_results:
            return pd.DataFrame()

        search_results = pd.DataFrame(search_results)
        search_results["_id"] = search_results["_id"].astype(str)

        return search_results.rename(columns={"_id": "entry"})

    def advanced_search(
        self, dataset_name: str, query: dict, features: Dict[str, str]
    ) -> pd.DataFrame:
        if "min" in query and "max" in query:
            if features[query["feature"]] == "integer":
                return self.__range_filter_to_dataframe(
                    query["feature"], int(query["min"]), int(query["max"]), dataset_name
                )

            return self.__range_filter_to_dataframe(
                query["feature"], float(query["min"]), float(query["max"]), dataset_name
            )

        if query["action"] == "get dataset":
            return self.get_full_dataset(dataset_name)

        if "query" not in query and "queries" not in query:
            return self.simple_search(
                dataset_name,
                query["keyphrase"],
                {query["feature"]: features[query["feature"]]},
            )

        if query["action"] == "connect":
            if query["connector"] == "or":
                query_dfs = [
                    self.advanced_search(dataset_name, entry, features)
                    for entry in query["queries"]
                ]

                merged_df = (
                    pd.concat(query_dfs, ignore_index=True)
                    .drop_duplicates(subset=["entry"])
                    .reset_index(drop=True)
                )

                return merged_df

            if query["connector"] == "and":
                query_dfs = [
                    self.advanced_search(dataset_name, entry, features)
                    for entry in query["queries"]
                ]

                merged_df = query_dfs[0]
                query_dfs = query_dfs[1:]

                for entry_df in query_dfs:
                    merged_df = pd.concat([merged_df, entry_df], ignore_index=True)
                    merged_df = (
                        merged_df[merged_df.duplicated(subset=["entry"])]
                        .drop_duplicates(subset=["entry"])
                        .reset_index(drop=True)
                    )

                return merged_df

            return self.__negated_search(
                dataset_name,
                query["queries"][0]["keyphrase"],
                query["queries"][0]["feature"],
            )

        return self.advanced_search(dataset_name, query["query"], features)

    def get_entries_by_id(
        self, dataset_name: str, entry_ids: List[str]
    ) -> pd.DataFrame:
        entry_ids_transformed = [ObjectId(entry_id) for entry_id in entry_ids]

        search_results = list(
            self.database[dataset_name].find({"_id": {"$in": entry_ids_transformed}})
        )

        if not search_results:
            return pd.DataFrame()

        search_results = pd.DataFrame(search_results)
        search_results["_id"] = search_results["_id"].astype(str)

        return search_results.rename(columns={"_id": "entry"})
