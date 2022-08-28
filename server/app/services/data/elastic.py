from typing import Any, Dict, List, Union

import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch_dsl import Search

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


def bulk_populate(data: List[Any]) -> None:
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
