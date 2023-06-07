import ast
import os
import re
from typing import Any, Dict, Generator, List, Union

import pandas as pd
from app.config import settings
from app.services.search.base import BaseSearchConnector
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch_dsl import Q, Search


class ElasticSearchConnector(BaseSearchConnector):
    def __init__(self, hostname="csx_elastic", port="9200", retry_on_timeout=True):
        self.hostname = hostname
        self.port = port
        self.retry_on_timeout = retry_on_timeout
        self.connect()

    def __del__(self):
        self.disconnect()

    def connect(self) -> None:
        self.es = Elasticsearch(
            f"{self.hostname}:{self.port}",
            retry_on_timeout=self.retry_on_timeout,
            http_auth=("elastic", settings.elastic_password),
        )

    def disconnect(self) -> None:
        self.es.transport.close()

    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        dataset_index = self.es.indices.get(index=dataset_name)[dataset_name]

        if "properties" not in dataset_index["mappings"]:
            return None

        return dataset_index["mappings"]["properties"]

    def get_all_datasets(self) -> List[str]:
        return list(self.es.indices.get(index="*").keys())

    def delete_dataset(self, dataset_name: str) -> None:
        self.es.indices.delete(index=dataset_name)

    def __get_elastic_types(self, csx_type: str) -> str:
        if csx_type == "string":
            return "text"
        if csx_type == "integer":
            return "integer"
        if csx_type == "float":
            return "float"
        return "text"

    def __generate_mapping(self, config: dict) -> dict:
        return {
            "mappings": {
                "properties": {
                    dim: {
                        "type": self.__get_elastic_types(config["dimension_types"][dim])
                    }
                    for dim in config["dimension_types"]
                }
            },
        }

    def __get_processed_row_val(self, val, val_type):
        if val_type == "integer":
            return str(round(val))
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
        self, dataset_name: str, config: dict, dataset: pd.DataFrame
    ) -> Generator:
        feature_types = config["dimension_types"]
        features = list(config["dimension_types"].keys())

        for i, row in dataset.iterrows():
            doc = {
                feature: self.__get_processed_row_val(
                    row[feature], feature_types[feature]
                )
                for feature in features
            }
            doc["_index"] = dataset_name
            yield doc

    def insert_dataset(
        self, dataset_name: str, config: dict, dataset: pd.DataFrame
    ) -> None:
        if self.es.indices.exists(index=dataset_name):
            self.delete_dataset(dataset_name)

        self.es.indices.create(index=dataset_name, body=self.__generate_mapping(config))

        self.es.indices.put_settings(
            index=dataset_name, body={"index": {"max_result_window": 500000}}
        )

        try:
            bulk(
                self.es,
                self.__convert_df_to_entries(dataset_name, config, dataset),
                refresh="wait_for",
            )
        except Exception as e:
            print(e)
            self.delete_dataset(dataset_name)
            raise e

    def __execute_search(self, search) -> pd.DataFrame:
        results = search.execute()

        result_list = [
            {**entry["_source"].to_dict(), "entry": entry["_id"]}
            for entry in results["hits"]["hits"]
        ]

        return pd.DataFrame(result_list)

    def get_full_dataset(self, dataset_name: str) -> pd.DataFrame:
        search = Search(using=self.es, index=dataset_name).query(Q("match_all"))

        search_length = search.count()
        search = search[0:search_length]

        return self.__execute_search(search)

    def __remove_special_characters(self, query: str) -> str:
        return re.sub(
            r'(\+|\-|\=|&&|\|\||\>|\<|\!|\(|\)|\{|\}|\[|\]|\^|"|~|\?|\:|\\\|\/)',
            "\\\\\\1",
            query,
        )

    def simple_search(
        self, dataset_name: str, query: Union[str, int, float], features: Dict[str, str]
    ) -> pd.DataFrame:
        search = Search(using=self.es, index=dataset_name).query(
            Q(
                "query_string",
                query=self.__remove_special_characters(str(query)),
                type="phrase",
                fields=list(features.keys()),
            )
        )

        search = search[0:10000]

        return self.__execute_search(search)

    def __search_through_list(
        self, dataset_name: str, query: str, feature: str
    ) -> pd.DataFrame:
        search = Search(using=self.es, index=dataset_name).query(
            Q("match_phrase", **{feature: query})
        )

        search = search[0:10000]

        return self.__execute_search(search)

    def __range_filter_to_dataframe(
        self, feature: str, min: Union[int, float], max: Union[int, float], index: str
    ) -> pd.DataFrame:
        """Run a range filter betwee values min and max on the provided index and feature and retrieve results as a dataframe"""
        search = Search(using=self.es, index=index).filter(
            "range", **{feature: {"gte": min, "lte": max}}
        )

        search = search[0:10000]

        return self.__execute_search(search)

    def get_entries_by_id(self, dataset_name: str, ids: List[str]) -> pd.DataFrame:
        search = Search(using=self.es, index=dataset_name).filter("terms", _id=ids)

        search = search[0:10000]

        return self.__execute_search(search)

    def __negated_search(
        self, dataset_name: str, query: str, feature: str
    ) -> pd.DataFrame:
        search = Search(using=self.es, index=dataset_name).query(
            Q(
                "bool",
                must_not=[
                    Q(
                        "term",
                        **{feature: self.__remove_special_characters(str(query))},
                    )
                ],
            )
        )

        search = search[0:10000]

        return self.__execute_search(search)

    def advanced_search(
        self, dataset_name: str, query: dict, features: Dict[str, str]
    ) -> pd.DataFrame:
        if "min" in query and "max" in query:
            return self.__range_filter_to_dataframe(
                query["feature"], query["min"], query["max"], dataset_name
            )

        if query["action"] == "get dataset":
            return self.get_full_dataset(dataset_name)

        if "query" not in query and "queries" not in query:
            if features[query["feature"]] == "list":
                return self.__search_through_list(
                    dataset_name, query["keyphrase"], query["feature"]
                )

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
