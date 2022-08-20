from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from elasticsearch_dsl import Index, Q, Search
from elasticsearch_dsl.query import Query
import pandas as pd


es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)


def get_index(index):
    return es.indices.get(index=index)


def get_all_indices():
    return es.indices.get(index="*")


def delete_index(index):
    es.indices.delete(index=index)


def create_index(index, mapping):
    if not es.indices.exists(index=index):
        es.indices.create(index=index, body=mapping)


def bulk_populate(data):
    # We need to specify that elastic should wait
    # for the changes made using bulk to be available
    # before replying to other requests
    bulk(es, data, refresh="wait_for")


def convert_range_filter_to_df(feature, min, max, index, use_limit=True):
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


def convert_query_to_df(query, index, use_limit=True):
    search = Search(using=es, index=index)
    # TODO: Make interval dynamic so that we can make it infinite when retrieveing data for the mongo population
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
