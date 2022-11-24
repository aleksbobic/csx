from typing import Any, Dict, List, Union

import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch_dsl import Search, Q
import pytextrank
import spacy
import re


nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("textrank")

es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)


def get_index(index: str) -> Dict[str, Any]:
    """Retrieve elastic index"""
    return es.indices.get(index=index)


def get_all_indices() -> Dict[str, Any]:
    """Retrieve all elastic indices"""
    return es.indices.get(index="*")


def delete_index(index: str) -> None:
    """Delete elastic index"""
    es.indices.delete(index=index)


def create_index(index: str, mapping: Dict) -> None:
    """Create elastic index"""
    if not es.indices.exists(index=index):
        es.indices.create(index=index, body=mapping)


def bulk_populate(data) -> None:
    """Populate elasticsearch with given data. The index is defined in the data."""
    # We need to specify that elastic should wait
    # for the changes made using bulk to be available
    # before replying to other requests
    bulk(es, data, refresh="wait_for")


def range_filter_to_dataframe(
    feature: str,
    min: Union[int, float],
    max: Union[int, float],
    index: str,
    use_limit: bool = True,
) -> pd.DataFrame:
    """Run a range filter betwee values min and max on the provided index and feature and retrieve results as a dataframe"""
    search = Search(using=es, index=index)

    if use_limit:
        search = search[0:10000]
    else:
        search_length = search.count()
        search = search[0:search_length]

    results = search.filter("range", **{feature: {"gte": min, "lte": max}}).execute()

    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    return pd.DataFrame(elastic_list)


def query_to_dataframe(query: str, index: str, use_limit: bool = True) -> pd.DataFrame:
    """Run given query on the provided index and retrieve results as a dataframe"""
    search = Search(using=es, index=index)

    if use_limit:
        search = search[0:10000]
    else:
        search_length = search.count()
        search = search[0:search_length]

    results = search.query(query).execute()

    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    return pd.DataFrame(elastic_list)


def run_advanced_query(query, index, dimension_types) -> pd.DataFrame:
    """Assemble query from multiple query phrases. Each call should return a dataframe."""

    if "min" in query and "max" in query:
        return range_filter_to_dataframe(
            query["feature"], query["min"], query["max"], index
        )

    if query["action"] == "get dataset":
        return query_to_dataframe(Q("match_all"), index, False)

    if query["action"] == "extract keywords":
        source_feature = query["feature"]
        newFeatureName = query["newFeatureName"]
        results = run_advanced_query(query["query"], index, dimension_types)
        keywords = []

        for doc in nlp.pipe(results[source_feature].values):
            if doc.has_annotation("DEP"):
                keywords.append([phrase.text for phrase in doc._.phrases[:10]])
            else:
                keywords.append([])

        results[newFeatureName] = keywords

        return results

    if query["action"] == "count array":
        source_feature = query["feature"]
        newFeatureName = query["newFeatureName"]
        results = run_advanced_query(query["query"], index, dimension_types)

        results[newFeatureName] = results[source_feature].apply(lambda x: str(len(x)))
        return results

    # TODO: CHeck if feature is list
    if "query" not in query and "queries" not in query:
        if dimension_types[query["feature"]] == "list":

            results = query_to_dataframe(
                Q("match_phrase", **{query["feature"]: query["keyphrase"]}),
                index,
            )

            return results

        return query_to_dataframe(
            Q(
                "query_string",
                query=convert_to_elastic_safe_query(f"{query['keyphrase']}"),
                type="phrase",
                fields=[query["feature"]],
            ),
            index,
        )

    if query["action"] == "connect":
        if query["connector"] == "or":

            query_dfs = [
                run_advanced_query(entry, index, dimension_types)
                for entry in query["queries"]
            ]

            merged_df = (
                pd.concat(query_dfs, ignore_index=True)
                .drop_duplicates(subset=["entry"])
                .reset_index(drop=True)
            )

            return merged_df

        elif query["connector"] == "and":

            query_dfs = [
                run_advanced_query(entry, index, dimension_types)
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
        else:
            return query_to_dataframe(
                Q(
                    "bool",
                    must_not=[
                        Q(
                            "query_string",
                            query=convert_to_elastic_safe_query(
                                f"{query['queries'][0]['keyphrase']}"
                            ),
                            type="phrase",
                            fields=[query["queries"][0]["feature"]],
                        )
                    ],
                ),
                index,
            )

    return run_advanced_query(query["query"], index, dimension_types)


def convert_to_elastic_safe_query(query):
    return re.sub(
        '(\+|\-|\=|&&|\|\||\>|\<|\!|\(|\)|\{|\}|\[|\]|\^|"|~|\?|\:|\\\|\/)',
        "\\\\\\1",
        query,
    )
