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
import app.services.graph.graph as csx_graph
import app.services.graph.nodes as csx_nodes
import app.services.data.autocomplete as csx_auto
import app.services.data.mongo as csx_data
import app.services.study.study as csx_study
from app.utils.typecheck import isJson, isNumber

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


class Data(BaseModel):
    query: str
    user_id: str
    study_id: str
    search_uuid: str
    visible_dimensions: List
    graph_schema: List
    index: str
    anchor: str
    links: List
    graph_type: Literal["overview", "detail"]
    visible_entries: List
    anchor_properties: List
    action_time: str


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
                datasets[index]["default_search_fields"] = loaded_config[
                    "default_search_fields"
                ]

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
            datasets[index]["default_search_fields"] = []

    return datasets


class SuggestionData(BaseModel):
    index: str
    feature: str
    input: str


@router.post("/suggest")
def get_suggestion(data: SuggestionData):
    return csx_auto.get_suggestions(data.index, data.input, data.feature)
