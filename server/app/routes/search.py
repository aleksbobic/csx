from elasticsearch_dsl.query import Query
from fastapi import APIRouter

from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q, Index
from typing import List, Dict, Any
from app.types import Node, Keyphrase

import json
import os
import pandas as pd
import spacy
import pytextrank
import pickle

nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("textrank")

from app.controllers.graph.converter import (
    get_graph,
    get_overview_graph,
    get_props_for_cached_nodes,
)
from app.services.graph.node import get_anchor_property_values
from app.utils.timer import use_timing

import app.utils.cache as csx_cache
import app.utils.analysis as csx_analysis

router = APIRouter()
es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)


def convert_query_to_df(query, search):
    results = search.query(query).execute()

    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    return pd.DataFrame(elastic_list)


def convert_filter_res_to_df(results):
    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    return pd.DataFrame(elastic_list)


def generate_advanced_query(query, search) -> pd.DataFrame:
    """Assemble query from multiple query phrases. Each call should return a dataframe."""

    if "min" in query and "max" in query:
        return convert_query_to_df(
            Q(
                "range",
                **{query["feature"]: {"gte": query["min"], "lte": query["max"]}},
            ),
            search,
        )

    if query["action"] == "get dataset":
        return convert_query_to_df(
            Q("match_all"),
            search,
        )

    if query["action"] == "extract keywords":
        source_feature = query["feature"]
        newFeatureName = query["newFeatureName"]
        results = generate_advanced_query(query["query"], search)
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
        results = generate_advanced_query(query["query"], search)

        results[newFeatureName] = results[source_feature].apply(lambda x: str(len(x)))
        return results

    if "query" not in query and "queries" not in query:
        return convert_query_to_df(
            Q(
                "query_string",
                query=f"{query['keyphrase']}",
                type="phrase",
                fields=[query["feature"]],
            ),
            search,
        )

    if query["action"] == "connect":
        if query["connector"] == "or":

            query_dfs = [
                generate_advanced_query(entry, search) for entry in query["queries"]
            ]

            merged_df = (
                pd.concat(query_dfs, ignore_index=True)
                .drop_duplicates(subset=["entry"])
                .reset_index(drop=True)
            )

            return merged_df

        elif query["connector"] == "and":

            query_dfs = [
                generate_advanced_query(entry, search) for entry in query["queries"]
            ]

            merged_df = pd.concat(query_dfs, ignore_index=True)

            return merged_df[merged_df.duplicated(subset=["entry"])].reset_index(
                drop=True
            )
        else:
            return convert_query_to_df(
                Q(
                    "bool",
                    must_not=[
                        Q(
                            "query_string",
                            query=f"{query['queries'][0]['keyphrase']}",
                            type="phrase",
                            fields=[query["queries"][0]["feature"]],
                        )
                    ],
                ),
                search,
            )

    return generate_advanced_query(query["query"], search)


def get_new_features(query):
    if query["action"] == "connect":
        return [get_new_features(entry) for entry in query["queries"]]

    if "newFeatureName" in query.keys():
        if query["action"] == "count array":
            return [
                {"feature": query["newFeatureName"], "type": "integer"}
            ] + get_new_features(query["query"])
        elif query["action"] == "extract keywords":
            return [
                {"feature": query["newFeatureName"], "type": "list"}
            ] + get_new_features(query["query"])

    if "query" not in query and "queries" not in query:
        return []

    return list(filter(None, get_new_features(query["query"])))


@use_timing
def convert_table_data(nodes: List[Node], elastic_results: List[Dict]) -> List[Dict]:
    """Extract table data from elastic results and node list."""

    dataEntries = {}

    for node in nodes:
        for entryId in node["entries"]:
            dataEntries[entryId] = {}

    for node in nodes:
        for entryId in node["entries"]:
            dataEntries[entryId][f"{node['feature']}_{node['label']}_id"] = node["id"]

    return [{**dataEntries[row["entry"]], **row} for row in elastic_results]


def isJson(testStr):
    try:
        json.loads(testStr)
        return True
    except:
        return False


def isNumber(testStr):
    try:
        float(testStr)
        return True
    except:
        return False


@router.get("/")
def search(
    query: str,
    user_id: str,
    visible_dimensions="",
    schema="",
    index="",
    anchor="",
    links="",
    graph_type="overview",
    visible_entries="[]",
    anchor_properties="[]",
) -> dict:
    """Run search using given query."""

    cache_data = csx_cache.load_current_graph(user_id)

    directory_path = os.getcwd()
    print("My current directory is : " + directory_path)

    with open(f"./app/data/config/{index}.json") as config:
        config = json.load(config)

        if schema == "":
            schema = config["schemas"][0]["relations"]
        else:
            schema = json.loads(schema)

        if visible_dimensions == "":
            visible_dimensions = config["default_visible_dimensions"]
        else:
            visible_dimensions = json.loads(visible_dimensions)

        default_search_fields = config["default_search_fields"]

        if anchor == "":
            anchor = config["anchor"]

        links = json.loads(links)

        if not links:
            links = config["links"]

    search = Search(using=es, index=index)
    search = search[0:10000]

    id_list = json.loads(visible_entries)
    new_dimensions = []

    if len(id_list):
        results = convert_filter_res_to_df(
            search.filter("terms", _id=id_list).execute()
        )
    elif not isJson(query) or isNumber(query):
        es_query = Q(
            "query_string",
            query=f"{query}",
            type="phrase",
            fields=default_search_fields,
        )
        results = convert_query_to_df(es_query, search)
    else:
        new_dimensions = {
            entry["feature"]: entry["type"]
            for entry in get_new_features(json.loads(query))
        }
        results = generate_advanced_query(json.loads(query), search)

    if len(results.index) == 0:
        return {"nodes": []}

    elastic_list = json.loads(results.to_json(orient="records"))

    all_dimensions = [
        property
        for property in es.indices.get(index=index)[index]["mappings"]["properties"]
    ]

    anchor_properties = json.loads(anchor_properties)

    comparison_results = csx_cache.is_same_graph(
        cache_data,
        {
            "index": index,
            "query": query,
            "schema": schema,
            "dimensions": links + [anchor]
            if graph_type == "overview"
            else visible_dimensions,
            "anchor_properties": get_anchor_property_values(
                elastic_list, anchor_properties
            )
            if graph_type == "overview"
            else None,
        },
        graph_type,
    )

    if graph_type == "overview":

        if comparison_results["difference"] == "anchor_properties":
            graph_data = get_props_for_cached_nodes(
                comparison_results, anchor_properties
            )

            graph_data["meta"]["anchor_properties"] = get_anchor_property_values(
                elastic_list, anchor_properties
            )
        else:
            graph_data = get_overview_graph(
                elastic_list, links, anchor, anchor_properties
            )

            # Graph data: nodes edges components
            graph_data["meta"] = {
                "new_dimensions": new_dimensions,
                "query": query,
                "dimensions": links + [anchor],
                "table_data": convert_table_data(graph_data["nodes"], elastic_list),
                "anchor_properties": get_anchor_property_values(
                    elastic_list, anchor_properties
                ),
            }

        cache_data = {
            "overview": graph_data,
            "detail": cache_data["detail"] if cache_data else {},
            "global": {
                "index": index,
                "new_dimensions": new_dimensions,
                "query": query,
                "table_data": convert_table_data(graph_data["nodes"], elastic_list),
                "results_df": results.to_json(),
            },
        }

        csx_cache.save_current_graph(
            user_id,
            cache_data,
            "overview",
            {"schema": schema},
        )

        return graph_data

    graph_data = get_graph(elastic_list, all_dimensions, visible_dimensions, schema)

    # Graph data: nodes edges components

    graph_data["meta"] = {
        "new_dimensions": new_dimensions,
        "query": query,
        "dimensions": visible_dimensions,
        "table_data": convert_table_data(graph_data["nodes"], elastic_list),
        "visible_entries": json.loads(visible_entries),
    }

    cache_data = {
        "overview": cache_data["overview"] if cache_data else {},
        "detail": graph_data,
        "global": {
            "index": index,
            "new_dimensions": new_dimensions,
            "query": query,
            "table_data": convert_table_data(graph_data["nodes"], elastic_list),
            "results_df": results.to_json(),
        },
    }

    csx_cache.save_current_graph(
        user_id,
        cache_data,
        "detail",
        {"schema": schema},
    )

    return graph_data


@router.get("/datasets")
def get_datasets() -> dict:
    """Get list of all datasets and their schemas if they have one"""

    datasets = {}

    for index in es.indices.get(index="*"):
        index_instance = Index(index, using=es)

        if "properties" not in index_instance.get()[index]["mappings"]:
            continue

        with open(f"./app/data/config/{index}.json") as f:
            data = json.load(f)
            datasets[index] = {"types": data["dimension_types"]}

        try:
            with open(f"./app/data/config/{index}.json") as config:
                loaded_config = json.load(config)
                datasets[index]["schemas"] = loaded_config["schemas"]
                datasets[index]["anchor"] = loaded_config["anchor"]
                datasets[index]["links"] = loaded_config["links"]
        except:
            datasets[index]["schemas"] = []
            datasets[index]["anchor"] = []
            datasets[index]["links"] = []

    return datasets
