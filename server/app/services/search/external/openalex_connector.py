import time
from datetime import datetime
from typing import Any, Dict, Generator, List, Union

import pandas as pd
import requests
from app.services.search.external.base import BaseExternalSearchConnector
from pyalex import Authors, Concepts, Institutions, Sources, Works

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
    def get_dataset_features(self, dataset_name: str) -> Union[dict, None]:
        # Returns the features of a dataset and their types
        return {
            "authors": "list",
            "author_ids": "list",
            "author_institutions": "list",
            "author_countries": "list",
            "institution_types": "list",
            "institution_ids": "list",
            "concepts_lv_1": "list",
            "concepts_lv_2": "list",
            "concepts_lv_3": "list",
            "citation_counts": "integer",
            "title": "string",
            "doi": "string",
            "publication_year": "integer",
            "hosted_location": "string",
            "hosted_location_type": "string",
            "hosted_location_id": "string",
        }

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

    def __get_author_names(self, authorship):
        return [author_object["author"]["display_name"] for author_object in authorship]

    def __get_author_ids(self, authorship):
        return [author_object["author"]["id"] for author_object in authorship]

    def __get_author_institutions(self, authorship):
        return [
            author_object["institutions"][0]["display_name"]
            if author_object["institutions"]
            and len(author_object["institutions"]) > 0
            and author_object["institutions"][0]
            and author_object["institutions"][0]["display_name"]
            else ""
            for author_object in authorship
        ]

    def __get_author_institution_countries(self, authorship):
        return [
            author_object["institutions"][0]["country_code"]
            if author_object["institutions"]
            else ""
            for author_object in authorship
        ]

    def __get_author_institution_types(self, authorship):
        return [
            author_object["institutions"][0]["type"]
            if author_object["institutions"]
            else ""
            for author_object in authorship
        ]

    def __get_author_institution_ids(self, authorship):
        return [
            author_object["institutions"][0]["id"]
            if author_object["institutions"]
            else ""
            for author_object in authorship
        ]

    def __get_concepts_lv_1(self, concepts):
        return [
            concept_object["display_name"]
            for concept_object in concepts
            if concept_object["score"] > 0.3 and concept_object["level"] == 1
        ]

    def __get_concepts_lv_2(self, concepts):
        return [
            concept_object["display_name"]
            for concept_object in concepts
            if concept_object["score"] > 0.3 and concept_object["level"] == 2
        ]

    def __get_concepts_lv_3(self, concepts):
        return [
            concept_object["display_name"]
            for concept_object in concepts
            if concept_object["score"] > 0.3 and concept_object["level"] == 3
        ]

    def __process_search_results(self, pager) -> pd.DataFrame:
        papers = []

        for page in pager:
            if len(papers) >= 200:
                break
            papers += page

        return pd.DataFrame(
            [
                {
                    "entry": paper["id"],
                    "authors": self.__get_author_names(paper["authorships"]),
                    "author_ids": self.__get_author_ids(paper["authorships"]),
                    "author_institutions": self.__get_author_institutions(
                        paper["authorships"]
                    ),
                    "author_countries": self.__get_author_institution_countries(
                        paper["authorships"]
                    ),
                    "institution_types": self.__get_author_institution_types(
                        paper["authorships"]
                    ),
                    "institution_ids": self.__get_author_institution_ids(
                        paper["authorships"]
                    ),
                    "concepts_lv_1": self.__get_concepts_lv_1(paper["concepts"]),
                    "concepts_lv_2": self.__get_concepts_lv_2(paper["concepts"]),
                    "concepts_lv_3": self.__get_concepts_lv_3(paper["concepts"]),
                    "citation_counts": paper["cited_by_count"],
                    "title": paper["title"],
                    "doi": paper["doi"]
                    if paper["doi"]
                    else paper["primary_location"]["landing_page_url"]
                    if paper["primary_location"]
                    and paper["primary_location"]["landing_page_url"]
                    and "doi.org" in paper["primary_location"]["landing_page_url"]
                    else paper["primary_location"]["pdf_url"]
                    if paper["primary_location"]
                    and paper["primary_location"]["pdf_url"]
                    and "doi.org" in paper["primary_location"]["pdf_url"]
                    else "",
                    "publication_year": paper["publication_year"],
                    "hosted_location": paper["primary_location"]["source"][
                        "display_name"
                    ]
                    if paper["primary_location"] and paper["primary_location"]["source"]
                    else "",
                    "hosted_location_type": paper["primary_location"]["source"]["type"]
                    if paper["primary_location"] and paper["primary_location"]["source"]
                    else "",
                    "hosted_location_id": paper["primary_location"]["source"]["id"]
                    if paper["primary_location"] and paper["primary_location"]["source"]
                    else "",
                }
                for paper in papers
            ]
        )

    def _search_for_concepts(self, name):
        concept_pager = Concepts().search(name).select(["id"]).paginate(per_page=50)

        concept_list = []
        for page in concept_pager:
            if len(concept_list) >= 50:
                break
            concept_list += page

        return [
            concept["id"].replace("https://openalex.org/", "")
            for concept in concept_list
        ]

    def _get_sources(self, source):
        source_pager = Sources().search(source).select(["id"]).paginate(per_page=50)

        source_list = []
        for page in source_pager:
            if len(source_list) >= 50:
                break
            source_list += page

        return [
            source["id"].replace("https://openalex.org/", "") for source in source_list
        ]

    def _get_institutions(self, name):
        institution_pager = (
            Institutions().search(name).select(["id"]).paginate(per_page=50)
        )

        institution_list = []
        for page in institution_pager:
            if len(institution_list) >= 50:
                break
            institution_list += page

        return [
            institution["id"].replace("https://openalex.org/", "")
            for institution in institution_list
        ]

    def _get_authors(self, name=None):
        author_pager = Authors().search(name).select(["id"]).paginate(per_page=50)

        author_list = []
        for page in author_pager:
            if len(author_list) >= 50:
                break
            author_list += page

        return [
            author["id"].replace("https://openalex.org/", "") for author in author_list
        ]

    def simple_search(
        self, dataset_name: str, query: Union[str, int, float], feature: str
    ) -> pd.DataFrame:
        if feature in ["concepts_lv_1", "concepts_lv_2", "concepts_lv_3"]:
            concept_ids = self._search_for_concepts(query)

            if len(concept_ids) == 0:
                return pd.DataFrame()

            pager = (
                Works()
                .filter(concepts={"id": "|".join(concept_ids)})
                .select(RETRIEVABLE_FIELDS)
                .paginate(per_page=200)
            )

            return self.__process_search_results(pager)

        if feature in ["authors", "author_ids"]:
            if feature == "authors":
                authors = self._get_authors(query)

                if len(authors) == 0:
                    return pd.DataFrame()
            else:
                authors = [str(query)]

            pager = (
                Works()
                .filter(authorships={"author": {"id": "|".join(authors)}})
                .select(RETRIEVABLE_FIELDS)
                .paginate(per_page=200)
            )

            return self.__process_search_results(pager)

        if feature in [
            "author_institutions",
            "institution_ids",
            "institution_types",
            "author_countries",
        ]:
            if feature == "author_institutions":
                institutions = self._get_institutions(query)

                if len(institutions) == 0:
                    return pd.DataFrame()
            elif feature == "author_countries":
                pager = (
                    Works()
                    .filter(authorships={"institutions": {"country_code": query}})
                    .select(RETRIEVABLE_FIELDS)
                    .paginate(per_page=200)
                )

                return self.__process_search_results(pager)
            elif feature == "institution_types":
                pager = (
                    Works()
                    .filter(authorships={"institutions": {"type": query}})
                    .select(RETRIEVABLE_FIELDS)
                    .paginate(per_page=200)
                )

                return self.__process_search_results(pager)
            else:
                institutions = [str(query)]

            pager = (
                Works()
                .filter(authorships={"institutions": {"id": "|".join(institutions)}})
                .select(RETRIEVABLE_FIELDS)
                .paginate(per_page=200)
            )

            return self.__process_search_results(pager)

        if feature == "citation_counts":
            pager = (
                Works()
                .filter(cited_by_count=query)
                .select(RETRIEVABLE_FIELDS)
                .paginate(per_page=200)
            )

            return self.__process_search_results(pager)

        if feature == "publication_year":
            pager = (
                Works()
                .filter(publication_year=query)
                .select(RETRIEVABLE_FIELDS)
                .paginate(per_page=200)
            )

            return self.__process_search_results(pager)

        if feature == "doi":
            pager = (
                Works()
                .filter(doi=query)
                .select(RETRIEVABLE_FIELDS)
                .paginate(per_page=200)
            )

            return self.__process_search_results(pager)

        if feature in ["hosted_location", "hosted_location_type", "hosted_location_id"]:
            if feature == "hosted_location":
                source_ids = self._get_sources(query)

                pager = (
                    Works()
                    .filter(primary_location={"source": {"id": "|".join(source_ids)}})
                    .select(RETRIEVABLE_FIELDS)
                    .paginate(per_page=200)
                )
            elif feature == "hosted_location_id":
                source_ids = [str(query)]
                pager = (
                    Works()
                    .filter(primary_location={"source": {"id": "|".join(source_ids)}})
                    .select(RETRIEVABLE_FIELDS)
                    .paginate(per_page=200)
                )
            else:
                pager = (
                    Works()
                    .filter(primary_location={"source": {"type": query}})
                    .select(RETRIEVABLE_FIELDS)
                    .paginate(per_page=200)
                )

            return self.__process_search_results(pager)

        # Performs a simple search with a string query
        pager = (
            Works()
            .filter(**{feature: {"search": query}})
            .select(RETRIEVABLE_FIELDS)
            .paginate(per_page=200)
        )

        return self.__process_search_results(pager)

    def __range_filter_to_dataframe(
        self,
        feature: str,
        min: Union[int, float],
        max: Union[int, float],
    ) -> pd.DataFrame:
        """Run a range filter betwee values min and max on the provided index and feature and retrieve results as a dataframe"""
        if feature == "citation_counts":
            feature = "cited_by_count"

        pager = (
            Works()
            .filter(**{feature: f"{min}-{max}"})
            .select(RETRIEVABLE_FIELDS)
            .paginate(per_page=200)
        )

        return self.__process_search_results(pager)

    def advanced_search(
        self,
        dataset_name: str,
        query: dict,
        features: Dict[str, str],
        tabular_data=None,
    ) -> pd.DataFrame:
        # Performs an advanced search with a dict representation of the advanced search query

        if tabular_data:
            if query["action"] == "connect":
                unique_features = list(
                    set([entry["feature"] for entry in query["queries"]])
                )

                if query["connector"] == "or":
                    if len(unique_features) == 1:
                        if unique_features[0] == "author_ids":
                            author_ids = [
                                entry["keyphrase"] for entry in query["queries"]
                            ]
                            pager = (
                                Works()
                                .filter(
                                    authorships={"author": {"id": "|".join(author_ids)}}
                                )
                                .select(RETRIEVABLE_FIELDS)
                                .paginate(per_page=200)
                            )

                            return self.__process_search_results(pager)
                        if unique_features[0] == "authors":
                            # handle case where authors are searched for instead of author_ids do the same for AND
                            tabular_data_df = pd.DataFrame(tabular_data)

                            author_ids = []

                            for entry in query["queries"]:
                                the_entry = tabular_data_df[
                                    tabular_data_df["entry"] == entry["entry"]
                                ]
                                the_entry_institution_ids = (
                                    the_entry.author_ids.values.tolist()[0]
                                )
                                the_entry_institutions = (
                                    the_entry.authors.values.tolist()[0]
                                )
                                author_ids.append(
                                    the_entry_institution_ids[
                                        the_entry_institutions.index(entry["keyphrase"])
                                    ]
                                )

                            pager = (
                                Works()
                                .filter(
                                    authorships={"author": {"id": "|".join(author_ids)}}
                                )
                                .select(RETRIEVABLE_FIELDS)
                                .paginate(per_page=200)
                            )

                            return self.__process_search_results(pager)

                        if unique_features[0] == "author_institutions":
                            tabular_data_df = pd.DataFrame(tabular_data)

                            institution_ids = []

                            for entry in query["queries"]:
                                the_entry = tabular_data_df[
                                    tabular_data_df["entry"] == entry["entry"]
                                ]
                                the_entry_institution_ids = (
                                    the_entry.institution_ids.values.tolist()[0]
                                )
                                the_entry_institutions = (
                                    the_entry.author_institutions.values.tolist()[0]
                                )
                                institution_ids.append(
                                    the_entry_institution_ids[
                                        the_entry_institutions.index(entry["keyphrase"])
                                    ]
                                )

                            pager = (
                                Works()
                                .filter(
                                    authorships={
                                        "institutions": {
                                            "id": "|".join(institution_ids)
                                        }
                                    }
                                )
                                .select(RETRIEVABLE_FIELDS)
                                .paginate(per_page=200)
                            )

                            return self.__process_search_results(pager)
                        if unique_features[0] == "author_countries":
                            author_countries = [
                                entry["keyphrase"] for entry in query["queries"]
                            ]
                            pager = (
                                Works()
                                .filter(
                                    authorships={
                                        "institutions": {
                                            "country_code": "|".join(author_countries)
                                        }
                                    }
                                )
                                .select(RETRIEVABLE_FIELDS)
                                .paginate(per_page=200)
                            )

                            return self.__process_search_results(pager)
                        if unique_features[0] == "institution_types":
                            institution_types = [
                                entry["keyphrase"] for entry in query["queries"]
                            ]
                            pager = (
                                Works()
                                .filter(
                                    authorships={
                                        "institutions": {
                                            "type": "|".join(institution_types)
                                        }
                                    }
                                )
                                .select(RETRIEVABLE_FIELDS)
                                .paginate(per_page=200)
                            )

                            return self.__process_search_results(pager)
                        if unique_features[0] == "institution_ids":
                            institution_ids = [
                                entry["keyphrase"] for entry in query["queries"]
                            ]
                            pager = (
                                Works()
                                .filter(
                                    authorships={
                                        "institutions": {
                                            "id": "|".join(institution_ids)
                                        }
                                    }
                                )
                                .select(RETRIEVABLE_FIELDS)
                                .paginate(per_page=200)
                            )

                            return self.__process_search_results(pager)

                if len(unique_features) == 1:
                    if unique_features[0] == "author_ids":
                        author_ids = [entry["keyphrase"] for entry in query["queries"]]
                        pager = (
                            Works()
                            .filter(authorships={"author": {"id": author_ids}})
                            .select(RETRIEVABLE_FIELDS)
                            .paginate(per_page=200)
                        )

                        return self.__process_search_results(pager)

                    if unique_features[0] == "authors":
                        # handle case where authors are searched for instead of author_ids do the same for AND
                        tabular_data_df = pd.DataFrame(tabular_data)

                        author_ids = []

                        for entry in query["queries"]:
                            the_entry = tabular_data_df[
                                tabular_data_df["entry"] == entry["entry"]
                            ]
                            the_entry_institution_ids = (
                                the_entry.author_ids.values.tolist()[0]
                            )
                            the_entry_institutions = the_entry.authors.values.tolist()[
                                0
                            ]
                            author_ids.append(
                                the_entry_institution_ids[
                                    the_entry_institutions.index(entry["keyphrase"])
                                ]
                            )

                        pager = (
                            Works()
                            .filter(authorships={"author": {"id": author_ids}})
                            .select(RETRIEVABLE_FIELDS)
                            .paginate(per_page=200)
                        )

                        return self.__process_search_results(pager)

                    if unique_features[0] == "author_institutions":
                        tabular_data_df = pd.DataFrame(tabular_data)

                        institution_ids = []

                        for entry in query["queries"]:
                            the_entry = tabular_data_df[
                                tabular_data_df["entry"] == entry["entry"]
                            ]
                            the_entry_institution_ids = (
                                the_entry.institution_ids.values.tolist()[0]
                            )
                            the_entry_institutions = (
                                the_entry.author_institutions.values.tolist()[0]
                            )
                            institution_ids.append(
                                the_entry_institution_ids[
                                    the_entry_institutions.index(entry["keyphrase"])
                                ]
                            )

                        pager = (
                            Works()
                            .filter(
                                authorships={"institutions": {"id": institution_ids}}
                            )
                            .select(RETRIEVABLE_FIELDS)
                            .paginate(per_page=200)
                        )

                        return self.__process_search_results(pager)
                    if unique_features[0] == "author_countries":
                        author_countries = [
                            entry["keyphrase"] for entry in query["queries"]
                        ]
                        pager = (
                            Works()
                            .filter(
                                authorships={
                                    "institutions": {"country_code": author_countries}
                                }
                            )
                            .select(RETRIEVABLE_FIELDS)
                            .paginate(per_page=200)
                        )

                        return self.__process_search_results(pager)
                    if unique_features[0] == "institution_types":
                        institution_types = [
                            entry["keyphrase"] for entry in query["queries"]
                        ]
                        pager = (
                            Works()
                            .filter(
                                authorships={
                                    "institutions": {"type": institution_types}
                                }
                            )
                            .select(RETRIEVABLE_FIELDS)
                            .paginate(per_page=200)
                        )

                        return self.__process_search_results(pager)
                    if unique_features[0] == "institution_ids":
                        institution_ids = [
                            entry["keyphrase"] for entry in query["queries"]
                        ]
                        pager = (
                            Works()
                            .filter(
                                authorships={"institutions": {"id": institution_ids}}
                            )
                            .select(RETRIEVABLE_FIELDS)
                            .paginate(per_page=200)
                        )

                        return self.__process_search_results(pager)

        if "min" in query and "max" in query:
            if features[query["feature"]] == "integer":
                return self.__range_filter_to_dataframe(
                    query["feature"], int(query["min"]), int(query["max"])
                )

            return self.__range_filter_to_dataframe(
                query["feature"], float(query["min"]), float(query["max"])
            )

        if "query" not in query and "queries" not in query:
            return self.simple_search(
                dataset_name,
                query["keyphrase"],
                query["feature"],
            )

        return self.advanced_search(
            dataset_name, query["query"], features, tabular_data
        )

    def get_suggestions(self, dataset, query, feature) -> List:
        # Returns a list of suggestions for the provided value and feature
        item = ""

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

        if item == "":
            return [query]

        response = requests.get(
            f"https://api.openalex.org/autocomplete/{item}?q={query}"
        ).json()
        if response["meta"]["count"] == 0:
            return [query]
        else:
            return [query] + [result["display_name"] for result in response["results"]]

        return [query]
