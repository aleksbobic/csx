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
from app.utils.timer import use_timing
from app.types import SchemaElement


@use_timing
def get_graph(
    search_results,
    features: List[str],
    visible_features: List[str],
    schema: List[SchemaElement]
):
    """Convert results retrieved from elastic into a graph representation."""

    search_results_df = pd.DataFrame(search_results)

    nodes, entries_with_nodes = get_nodes(search_results_df)

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
def get_overview_graph(
    search_results, links: List[str], anchor: str, anchor_properties: List[str]
):
    search_results_df = pd.DataFrame(search_results)

    nodes, entries_with_nodes = get_nodes(
        search_results_df, links, anchor, anchor_properties
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
