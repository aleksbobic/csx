import itertools
import json
import os
from typing import List, Literal

import pandas as pd
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Q, Search
from fastapi import APIRouter
from pydantic import BaseModel

import app.services.graph.graph as csx_graph
import app.services.data.elastic as csx_es
import app.services.data.redis as csx_redis
import app.services.graph.graph as csx_graph
import app.services.graph.nodes as csx_nodes
import app.services.data.autocomplete as csx_auto

router = APIRouter()
es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)


def convert_filter_res_to_df(results):
    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    return pd.DataFrame(elastic_list)


def get_new_features(query):
    if query["action"] == "connect":
        return list(
            itertools.chain.from_iterable(
                [get_new_features(entry) for entry in query["queries"]]
            )
        )

    if "newFeatureName" in query.keys():
        if query["action"] == "count array":
            return [{"feature": query["newFeatureName"], "type": "integer"}] + list(
                itertools.chain.from_iterable(get_new_features(query["query"]))
            )
        elif query["action"] == "extract keywords":
            return [{"feature": query["newFeatureName"], "type": "list"}] + list(
                itertools.chain.from_iterable(get_new_features(query["query"]))
            )

    if "query" not in query and "queries" not in query:
        return []

    return list(
        itertools.chain.from_iterable(filter(None, get_new_features(query["query"])))
    )


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


class Data(BaseModel):
    query: str
    user_id: str
    search_uuid: str
    visible_dimensions: List
    graph_schema: List
    index: str
    anchor: str
    links: List
    graph_type: Literal["overview", "detail"]
    visible_entries: List
    anchor_properties: List


@router.post("/")
def search(data: Data) -> dict:

    query = data.query
    user_id = data.user_id
    search_uuid = data.search_uuid
    visible_dimensions = data.visible_dimensions
    schema = data.graph_schema
    index = data.index
    anchor = data.anchor
    links = data.links
    graph_type = data.graph_type
    visible_entries = data.visible_entries
    anchor_properties = data.anchor_properties

    """Run search using given query."""
    cache_data = csx_redis.load_current_graph(user_id)

    directory_path = os.getcwd()
    print("My current directory is : " + directory_path)

    with open(f"./app/data/config/{index}.json") as config:
        config = json.load(config)

        dimension_types = config["dimension_types"]

        if len(schema) == 0:
            schema = config["schemas"][0]["relations"]

        if len(visible_dimensions) == 0:
            visible_dimensions = config["default_visible_dimensions"]

        default_search_fields = config["default_search_fields"]

        if anchor == "":
            anchor = config["anchor"]

        if not links:
            links = config["links"]

    search = Search(using=es, index=index)
    search = search[0:10000]

    id_list = visible_entries
    query_generated_dimensions = {}

    if len(id_list):
        results = convert_filter_res_to_df(
            search.filter("terms", _id=id_list).execute()
        )
    elif not isJson(query) or isNumber(query):

        filtered_fields = default_search_fields

        if not isNumber(query):
            filtered_fields = [
                field
                for field in filtered_fields
                if dimension_types[field] not in ["integer", "float"]
            ]

        es_query = Q(
            "query_string",
            query=f"{query}",
            type="phrase",
            fields=filtered_fields,
        )
        results = csx_es.query_to_dataframe(es_query, index)
    else:

        query_generated_dimensions = {
            entry["feature"]: entry["type"]
            for entry in get_new_features(json.loads(query))
        }

        results = csx_es.run_advanced_query(json.loads(query), index, dimension_types)

    if len(results.index) == 0:
        return {"nodes": []}

    elastic_json = json.loads(results.to_json(orient="records"))

    dimensions = {
        "links": links,
        "anchor": {"dimension": anchor, "props": anchor_properties},
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

    comparison_res = csx_redis.compare_instances(
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
        "from_scratch": lambda: csx_graph.get_graph_from_scratch(
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
        "from_anchor_properties": lambda: csx_graph.get_graph_with_new_anchor_props(
            comparison_res, graph_type, dimensions, elastic_json, user_id
        ),
        "from_existing_data": lambda: csx_graph.get_graph_from_existing_data(
            graph_type,
            dimensions,
            elastic_json,
            visible_entries,
            query,
            cache_data,
            user_id,
            schema,
            anchor_properties,
            index,
        ),
        "from_cache": lambda: csx_graph.get_graph_from_cache(
            comparison_res, graph_type
        ),
    }

    return comparison_switch[comparison_res["action"]]()


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
                    feature: json.dumps(loaded_config["search_hints"][feature])
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


class SuggestionData(BaseModel):
    index: str
    feature: str
    input: str


@router.post("/suggest")
def get_suggestion(data: SuggestionData):
    return csx_auto.get_suggestions(data.index, data.input, data.feature)
