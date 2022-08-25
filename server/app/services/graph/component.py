import networkx as nx
from app.utils.timer import use_timing
from typing import List, Tuple, cast
from app.types import Node, Component, Edge, ConnectionCount
from collections import Counter


@use_timing
def get_components(
    nodes: List[Node], edges: List[Tuple[str, str]], graph=None
) -> List[Component]:
    """Extract components from given nodes and edges."""

    if not graph:
        graph = nx.MultiGraph()
        graph.add_nodes_from([range(0, len(nodes))])
        graph.add_edges_from(edges)

    # Extract the actual component nodes and edges
    components = []
    components_with_large_nodes = []

    for i, component in enumerate(nx.connected_components(graph)):
        new_component = {"id": i, "node_count": 0, "largest_nodes": [], "nodes": []}

        component_nodes = []
        largest_size = 0
        component_entries = []
        node_sizes = []
        unique_node_sizes = set()

        for node in nodes:
            if node["id"] in component:
                node["component"] = i
                new_component["node_count"] += 1

                component_entries += node["entries"]
                node_sizes.append(node["size"])

                unique_node_sizes.add(node["size"])

                if largest_size < node["size"]:
                    largest_size = node["size"]

                component_nodes.append(node)

        if len(unique_node_sizes) > 1:
            new_component["largest_nodes"] = list(
                filter(lambda node: node["size"] == largest_size, component_nodes)
            )

        new_component["entries"] = list(set(component_entries))
        new_component["nodes"] = component
        new_component["selectedNodesCount"] = 0
        new_component["isSelected"] = False

        if new_component["node_count"] > 0:
            if new_component["largest_nodes"]:
                components_with_large_nodes.append(new_component)
            else:
                components.append(new_component)

    components.sort(key=lambda component: component["node_count"], reverse=True)
    components_with_large_nodes.sort(
        key=lambda component: component["node_count"], reverse=True
    )

    return components_with_large_nodes + components


@use_timing
def enrich_nodes_with_components(
    nodes: List[Node], components: List[Component]
) -> List[Node]:
    for node in nodes:
        for component in components:
            if node["id"] in component["nodes"]:
                node["component"] = component["id"]
    return nodes


@use_timing
def enrich_nodes_with_neighbors(
    nodes: List[Node], edges: List[Tuple[str, str]], graph=None
) -> List[Node]:
    if not graph:
        graph = nx.MultiGraph()
        graph.add_nodes_from([node["id"] for node in nodes])
        graph.add_edges_from(edges)

    for node in nodes:
        node["neighbours"] = set(graph.neighbors(node["id"]))

    return nodes


@use_timing
def enrich_edges_with_components(
    edges: List[Edge], components: List[Component]
) -> List[Edge]:
    for edge in edges:
        for component in components:
            if (
                edge["source"] in component["nodes"]
                and edge["target"] in component["nodes"]
            ):
                edge["component"] = component["id"]
    return edges


@use_timing
def enrich_components_with_top_connections(
    components: List[Component], edges: List[Edge]
) -> List[Component]:
    for component in components:
        component_connections = [
            edge["connections"]
            for edge in edges
            if edge["component"] == component["id"]
        ]

        connections = []

        for subconnections in component_connections:
            if subconnections:
                connections.extend([(c["feature"], c["label"]) for c in subconnections])

        connection_counts = Counter(connections).most_common(5)

        component["largest_connections"] = [
            cast(
                ConnectionCount,
                {
                    "feature": entry[0][0],
                    "label": entry[0][1],
                    "count": entry[1],
                },
            )
            for entry in connection_counts
        ]

    return components
