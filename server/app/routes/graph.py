from typing import List, cast

import app.services.data.redis as csx_redis

import app.services.graph.components as csx_components
import app.services.graph.edges as csx_edges
import app.services.graph.graph as csx_graph
import app.services.graph.nodes as csx_nodes
import app.services.data.elastic as csx_es

import networkx as nx
import pandas as pd
from fastapi import APIRouter
import json

router = APIRouter()

from pydantic import BaseModel


class TrimData(BaseModel):
    nodes: List
    user_id: str
    graph_type: str


@router.post("/trim")
def trim_network(
    data: TrimData,
):
    provided_nodes = data.nodes
    user_id = data.user_id
    graph_type = data.graph_type

    cache_data = csx_redis.load_current_graph(user_id)

    # Get entries of visible_nodes
    entry_list = [
        node["entries"]
        for node in cache_data[graph_type]["nodes"]
        if node["id"] in provided_nodes
    ]

    # Flatten list of entries and get unique values
    entries = list(set([entry for entries in entry_list for entry in entries]))

    cache_data = calculate_global_cache_properties(cache_data, entries)

    if graph_type == "overview":
        cache_data = calculate_trimmed_graph(cache_data, entries, "overview")
        if cache_data["detail"] != {}:
            cache_data = calculate_trimmed_graph(cache_data, entries, "detail")
    else:
        cache_data = calculate_trimmed_graph(cache_data, entries, "detail")
        if cache_data["overview"] != {}:
            cache_data = calculate_trimmed_graph(cache_data, entries, "overview")

    csx_redis.save_new_instance_of_cache_data(user_id, cache_data)

    return cache_data[graph_type]


class ExpandData(BaseModel):
    values: dict
    user_id: str
    graph_type: str
    anchor: str
    visible_entries: List
    anchor_properties: List
    graph_schema: List
    visible_dimensions: List
    links: List
    search_uuid: str


@router.post("/expand")
def expand_network(
    data: ExpandData,
):
    values = data.values
    user_id = data.user_id
    graph_type = data.graph_type
    anchor_properties = data.anchor_properties
    schema = data.graph_schema
    visible_dimensions = data.visible_dimensions
    anchor = data.anchor
    links = data.links
    search_uuid = data.search_uuid

    cache_data = csx_redis.load_current_graph(user_id)

    if len(values["nodes"]) == 1:
        query = {
            "action": "visualise",
            "query": {
                "action": "search",
                "feature": values["nodes"][0]["feature"],
                "keyphrase": values["nodes"][0]["value"],
            },
        }
    else:
        atomic_queries = [
            {
                "action": "search",
                "feature": entry["feature"],
                "keyphrase": entry["value"],
            }
            for entry in values["nodes"]
        ]

        query = {
            "action": "visualise",
            "query": {
                "action": "connect",
                "connector": values["connector"],
                "queries": atomic_queries,
            },
        }

    dimension_types = {}

    with open(f"./app/data/config/{cache_data['global']['index']}.json") as config:
        config = json.load(config)

        dimension_types = config["dimension_types"]

    index = cache_data["global"]["index"]

    with open(f"./app/data/config/{index}.json") as config:
        config = json.load(config)

        dimension_types = config["dimension_types"]

        if len(schema) == 0:
            schema = config["schemas"][0]["relations"]

        if len(visible_dimensions) == 0:
            visible_dimensions = config["default_visible_dimensions"]

        if anchor == "":
            anchor = config["anchor"]

        if not links:
            links = config["links"]

    results = csx_es.run_advanced_query(
        query, cache_data["global"]["index"], dimension_types
    )

    elastic_json = cache_data["global"]["elastic_json"]
    new_elastic_json = json.loads(results.to_json(orient="records"))

    entries = list(set([row["entry"] for row in elastic_json]))

    elastic_json = elastic_json + [
        row for row in new_elastic_json if row["entry"] not in entries
    ]

    results = pd.concat(
        [
            pd.read_json(cache_data["global"]["results_df"]),
            results[~results["entry"].isin(entries)],
        ]
    ).reset_index(drop=True)

    dimensions = {
        "links": links,
        "anchor": {"dimension": anchor, "props": anchor_properties},
        "visible": visible_dimensions,
        "query_generated": {},
        "all": [
            property
            for property in csx_es.get_index(index)[index]["mappings"]["properties"]
        ],
    }

    return csx_graph.get_graph_from_scratch(
        graph_type,
        dimensions,
        elastic_json,
        [],
        cache_data["global"]["query"],
        index,
        cache_data,
        search_uuid,
        results,
        user_id,
        schema,
        anchor_properties,
        {"difference": "search_uuid"},
    )


def calculate_global_cache_properties(cache_data, entries):
    # Filter table data to include only entries necessary
    cache_data["global"]["table_data"] = [
        data for data in cache_data["global"]["table_data"] if data["entry"] in entries
    ]

    # Filter tabular data by entries
    tabular_data_df = pd.read_json(cache_data["global"]["results_df"])

    cache_data["global"]["results_df"] = tabular_data_df[
        tabular_data_df["entry"].isin(entries)
    ].to_json()

    cache_data["global"]["elastic_json"] = [
        data
        for data in cache_data["global"]["elastic_json"]
        if data["entry"] in entries
    ]

    return cache_data


def calculate_trimmed_graph(cache_data, entries, graph_type):

    df = cast(pd.DataFrame, pd.read_json(cache_data["global"]["results_df"]))

    # Filter graph nodes
    new_nodes = [
        node
        for node in cache_data[graph_type]["nodes"]
        if len(set(node["entries"]).intersection(set(entries))) > 0
    ]

    cache_data[graph_type]["nodes"] = new_nodes

    # Get visible nodes
    visible_nodes = [
        node["id"]
        for node in new_nodes
        if len(set(node["entries"]).intersection(set(entries))) > 0
    ]

    for node in cache_data[graph_type]["nodes"]:
        node["entries"] = list(set(node["entries"]).intersection(set(entries)))

    # Filter graph edges
    cache_data[graph_type]["edges"] = [
        edge
        for edge in cache_data[graph_type]["edges"]
        if edge["source"] in visible_nodes and edge["target"] in visible_nodes
    ]

    # Filter graph components
    cache_data[graph_type]["components"] = [
        component
        for component in cache_data[graph_type]["components"]
        if len(list(set(component["nodes"]).intersection(set(visible_nodes)))) > 0
    ]

    # Modify table data of graph
    # Due to the particular structure of table_data in the cxs client both overview and detail graph have to have their own instance of table data
    cache_data[graph_type]["meta"]["table_data"] = csx_graph.convert_table_data(
        cache_data[graph_type]["nodes"], cache_data["global"]["elastic_json"]
    )

    # Generate new NetworkX graph
    cache_data[graph_type]["meta"]["nx_graph"] = nx.to_dict_of_dicts(
        csx_graph.from_graph_data(cache_data[graph_type])
    )

    components = csx_components.get_components(
        cache_data[graph_type]["nodes"],
        [],
        csx_graph.from_graph_data(cache_data[graph_type]),
    )

    nodes = csx_nodes.enrich_with_components(new_nodes, components)
    nodes = csx_nodes.enrich_with_neighbors(
        nodes, [], csx_graph.from_graph_data(cache_data[graph_type])
    )

    nodes = csx_nodes.adjust_node_size(
        nodes, df, cache_data[graph_type]["meta"]["dimensions"]
    )

    cache_data[graph_type]["edges"] = csx_edges.enrich_with_components(
        cache_data[graph_type]["edges"], components
    )

    cache_data[graph_type]["nodes"] = nodes

    if graph_type == "overview":
        components = csx_components.enrich_with_top_connections(
            components, cache_data[graph_type]["edges"]
        )

        for property_value in cache_data[graph_type]["meta"]["anchor_property_values"]:
            property_value["values"] = [
                node["properties"][property_value["property"]]
                for node in cache_data[graph_type]["nodes"]
            ]

    components = sorted(components, key=lambda component: -component["node_count"])

    cache_data[graph_type]["components"] = components

    cache_data[graph_type]["meta"]["max_degree"] = csx_graph.get_max_degree(
        csx_graph.from_graph_data(cache_data[graph_type])
    )

    return cache_data
