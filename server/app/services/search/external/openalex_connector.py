import time
from datetime import datetime
from typing import Any, Dict, Generator, List, Union, Optional

from collections import Counter
import pandas as pd
import polars as pl
import requests
from app.services.search.external.base import BaseExternalSearchConnector
from app.services.search.external.openalex_helper import OpenAlexHelper
from app.services.search.external.openalex_results import OpenAlexSearchResults
from pyalex import Works

RETRIEVABLE_FIELDS = [
    "authorships",
    "concepts",
    "cited_by_count",
    "title",
    "doi",
    "publication_year",
    "id",
    "primary_location",
]


class OpeanAlexSearchConnector(BaseExternalSearchConnector):
    def __init__(self):
        self.oa_helper = OpenAlexHelper()
        self.oa_results = OpenAlexSearchResults(page_size=200)

    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        # Returns the features of a dataset and their types
        return self.get_config()["dimension_types"]

    def get_config(self) -> dict:
        return {
            "dimension_types": {
                "title": "string",
                "doi": "string",
                "authors": "list",
                "author_ids": "list",
                "author_institutions": "list",
                "author_countries": "list",
                "institution_types": "list",
                "institution_ids": "list",
                "concepts_lv_1": "list",
                "concepts_lv_2": "list",
                "concepts_lv_3": "list",
                "concepts_lv_1_ids": "list",
                "concepts_lv_2_ids": "list",
                "concepts_lv_3_ids": "list",
                "citation_counts": "integer",
                "publication_year": "integer",
                "hosted_location": "string",
                "hosted_location_type": "string",
                "hosted_location_id": "string",
            },
            "schemas": [
                {
                    "name": "default",
                    "relations": [
                        {
                            "dest": "authors",
                            "src": "title",
                            "relationship": "oneToMany",
                        }
                    ],
                }
            ],
            "default_schemas": {"overview": [], "detail": []},
            "anchor": "title",
            "links": ["authors"],
            "default_search_fields": ["title"],
            "default_visible_dimensions": ["authors", "title"],
            "dataset_type": "api",
            "search_hints": {
                "citation_counts": {"min": 0},
                "publication_year": {"min": 0, "max": datetime.now().year},
            },
        }

    def __generate_filter_query(self, feature, value) -> Dict:
        ## Generate the query for a single filter
        if "concepts_" in feature or feature == "concepts":
            return {"concepts": {"id": value}}
        if feature in ["authors", "author_ids"]:
            return {"authorships": {"author": {"id": value}}}
        if feature == "institution_types":
            return {"authorships": {"institutions": {"type": value}}}
        if "institution" in feature:
            return {"authorships": {"institutions": {"id": value}}}
        if feature == "author_countries":
            return {"authorships": {"institutions": {"country_code": value}}}
        if feature == "citation_counts":
            return {"cited_by_count": value}
        if feature == "publication_year":
            return {"publication_year": value}
        if feature == "doi":
            return {"doi": value}
        if feature in ["hosted_location", "hosted_location_id"]:
            return {"primary_location": {"source": {"id": value}}}
        if feature == "hosted_location_type":
            return {"primary_location": {"source": {"type": value}}}
        return {feature: {"search": value}}

    def __simple_concept_search(
        self, simple_query: str, feature: str, page: int
    ) -> Dict:
        concept_ids = [str(simple_query)]

        if "ids" not in feature:
            concept_ids = self.oa_helper.get_ids("concept", simple_query)

            if len(concept_ids) == 0:
                return pd.DataFrame()

        return self.__run_search_by_feature(feature, "|".join(concept_ids), page)

    def __simple_author_search(
        self, simple_query: str, feature: str, page: int
    ) -> Dict:
        author_ids = [str(simple_query)]

        if "ids" not in feature:
            author_ids = self.oa_helper.get_ids("author", simple_query)

            if len(author_ids) == 0:
                return pd.DataFrame()

        return self.__run_search_by_feature(feature, "|".join(author_ids), page)

    def __simple_institution_search(
        self, simple_query: str, feature: str, page: int
    ) -> Dict:
        institution_ids = [str(simple_query)]

        if "ids" not in feature:
            institution_ids = self.oa_helper.get_ids("institution", simple_query)

            if len(institution_ids) == 0:
                return pd.DataFrame()

        return self.__run_search_by_feature(feature, "|".join(institution_ids), page)

    def __simple_hosted_location_search(
        self, simple_query: str, feature: str, page: int
    ) -> Dict:
        hosted_location_ids = [str(simple_query)]

        if "id" not in feature:
            hosted_location_ids = self.oa_helper.get_ids("source", simple_query)

            if len(hosted_location_ids) == 0:
                return pd.DataFrame()

        return self.__run_search_by_feature(
            feature, "|".join(hosted_location_ids), page
        )

    def simple_search(
        self,
        dataset_name: str,
        simple_query: Union[str, int, float],
        feature: str,
        page: Optional[int] = 1,
    ) -> Dict:
        if "concepts_" in feature:
            return self.__simple_concept_search(str(simple_query), feature, page)
        if feature in ["authors", "author_ids"]:
            return self.__simple_author_search(str(simple_query), feature, page)
        if "institution" in feature:
            return self.__simple_institution_search(str(simple_query), feature, page)
        if feature in ["hosted_location", "hosted_location_id"]:
            return self.__simple_hosted_location_search(
                str(simple_query), feature, page
            )

        return self.__run_search_by_feature(feature, simple_query, page)

    def __run_search_by_feature(self, feature, value, page) -> Dict:
        filter_query = self.__generate_filter_query(feature, value)
        pager = Works().filter(**filter_query).select(RETRIEVABLE_FIELDS)

        pages = self.oa_results.process_results(pager, page)
        return {"data": self.oa_results.to_dataframe(), "pages": pages}

    def __get_values_by_feature(self, query):
        features = {}

        if query["action"] == "visualise":
            for entry in query["query"]["queries"]:
                if entry["feature"] not in features:
                    features[entry["feature"]] = []
                features[entry["feature"]].append(entry["keyphrase"])
        else:
            for entry in query["queries"]:
                if entry["feature"] not in features:
                    features[entry["feature"]] = []
                features[entry["feature"]].append(entry["keyphrase"])
        return features

    def __multi_feature_advanced_search(
        self, values_by_feature, connector, tabular_data, page: int
    ):
        query_by_feature = {}
        for feature in values_by_feature:
            if feature in ["citation_counts", "publication_year"]:
                if len(values_by_feature[feature]) == 1:
                    query_by_feature[feature] = values_by_feature[feature][0]
                else:
                    query_by_feature[
                        feature
                    ] = f"{min(values_by_feature[feature])}-{max(values_by_feature[feature])}"
            if feature == "title":
                query_by_feature[feature] = values_by_feature[feature]
            if feature == "author_ids":
                query_by_feature[feature] = values_by_feature[feature]
            if feature == "author_countries":
                query_by_feature[feature] = values_by_feature[feature]
            if feature == "institution_types":
                query_by_feature[feature] = values_by_feature[feature]
            if feature == "institution_ids":
                query_by_feature[feature] = values_by_feature[feature]
            if feature in [
                "concepts_lv_1_ids",
                "concepts_lv_2_ids",
                "concepts_lv_3_ids",
            ]:
                if "concepts" not in query_by_feature:
                    query_by_feature["concepts"] = []

                query_by_feature["concepts"] += values_by_feature[feature]
            if feature == "doi":
                query_by_feature[feature] = values_by_feature[feature]
            if feature == "hosted_location_id":
                # This basically means we have to create multiple queries for each case
                if "hosted_location_id" not in query_by_feature:
                    query_by_feature[feature] = []
                query_by_feature[feature] += values_by_feature[feature]
            if feature == "hosted_location_type":
                query_by_feature[feature] = values_by_feature[feature]
            # For the ones that are not unique select simply the largest ID (largest frequency) and run with that
            if feature == "hosted_location":
                tabular_data_df = pl.DataFrame(tabular_data)
                # tabular_data_df = pd.DataFrame(tabular_data)
                processed_values = []
                for value in values_by_feature[feature]:
                    common_ids = Counter(
                        tabular_data_df.filter(pl.col("hosted_location").eq(value))
                        .select("hosted_location_id")
                        .to_numpy()
                        .flatten()
                        .tolist()
                    ).most_common()

                    if len(common_ids) > 0 and common_ids[0][0] not in processed_values:
                        processed_values.append(common_ids[0][0])

                if connector == "and":
                    if "hosted_location_id" not in query_by_feature:
                        query_by_feature["hosted_location_id"] = []
                    query_by_feature["hosted_location_id"] += processed_values
            if feature in [
                "concepts_lv_1",
                "concepts_lv_2",
                "concepts_lv_3",
            ]:
                tabular_data_df = pl.DataFrame(tabular_data)
                processed_values = []

                for value in values_by_feature[feature]:
                    filtered_df = tabular_data_df.with_columns(
                        pl.col(feature)
                        .apply(lambda x: x.to_list().index(value) if value in x else -1)
                        .alias("indexes")
                    ).filter(pl.col("indexes") > -1)

                    common_ids = Counter(
                        [
                            row[f"{feature}_ids"][row["indexes"]]
                            for row in filtered_df.rows(named=True)
                        ]
                    ).most_common()

                    if len(common_ids) > 0 and common_ids[0][0] not in processed_values:
                        processed_values.append(common_ids[0][0])

                if connector == "and":
                    if "concepts" not in query_by_feature:
                        query_by_feature["concepts"] = []
                    query_by_feature["concepts"] += processed_values

            if feature == "authors":
                tabular_data_df = pl.DataFrame(tabular_data)
                processed_values = []

                for value in values_by_feature[feature]:
                    filtered_df = tabular_data_df.with_columns(
                        pl.col("authors")
                        .apply(lambda x: x.to_list().index(value) if value in x else -1)
                        .alias("indexes")
                    ).filter(pl.col("indexes") > -1)

                    common_ids = Counter(
                        [
                            row["author_ids"][row["indexes"]]
                            for row in filtered_df.rows(named=True)
                        ]
                    ).most_common()

                    if len(common_ids) > 0 and common_ids[0][0] not in processed_values:
                        processed_values.append(common_ids[0][0])

                if "author_ids" not in query_by_feature:
                    query_by_feature["author_ids"] = []
                query_by_feature["author_ids"] += processed_values

            if feature == "author_institutions":
                tabular_data_df = pl.DataFrame(tabular_data)
                processed_values = []

                for value in values_by_feature[feature]:
                    filtered_df = tabular_data_df.with_columns(
                        pl.col("author_institutions")
                        .apply(lambda x: x.to_list().index(value) if value in x else -1)
                        .alias("indexes")
                    ).filter(pl.col("indexes") > -1)

                    common_ids = Counter(
                        [
                            row["institution_ids"][row["indexes"]]
                            for row in filtered_df.rows(named=True)
                        ]
                    ).most_common()

                    if len(common_ids) > 0 and common_ids[0][0] not in processed_values:
                        processed_values.append(common_ids[0][0])

                if "institution_ids" not in query_by_feature:
                    query_by_feature["institution_ids"] = []
                query_by_feature["institution_ids"] += processed_values

        # hosted_location_type
        # doi
        # hosted_location_id
        # Just return an empty dataset in this case
        query = Works()
        for feature in query_by_feature:
            if (
                feature
                in ["title", "hosted_location_type", "doi", "hosted_location_id"]
                and len(query_by_feature[feature]) > 1
            ) or len(query_by_feature[feature]) == 0:
                return pd.DataFrame()
            query = query.filter(
                **self.__generate_filter_query(feature, query_by_feature[feature])
            )

        pager = query.select(RETRIEVABLE_FIELDS)

        pages = self.oa_results.process_results(pager, page)
        return {"data": self.oa_results.to_dataframe(), "pages": pages}

    def advanced_search(
        self,
        dataset_name: str,
        query: dict,
        features: Dict[str, str],
        tabular_data=None,
        page: Optional[int] = 1,
    ) -> Dict:
        # Performs an advanced search with a dict representation of the advanced search query

        if tabular_data:
            if query["action"] == "visualise":
                query = query["query"]

            if query["action"] == "search":
                # unique_features = [query["feature"]]
                return self.simple_search(
                    dataset_name, query["keyphrase"], query["feature"], page
                )

            values_by_features = self.__get_values_by_feature(query)
            return self.__multi_feature_advanced_search(
                values_by_features, query["connector"], tabular_data, page
            )

        if "min" in query and "max" in query:
            feature = query["feature"]
            filter_query = f"{query['min']}-{query['max']}"
            return self.__run_search_by_feature(feature, filter_query, page)

        if "query" not in query and "queries" not in query:
            return self.simple_search(
                dataset_name, query["keyphrase"], query["feature"], page
            )

        return self.advanced_search(
            dataset_name,
            query["query"] if "query" in query else query,
            features,
            tabular_data,
            page,
        )

    def get_suggestions(self, dataset, query, feature) -> List:
        # Returns a list of suggestions for the provided value and feature
        item = None

        if feature in ["title", ""]:
            item = "works"
        if feature == "authors":
            item = "authors"
        if feature == "author_institutions":
            item = "institutions"
        if "concepts_" in feature:
            item = "concepts"
        if feature == "hosted_location":
            item = "sources"

        if not item:
            return [query]

        response = requests.get(
            f"https://api.openalex.org/autocomplete/{item}?q={query}"
        ).json()

        if response["meta"]["count"] == 0:
            return [query]

        return [query] + [result["display_name"] for result in response["results"]]
