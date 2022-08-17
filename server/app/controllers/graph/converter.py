from typing import List
import pandas as pd
from app.services.graph.component import (
    get_components,
    enrich_nodes_with_components,
    enrich_edges_with_components,
    enrich_components_with_top_connections,
)
from app.services.graph.edge import (
    get_edges,
    get_nx_edges,
    get_edge_tuples,
    get_overview_edge_tuples,
    get_overview_edges,
    get_overview_nx_edges,
)
from app.services.graph.node import (
    get_nodes,
    get_positions,
    get_visible_nodes,
    get_node_ids_with_labels,
)
import app.utils.analysis as csx_analysis
import app.utils.data as csx_data
from app.utils.timer import use_timing
from app.types import SchemaElement
import json


def get_graph(graph_type, elastic_json, dimensions, schema, index):
    if graph_type == "overview":
        return get_overview_graph(
            elastic_json,
            dimensions["links"],
            dimensions["anchor"]["dimension"],
            dimensions["anchor"]["props"],
            index,
        )

    return get_detail_graph(
        elastic_json, dimensions["all"], dimensions["visible"], schema, index
    )


def generate_graph_metadata(
    graph_type,
    dimensions,
    table_data,
    schema,
    query,
    visible_entries,
    anchor_properties,
    anchor_property_values,
    graph_data,
):

    if graph_type == "overview":
        return {
            "new_dimensions": dimensions["query_generated"],
            "query": query,
            "table_data": table_data,
            "schema": schema,
            "dimensions": dimensions["links"] + [dimensions["anchor"]["dimension"]],
            "anchor_properties": anchor_properties,
            "anchor_property_values": anchor_property_values,
            "max_degree": csx_analysis.get_max_degree(
                csx_analysis.graph_from_graph_data(graph_data)
            ),
        }

    return {
        "new_dimensions": dimensions["query_generated"],
        "query": query,
        "table_data": table_data,
        "schema": schema,
        "dimensions": dimensions["visible"],
        "visible_entries": json.loads(visible_entries),
        "max_degree": csx_analysis.get_max_degree(
            csx_analysis.graph_from_graph_data(graph_data)
        ),
    }


@use_timing
def get_detail_graph(
    search_results,
    features: List[str],
    visible_features: List[str],
    schema: List[SchemaElement],
    index,
):
    """Convert results retrieved from elastic into a graph representation."""

    search_results_df = pd.DataFrame(search_results)

    list_features = []
    non_list_features = []

    with open(f"./app/data/config/{index}.json") as config:
        config = json.load(config)

        list_features = [
            feature
            for feature in features
            if config["dimension_types"][feature] == "list"
        ]
        non_list_features = [
            feature
            for feature in features
            if config["dimension_types"][feature] != "list"
        ]

    if len(non_list_features) > 0:
        nodes, entries_with_nodes = get_nodes(search_results_df, non_list_features)
    else:
        nodes = []
        entries_with_nodes = {}

    if len(list_features) > 0:
        nodes, entries_with_nodes = csx_data.retrieve_nodes_from_mongo(
            index,
            nodes,
            entries_with_nodes,
            search_results_df.entry.tolist(),
            list_features,
        )

    node_ids_with_labels = get_node_ids_with_labels(nodes)

    edge_tuples = get_edge_tuples(
        search_results_df,
        features,
        visible_features,
        schema,
        entries_with_nodes,
        node_ids_with_labels,
    )

    nx_edges = get_nx_edges(edge_tuples)
    edges = get_edges(edge_tuples)

    nodes = get_visible_nodes(nodes, visible_features)
    nodes = get_positions(nodes, nx_edges)

    components = get_components(nodes, nx_edges)
    nodes = enrich_nodes_with_components(nodes, components)
    edges = enrich_edges_with_components(edges, components)

    return {
        "nodes": nodes,
        "edges": edges,
        "components": components,
    }


@use_timing
def get_props_for_cached_nodes(comparison_results, anchor_properties, graph_type):
    current_properties_set = set(
        comparison_results["data"][graph_type]["nodes"][0]["properties"].keys()
    )
    new_properties_set = set(anchor_properties)

    properties_to_remove = list(current_properties_set - new_properties_set)
    properties_to_add = list(new_properties_set - current_properties_set)

    for node in comparison_results["data"][graph_type]["nodes"]:
        node["properties"] = {
            prop: node["properties"][prop]
            for prop in node["properties"]
            if prop not in properties_to_remove
        }
    # add properties
    for node in comparison_results["data"][graph_type]["nodes"]:
        for prop in properties_to_add:
            node["properties"][prop] = next(
                entry
                for entry in comparison_results["data"]["global"]["table_data"]
                if entry["entry"] == node["entries"][0]
            )[prop]

    return comparison_results["data"][graph_type]


@use_timing
def get_overview_graph(
    search_results, links: List[str], anchor: str, anchor_properties: List[str], index
):
    search_results_df = pd.DataFrame(search_results)

    is_anchor_list = False
    list_links = []
    non_list_links = []

    with open(f"./app/data/config/{index}.json") as config:
        config = json.load(config)
        is_anchor_list = config["dimension_types"][anchor] == "list"
        list_links = [
            link for link in links if config["dimension_types"][link] == "list"
        ]
        non_list_links = [
            link for link in links if config["dimension_types"][link] != "list"
        ]

    if len(non_list_links) > 0 or not is_anchor_list:
        nodes, entries_with_nodes = get_nodes(
            search_results_df, non_list_links, anchor, anchor_properties, is_anchor_list
        )
    else:
        nodes = []
        entries_with_nodes = {}

    if len(list_links) > 0 or is_anchor_list:
        nodes, entries_with_nodes = csx_data.retrieve_nodes_from_mongo(
            index,
            nodes,
            entries_with_nodes,
            search_results_df.entry.tolist(),
            list_links + [anchor] if is_anchor_list else list_links,
        )

    node_ids_with_labels = get_node_ids_with_labels(nodes)

    edge_tuple_lookup = get_overview_edge_tuples(
        search_results_df,
        anchor,
        links,
        nodes,
        entries_with_nodes,
        node_ids_with_labels,
    )

    nodes = [node for node in nodes if node["feature"] == anchor]

    nx_edges = list(edge_tuple_lookup.keys())

    edges = get_overview_edges(edge_tuple_lookup, nx_edges)

    nodes = get_positions(nodes, nx_edges)

    components = get_components(nodes, nx_edges)
    nodes = enrich_nodes_with_components(nodes, components)
    edges = enrich_edges_with_components(edges, components)
    components = enrich_components_with_top_connections(components, edges)

    return {
        "nodes": nodes,
        "edges": edges,
        "components": components,
    }
