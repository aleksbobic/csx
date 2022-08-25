from typing import List
from fastapi import APIRouter
import json
import app.utils.cache as csx_cache
import pandas as pd
import networkx as nx
import app.utils.analysis as csx_analysis
from app.services.graph.component import (
    get_components,
    enrich_nodes_with_components,
    enrich_nodes_with_neighbors,
    enrich_edges_with_components,
    enrich_components_with_top_connections,
)


router = APIRouter()

from pydantic import BaseModel


class Data(BaseModel):
    nodes: List
    user_id: str
    graph_type: str


@router.post("/trim")
def trim_network(
    data: Data,
):
    provided_nodes = data.nodes
    user_id = data.user_id
    graph_type = data.graph_type

    cache_data = csx_cache.load_current_graph(user_id)

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

    csx_cache.save_new_instance_of_cache_data(user_id, cache_data)

    return cache_data[graph_type]


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

    # FIXME: Table data should be only in global and should be at all times the same between detail and overview

    # Modify table data of graph
    cache_data[graph_type]["meta"]["table_data"] = cache_data["global"]["table_data"]

    # Generate new NetworkX graph
    cache_data[graph_type]["meta"]["nx_graph"] = nx.to_dict_of_dicts(
        csx_analysis.graph_from_graph_data(cache_data[graph_type])
    )

    components = get_components(
        cache_data[graph_type]["nodes"],
        [],
        csx_analysis.graph_from_graph_data(cache_data[graph_type]),
    )

    nodes = enrich_nodes_with_components(new_nodes, components)
    nodes = enrich_nodes_with_neighbors(
        nodes, [], csx_analysis.graph_from_graph_data(cache_data[graph_type])
    )

    cache_data[graph_type]["edges"] = enrich_edges_with_components(
        cache_data[graph_type]["edges"], components
    )

    cache_data[graph_type]["nodes"] = nodes

    if graph_type == "overview":
        components = enrich_components_with_top_connections(
            components, cache_data[graph_type]["edges"]
        )
    components = sorted(components, key=lambda component: -component["node_count"])

    cache_data[graph_type]["components"] = components

    cache_data[graph_type]["meta"]["max_degree"] = csx_analysis.get_max_degree(
        csx_analysis.graph_from_graph_data(cache_data[graph_type])
    )

    return cache_data
