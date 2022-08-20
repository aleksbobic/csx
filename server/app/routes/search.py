import json
import os
from typing import Dict, List

import pandas as pd
import pytextrank
import spacy
from app.types import Node
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Q, Search
from fastapi import APIRouter

nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("textrank")

import app.utils.analysis as csx_analysis
import app.utils.cache as csx_cache
import app.utils.elastic as csx_es
from app.controllers.graph.converter import (
    get_graph,
    generate_graph_metadata,
    get_props_for_cached_nodes,
)
from app.services.graph.node import get_anchor_property_values
from app.utils.timer import use_timing

router = APIRouter()
es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)


def convert_filter_res_to_df(results):
    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    return pd.DataFrame(elastic_list)


def generate_advanced_query(query, index, dimension_types) -> pd.DataFrame:
    """Assemble query from multiple query phrases. Each call should return a dataframe."""

    if "min" in query and "max" in query:
        return csx_es.convert_range_filter_to_df(
            query["feature"], query["min"], query["max"], index
        )

    if query["action"] == "get dataset":
        return csx_es.convert_query_to_df(Q("match_all"), index, False)

    if query["action"] == "extract keywords":
        source_feature = query["feature"]
        newFeatureName = query["newFeatureName"]
        results = generate_advanced_query(query["query"], index, dimension_types)
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
        results = generate_advanced_query(query["query"], index, dimension_types)

        results[newFeatureName] = results[source_feature].apply(lambda x: str(len(x)))
        return results

    # TODO: CHeck if feature is list
    if "query" not in query and "queries" not in query:
        if dimension_types[query["feature"]] == "list":

            results = csx_es.convert_query_to_df(
                Q("match_phrase", **{query["feature"]: query["keyphrase"]}),
                index,
            )

            return results

        return csx_es.convert_query_to_df(
            Q(
                "query_string",
                query=f"{query['keyphrase']}",
                type="phrase",
                fields=[query["feature"]],
            ),
            index,
        )

    if query["action"] == "connect":
        if query["connector"] == "or":

            query_dfs = [
                generate_advanced_query(entry, index, dimension_types)
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
                generate_advanced_query(entry, index, dimension_types)
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
            return csx_es.convert_query_to_df(
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
                index,
            )

    return generate_advanced_query(query["query"], index, dimension_types)


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
    search_uuid="",
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

        dimension_types = config["dimension_types"]

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
    query_generated_dimensions = []

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
        results = csx_es.convert_query_to_df(es_query, index)
    else:
        query_generated_dimensions = {
            entry["feature"]: entry["type"]
            for entry in get_new_features(json.loads(query))
        }
        results = generate_advanced_query(json.loads(query), index, dimension_types)

    if len(results.index) == 0:
        return {"nodes": []}

    elastic_json = json.loads(results.to_json(orient="records"))

    dimensions = {
        "links": links,
        "anchor": {"dimension": anchor, "props": json.loads(anchor_properties)},
        "visible": visible_dimensions,
        "query_generated": query_generated_dimensions,
        "all": [
            property
            for property in csx_es.get_index(index)[index]["mappings"]["properties"]
        ],
    }

    current_dimensions = visible_dimensions

    if graph_type == "overview":
        current_dimensions = links + [anchor]

    comparison_res = csx_cache.compare_instances(
        cache_data,
        {
            "index": index,
            "search_uuid": search_uuid,
            "query": query,
            "schema": schema,
            "dimensions": current_dimensions,
            "anchor_properties": anchor_properties,
        },
        graph_type,
    )

    comparison_switch = {
        "from_scratch": lambda: get_graph_from_scratch(
            graph_type,
            dimensions,
            elastic_json,
            visible_entries,
            query,
            index,
            cache_data,
            search_uuid,
            results,
            user_id,
            schema,
            anchor_properties,
            comparison_res,
        ),
        "from_anchor_properties": lambda: get_graph_with_new_anchor_props(
            comparison_res, graph_type, dimensions, elastic_json
        ),
        "from_existing_data": lambda: get_graph_from_existing_data(
            graph_type,
            dimensions,
            elastic_json,
            visible_entries,
            query,
            cache_data,
            user_id,
            schema,
            anchor_properties,
            comparison_res,
            index,
        ),
        "from_cache": lambda: get_graph_from_cache(comparison_res, graph_type),
    }

    return comparison_switch[comparison_res["action"]]()


def get_graph_from_scratch(
    graph_type,
    dimensions,
    elastic_json,
    visible_entries,
    query,
    index,
    cache_data,
    search_uuid,
    results,
    user_id,
    schema,
    anchor_properties,
    comparison_res,
):
    graph_data = get_graph(graph_type, elastic_json, dimensions, schema, index)
    table_data = convert_table_data(graph_data["nodes"], elastic_json)
    anchor_property_values = get_anchor_property_values(
        elastic_json, dimensions["anchor"]["props"]
    )

    graph_data["meta"] = generate_graph_metadata(
        graph_type,
        dimensions,
        table_data,
        schema,
        query,
        visible_entries,
        anchor_properties,
        anchor_property_values,
        graph_data,
    )

    cache_data = csx_cache.generate_cache_data(
        graph_type,
        cache_data,
        graph_data,
        search_uuid,
        index,
        query,
        dimensions,
        table_data,
        results,
        comparison_res,
        elastic_json,
    )

    csx_cache.save_current_graph(user_id, cache_data, graph_type)
    csx_analysis.graph_from_graph_data(cache_data[graph_type])

    return graph_data


def get_graph_with_new_anchor_props(
    comparison_res, graph_type, dimensions, elastic_json
):
    graph_data = get_props_for_cached_nodes(
        comparison_res, dimensions["anchor"]["props"], graph_type
    )

    graph_data["meta"]["anchor_property_values"] = get_anchor_property_values(
        elastic_json, dimensions["anchor"]["props"]
    )

    return graph_data


def get_graph_from_existing_data(
    graph_type,
    dimensions,
    elastic_json,
    visible_entries,
    query,
    cache_data,
    user_id,
    schema,
    anchor_properties,
    comparison_res,
    index,
):
    # Take global table data and generate grpah
    elastic_json = comparison_res["data"]["global"]["elastic_json"]
    graph_data = get_graph(graph_type, elastic_json, dimensions, schema, index)
    table_data = convert_table_data(graph_data["nodes"], elastic_json)

    anchor_property_values = get_anchor_property_values(
        elastic_json, dimensions["anchor"]["props"]
    )

    graph_data["meta"] = generate_graph_metadata(
        graph_type,
        dimensions,
        table_data,
        schema,
        query,
        visible_entries,
        anchor_properties,
        anchor_property_values,
        graph_data,
    )

    cache_data[graph_type] = graph_data

    csx_cache.save_new_instance_of_cache_data(user_id, cache_data)

    return graph_data


def get_graph_from_cache(comparison_res, graph_type):
    return comparison_res["data"][graph_type]


@router.get("/datasets")
def get_datasets() -> dict:
    """Get list of all datasets and their schemas if they have one"""

    datasets = {}

    for index in csx_es.get_all_indices():
        if "properties" not in csx_es.get_index(index)[index]["mappings"]:
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

                datasets[index]["search_hints"] = {
                    feature: loaded_config["search_hints"][feature]
                    for feature in loaded_config["search_hints"]
                    if data["dimension_types"][feature]
                    in ["integer", "float", "category", "list"]
                }
        except Exception as e:
            print("There was an exception", e)
            datasets[index]["schemas"] = []
            datasets[index]["anchor"] = []
            datasets[index]["links"] = []
            datasets[index]["search_hints"] = []

    return datasets
