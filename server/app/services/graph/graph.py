import json
from typing import List, Literal, Dict

import app.services.data.mongo as csx_data
import app.services.graph.components as csx_components
import app.services.graph.edges as csx_edges
import app.services.graph.nodes as csx_nodes
import networkx as nx
import pandas as pd
from app.types import SchemaElement
from app.utils.timer import use_timing


def get_graph(
    graph_type: Literal["overview", "detail"],
    elastic_json: Dict,
    dimensions: Dict,
    schema: List[SchemaElement],
    index: str,
) -> Dict:
    """Generate graph"""
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
    graph_type: Literal["overview", "detail"],
    dimensions: Dict,
    table_data,
    schema,
    query,
    visible_entries,
    anchor_properties,
    anchor_property_values,
    graph_data,
) -> Dict:

    if graph_type == "overview":
        return {
            "new_dimensions": dimensions["query_generated"],
            "query": query,
            "table_data": table_data,
            "schema": schema,
            "dimensions": dimensions["links"] + [dimensions["anchor"]["dimension"]],
            "anchor_properties": anchor_properties,
            "anchor_property_values": anchor_property_values,
            "max_degree": get_max_degree(from_graph_data(graph_data)),
        }

    return {
        "new_dimensions": dimensions["query_generated"],
        "query": query,
        "table_data": table_data,
        "schema": schema,
        "dimensions": dimensions["visible"],
        "visible_entries": visible_entries,
        "max_degree": get_max_degree(from_graph_data(graph_data)),
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
        nodes, entries_with_nodes = csx_nodes.get_nodes(
            search_results_df, non_list_features
        )
    else:
        nodes = []
        entries_with_nodes = {}

    if len(list_features) > 0:
        mongo_nodes = csx_data.retrieve_raw_nodes_from_mongo(
            index, search_results_df.entry.tolist(), list_features
        )
        entries_with_nodes = csx_nodes.enrich_entries_with_nodes(
            entries_with_nodes, mongo_nodes
        )
        nodes = nodes + mongo_nodes

    node_ids_with_labels = csx_nodes.get_node_ids_with_labels(nodes)

    edge_tuples = csx_edges.get_edge_tuples(
        search_results_df,
        features,
        visible_features,
        schema,
        entries_with_nodes,
        node_ids_with_labels,
    )

    nx_edges = csx_edges.get_nx_edges(edge_tuples)
    edges = csx_edges.get_edges(edge_tuples)

    nodes = csx_nodes.get_visible_nodes(nodes, visible_features)
    nodes = csx_nodes.get_positions(nodes, nx_edges)

    components = csx_components.get_components(nodes, nx_edges)

    nodes = csx_nodes.enrich_with_components(nodes, components)
    nodes = csx_nodes.enrich_with_neighbors(nodes, nx_edges)
    edges = csx_edges.enrich_with_components(edges, components)

    components = sorted(components, key=lambda component: -component["node_count"])

    return {
        "nodes": nodes,
        "edges": edges,
        "components": components,
    }


@use_timing
def get_props_for_cached_nodes(
    comparison_results, anchor_properties, graph_type: Literal["overview", "detail"]
):
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
        nodes, entries_with_nodes = csx_nodes.get_nodes(
            search_results_df, non_list_links, anchor, anchor_properties, is_anchor_list
        )
    else:
        nodes = []
        entries_with_nodes = {}

    if len(list_links) > 0 or is_anchor_list:
        mongo_nodes = csx_data.retrieve_raw_nodes_from_mongo(
            index,
            search_results_df.entry.tolist(),
            list_links + [anchor] if is_anchor_list else list_links,
        )
        entries_with_nodes = csx_nodes.enrich_entries_with_nodes(
            entries_with_nodes, mongo_nodes
        )
        nodes = nodes + mongo_nodes

    node_ids_with_labels = csx_nodes.get_node_ids_with_labels(nodes)

    edge_tuple_lookup = csx_edges.get_overview_edge_tuples(
        search_results_df,
        anchor,
        links,
        nodes,
        entries_with_nodes,
        node_ids_with_labels,
    )

    nodes = [node for node in nodes if node["feature"] == anchor]

    nx_edges = list(edge_tuple_lookup.keys())

    edges = csx_edges.get_overview_edges(edge_tuple_lookup, nx_edges)

    nodes = csx_nodes.get_positions(nodes, nx_edges)

    components = csx_components.get_components(nodes, nx_edges)

    nodes = csx_nodes.enrich_with_components(nodes, components)
    nodes = csx_nodes.enrich_with_neighbors(nodes, nx_edges)
    edges = csx_edges.enrich_with_components(edges, components)
    components = csx_components.enrich_with_top_connections(components, edges)
    components = sorted(components, key=lambda component: -component["node_count"])

    return {
        "nodes": nodes,
        "edges": edges,
        "components": components,
    }


def from_graph_data(graph_data) -> nx.Graph:
    graph = nx.Graph()
    graph.add_nodes_from([node["id"] for node in graph_data["nodes"]])
    graph.add_edges_from(
        [(edge["source"], edge["target"]) for edge in graph_data["edges"]]
    )
    return graph


def from_cache(graph_data) -> nx.Graph:
    graph = nx.from_dict_of_dicts(graph_data["meta"]["nx_graph"])
    return graph


def get_max_degree(graph: nx.Graph):
    return max([d for n, d in graph.degree()])
