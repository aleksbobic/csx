from elasticsearch_dsl.query import Query
from fastapi import APIRouter

from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q, Index
from typing import List, Dict
from app.types import Node, Keyphrase

import json
import os


from app.controllers.graph.converter import get_graph, get_overview_graph
from app.utils.timer import use_timing

router = APIRouter()
es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)


def generate_advanced_query(keyphrases: List[Keyphrase], connector: str) -> Query:
    """Assemble query from multiple query phrases."""
    query_list = [
        Q("match_phrase", **{phrase["type"]: phrase["label"]}) for phrase in keyphrases
    ]

    if connector == "or":
        return Q("bool", should=query_list)

    return Q("bool", must=query_list)


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

    for row in elastic_results:
        if row["entry"] == "134":
            print(row)
    return [{**dataEntries[row["entry"]], **row} for row in elastic_results]


@router.get("/")
def search(
    query: str,
    visible_dimensions="",
    schema="",
    index="aminer",
    connector="",
    anchor="",
    links="",
    graph_type="overview",
    visible_entries="[]",
) -> dict:
    """Run search using given query."""

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

    if len(id_list):
        results = search.filter("terms", _id=id_list).execute()
    else:
        es_query = (
            Q(
                "multi_match",
                query=query,
                type="phrase",
                fields=default_search_fields,
            )
            if connector == ""
            else generate_advanced_query(json.loads(query), connector)
        )

        results = search.query(es_query).execute()

    if results["hits"]["total"]["value"] == 0:
        return {"nodes": []}

    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    all_dimensions = [
        property
        for property in es.indices.get(index=index)[index]["mappings"]["properties"]
    ]

    if graph_type == "overview":
        graph_data = get_overview_graph(elastic_list, links, anchor)
        graph_data["meta"] = {
            "graph": query,
            "dimensions": links + [anchor],
            "table_data": convert_table_data(graph_data["nodes"], elastic_list),
        }

        return graph_data

    graph_data = get_graph(
        elastic_list, all_dimensions, visible_dimensions, schema, anchor
    )

    graph_data["meta"] = {
        "graph": query,
        "dimensions": visible_dimensions,
        "table_data": convert_table_data(graph_data["nodes"], elastic_list),
        "visible_entries": json.loads(visible_entries),
    }

    return graph_data


@router.get("/datasets")
def get_datasets() -> dict:
    """Get list of all datasets and their schemas if they have one"""

    datasets = {}

    for index in es.indices.get(index="*"):
        index_instance = Index(index, using=es)

        if "properties" not in index_instance.get()[index]["mappings"]:
            continue

        datasets[index] = {
            "types": list(index_instance.get()[index]["mappings"]["properties"].keys())
        }

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
