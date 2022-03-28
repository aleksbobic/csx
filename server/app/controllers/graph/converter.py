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
    get_overview_graph_enriched_edge_tuples,
    get_overview_graph_edges,
    get_overview_graph_nx_edges,
)
from app.services.graph.node import (
    get_node_lookup_dict,
    get_nodes,
    get_positions,
    get_visible_nodes,
    get_selected_nodes,
)
from app.utils.timer import use_timing
from app.types import SchemaElement, Node


@use_timing
def get_graph(
    search_results,
    features: List[str],
    visible_features: List[str],
    schema: List[SchemaElement],
    anchor: str,
):
    """Convert results retrieved from elastic into a graph representation."""

    search_results_df = pd.DataFrame(search_results)

    nodes = get_nodes(search_results_df)
    node_lookup = get_node_lookup_dict(nodes)

    edge_tuples = get_edge_tuples(
        search_results_df, features, visible_features, schema, anchor
    )

    edges = get_edges(edge_tuples, node_lookup)
    nx_edges = get_nx_edges(edge_tuples, node_lookup)

    nodes = get_positions(nodes, nx_edges)

    components = get_components(nodes, nx_edges)

    nodes = get_visible_nodes(nodes, visible_features)
    nodes = enrich_nodes_with_components(nodes, components)
    edges = enrich_edges_with_components(edges, components)

    return {
        "nodes": nodes,
        "edges": edges,
        "components": components,
    }


@use_timing
def get_overview_graph(
    search_results,
    links: List[str],
    anchor: str,
):
    search_results_df = pd.DataFrame(search_results)

    nodes = get_selected_nodes(search_results_df, links + [anchor])
    node_lookup = get_node_lookup_dict(nodes)

    link_nodes = [
        node["label"] + node["feature"] for node in nodes if node["feature"] in links
    ]

    enriched_edge_tuples = get_overview_graph_enriched_edge_tuples(
        search_results_df, anchor, links, nodes, link_nodes
    )

    nodes = [node for node in nodes if node["feature"] == anchor]

    nx_edges = get_overview_graph_nx_edges(enriched_edge_tuples, node_lookup)
    edges = get_overview_graph_edges(enriched_edge_tuples, node_lookup)

    nodes = get_positions(nodes, nx_edges)
    components = get_components(nodes, nx_edges)
    nodes = enrich_nodes_with_components(nodes, components)
    edges = enrich_edges_with_components(edges, components)
    components = enrich_components_with_top_connections(components, edges)
    print("edges", edges)

    return {
        "nodes": nodes,
        "edges": edges,
        "components": components,
    }
