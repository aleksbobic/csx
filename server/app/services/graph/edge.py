from networkx.algorithms.shortest_paths.generic import shortest_path
from itertools import combinations, product, permutations
import networkx as nx
from app.utils.timer import use_timing
import uuid
import pandas as pd
from typing import Dict, List, Set, Tuple, cast, Union
from collections import Counter

from app.types import SchemaElement, Edge, Node, EnrichedEdgeTuple


@use_timing
def get_edge_tuples(
    df: pd.DataFrame,
    features: List[str],
    visible_features: List[str],
    schema: List[SchemaElement],
    anchor: str,
) -> List[Tuple[str, str]]:
    """Get node tuples that represent the graphs edges."""

    anchor_features = []

    # If anchor is not visible new edges have to be created between all features connected through the anchor feature
    if anchor not in visible_features:
        anchor_edges = get_anchor_edges(schema, anchor)
        anchor_features = get_anchor_features(anchor_edges, anchor)

    # Features connected through anchor will have an m to n conenction
    shortest_paths = get_shortest_schema_paths(
        features, visible_features, schema, anchor_features, anchor
    )

    edge_tuples = []

    # If shortest paths between various graph features have been identified use them to get actual graph edges
    if shortest_paths:
        for path in shortest_paths:
            edge_tuples.extend(get_edges_based_on_path(df, path, anchor_features))

        return edge_tuples

    for feature in visible_features:
        if feature in anchor_features:
            # generate edges for the selected dimension based on the newly connected edges
            edge_tuples = get_single_column_edges(df, feature)
            break

    return edge_tuples


@use_timing
def get_overview_graph_enriched_edge_tuples(
    df: pd.DataFrame,
    anchor: str,
    links: List[str],
    nodes: List[Node],
    link_nodes: List[str],
) -> List[EnrichedEdgeTuple]:
    overview_schema_paths = get_overview_graph_schema(anchor, links)

    candidate_edges = []

    for path in overview_schema_paths:
        candidate_edges.extend(get_edges_based_on_path(df, path, []))

    graph = nx.MultiGraph()
    graph.add_nodes_from([node["label"] + node["feature"] for node in nodes])
    graph.add_edges_from(candidate_edges)

    edge_tuples = []

    for node in graph.nodes:
        if node in link_nodes:
            temp_new_edge_tuples = combinations(list(graph.neighbors(node)), 2)
            node_instance = [
                node_instance
                for node_instance in nodes
                if node_instance["label"] + node_instance["feature"] == node
            ][0]

            # TODO: Finish extending tuples with additional info
            edge_tuples.extend(
                [
                    {
                        "label": node_instance["label"],
                        "feature": node_instance["feature"],
                        "edge": edge,
                    }
                    for edge in temp_new_edge_tuples
                ]
            )

    return edge_tuples


@use_timing
def get_overview_graph_edges(
    enriched_edge_tuples: List[EnrichedEdgeTuple], node_lookup: Dict[str, str]
) -> List[Edge]:
    """Generate a position for each node in graph."""

    edge_tuples = [edge_tuple["edge"] for edge_tuple in enriched_edge_tuples]

    edge_tuples_counts = Counter(edge_tuples)

    if edge_tuples_counts.values():
        norm_divisor = max(edge_tuples_counts.values())
    else:
        norm_divisor = 1

    return [
        cast(
            Edge,
            {
                "id": uuid.uuid4().hex,
                "source": node_lookup[edge[0]],
                "target": node_lookup[edge[1]],
                "visible": True,
                "weight": round(edge_tuples_counts[edge] / norm_divisor, 2),
                "connections": [
                    {"label": entry["label"], "feature": entry["feature"]}
                    for entry in enriched_edge_tuples
                    if entry["edge"] == edge
                ],
            },
        )
        for edge in edge_tuples_counts
    ]


@use_timing
def get_overview_graph_nx_edges(
    enriched_edge_tuples: List[EnrichedEdgeTuple], node_lookup: Dict[str, str]
) -> List[Tuple[str, str]]:
    """Get edges which can be used directly in a networkx graph."""

    edge_tuples = [edge_tuple["edge"] for edge_tuple in enriched_edge_tuples]

    edge_tuples_counts = list(set(edge_tuples))

    return [(node_lookup[edge[0]], node_lookup[edge[1]]) for edge in edge_tuples_counts]


@use_timing
def get_edges(
    edge_tuples: List[Tuple[str, str]], node_lookup: Dict[str, str]
) -> List[Edge]:
    """Get list of edge objects that can be used by the frontend."""

    edge_tuples_counts = Counter(edge_tuples)

    return [
        cast(
            Edge,
            {
                "id": uuid.uuid4().hex,
                "source": node_lookup[edge[0]],
                "target": node_lookup[edge[1]],
                "visible": True,
                "weight": edge_tuples_counts[edge],
            },
        )
        for edge in edge_tuples_counts
    ]


@use_timing
def get_nx_edges(
    edge_tuples: List[Tuple[str, str]], node_lookup: Dict[str, str]
) -> List[Tuple[str, str]]:
    """Get edges which can be used directly in a networkx graph."""

    edge_tuples_counts = list(set(edge_tuples))

    return [(node_lookup[edge[0]], node_lookup[edge[1]]) for edge in edge_tuples_counts]


def get_anchor_edges(schema: List[SchemaElement], anchor: str) -> List[SchemaElement]:
    "Get schema edges connected to anchor node."
    return [edge for edge in schema if edge["dest"] == anchor or edge["src"] == anchor]


def get_anchor_features(anchor_edges: List[SchemaElement], anchor: str) -> List[str]:
    """Get features directly connected to anchor feature."""
    return [
        edge["dest"] if edge["src"] == anchor else edge["src"] for edge in anchor_edges
    ]


def connect_disconnected_features(
    anchor: str, schema: List[SchemaElement], anchor_features: List[str]
) -> List[SchemaElement]:
    """Generate new connections in schema for features which would otherwise be connected directly to anchor feature."""

    # Schema without edges directly connected to anchor feature
    schema = [
        edge for edge in schema if edge["dest"] != anchor and edge["src"] != anchor
    ]

    # Generate combinations of elements on the other side of those edges and connect all of those nodes with a many to many relationship.
    for entry in combinations(anchor_features, 2):
        schema.append({"src": entry[0], "dest": entry[1], "relationship": "manyToMany"})

    return schema


def get_overview_graph_schema(
    anchor: str, links: List[str]
) -> List[List[SchemaElement]]:
    return [
        [{"src": anchor, "dest": link, "relationship": "manyToMany"}] for link in links
    ]


def get_shortest_schema_paths_from_src_leafs(
    src_leaf_nodes: Set,
    shortest_schema_path_candidates: List[List[SchemaElement]],
    anchor_visible: bool,
    anchor_features: List[str],
) -> List[List[SchemaElement]]:
    """Get shortest schema paths from leaf nodes to anchor node."""
    shortest_schema_paths = []

    # We always have directed edges leading from the leaf to the anchor or from the anchor to the leaf
    for node in src_leaf_nodes:
        temp_shortest_path = []

        for path in shortest_schema_path_candidates:
            if (
                not anchor_visible
                and path[0]["src"] in anchor_features
                and path[-1]["dest"] in anchor_features
            ):
                shortest_schema_paths.append(path)
                continue
            elif path[0]["src"] == node:
                if not temp_shortest_path or len(temp_shortest_path) > len(path):
                    temp_shortest_path = path

        if temp_shortest_path:
            shortest_schema_paths.append(temp_shortest_path)
    return shortest_schema_paths


def get_shortest_schema_paths_from_dest_leafs(
    dest_leaf_nodes: Set, shortest_schema_paths: List[List[SchemaElement]]
) -> List[List[SchemaElement]]:
    """Get shortest schema paths from anchor node to leaf nodes."""

    for node in dest_leaf_nodes:
        temp_shortest_path = []

        for path in shortest_schema_paths:
            if path[-1]["dest"] == node:
                if len(temp_shortest_path) == 0 or len(temp_shortest_path) > len(path):
                    temp_shortest_path = path

        if not shortest_path_exists(
            shortest_schema_paths,
            temp_shortest_path[0]["src"],
            temp_shortest_path[-1]["dest"],
        ):
            shortest_schema_paths.append(temp_shortest_path)

    return shortest_schema_paths


def get_shortest_schema_paths(
    features: List[str],
    visible_features: List[str],
    schema: List[SchemaElement],
    anchor_features: List[str],
    anchor: str,  # Represents main data row node
) -> List[List[SchemaElement]]:
    """Get shortest paths from schema nodes to the anchor schema node and from the anchor schema node to scehma nodes."""

    anchor_visible = anchor in visible_features

    if not anchor_visible:
        schema = connect_disconnected_features(anchor, schema, anchor_features)

    schema_graph = nx.DiGraph()
    schema_graph.add_nodes_from(features)
    # we assume we know what is the reference i.e. central node ... we will actually send this from the frontend

    for edge_data in schema:
        if edge_data["dest"] != "":
            schema_graph.add_edge(
                edge_data["src"],
                edge_data["dest"],
                relationship=edge_data["relationship"],
            )

    # Generate permutations of all visible feature pairs in order to find shortest paths between features
    visible_feature_permutations = permutations(visible_features, 2)

    shortest_schema_path_candidates = []
    src_leaf_nodes = set()  # Shortest schema path starting points
    dest_leaf_nodes = set()  # Shortest schema path ending points

    # Get shortest path candidates from one feature to another
    for permutation in visible_feature_permutations:
        try:
            # Get shortest path from one feature to another
            path = shortest_path(schema_graph, permutation[0], permutation[1])
            shortest_path_with_details = []
            for i, node in enumerate(path):
                if i == len(path) - 1:
                    break
                edge_data = cast(
                    Dict[str, str], schema_graph.get_edge_data(node, path[i + 1])
                )

                shortest_path_with_details.append(
                    {
                        "src": node,
                        "dest": path[i + 1],
                        "relationship": edge_data["relationship"],
                    }
                )

                src_leaf_nodes.add(permutation[0])
                dest_leaf_nodes.add(permutation[1])

            shortest_schema_path_candidates.append(shortest_path_with_details)
        except:
            pass

    shortest_schema_paths = get_shortest_schema_paths_from_src_leafs(
        src_leaf_nodes, shortest_schema_path_candidates, anchor_visible, anchor_features
    )

    for node in dest_leaf_nodes:
        temp_shortest_path = []

        for path in shortest_schema_paths:
            if path[-1]["dest"] == node:
                if not temp_shortest_path or len(temp_shortest_path) > len(path):
                    temp_shortest_path = path

        if not shortest_path_exists(
            shortest_schema_paths,
            temp_shortest_path[0]["src"],
            temp_shortest_path[-1]["dest"],
        ):
            shortest_schema_paths.append(temp_shortest_path)

    return shortest_schema_paths


def get_single_column_edges(df: pd.DataFrame, feature: str) -> List[Tuple[str, str]]:
    """Get edges for a single feature by generating edges between all of its values in each row."""

    # TODO: Check if row[feature] contains only lists and only in that case create combinations otherwise return an empty list

    feature_is_list = (
        (df[feature].sample(100).apply(type).astype(str) == "<class 'list'>").all()
        if df.shape[0] > 100
        else (df[feature].apply(type).astype(str) == "<class 'list'>").all()
    )

    if not feature_is_list:
        return []

    edges = []
    edge_groups = df.apply(
        lambda row: list(combinations(row[feature], 2)),
        axis=1,
    ).tolist()

    for group in edge_groups:
        for entry in group:
            if str(entry[0]) == "" or str(entry[1]) == "":
                continue
            # TODO: Check if this makes any sense
            edges.append((str(entry[0]) + str(feature), str(entry[1]) + str(feature)))

    return edges


# TODO: ignores relationships in the column itself those should be generated separately!
def get_edges_based_on_path(
    df: pd.DataFrame, path: List[SchemaElement], newly_conencted_nodes: List[str]
) -> List[Tuple[str, str]]:
    """Extract all relevant edges from row based on given path."""

    edges = []

    edge_groups = cast(
        List[List[Tuple[str, str]]],
        df.apply(
            lambda row: get_row_edge_based_on_path(row, path, newly_conencted_nodes),
            axis=1,
        ).tolist(),
    )

    for group in edge_groups:
        edges.extend(group)

    return edges


# TODO: also check if shortest path that exists is actually shorter than proposed path
def shortest_path_exists(
    shortest_paths: List[List[SchemaElement]], src: str, dest: str
) -> bool:
    """Check if there exists a shortest schema path with given source or destination."""
    for path in shortest_paths:
        if path[0]["src"] == src or path[-1]["dest"] == dest:
            return True
    return False


def get_row_edge_based_on_path(
    row: pd.Series, path: List[SchemaElement], newly_conencted_nodes: List[str]
) -> List[Tuple[str, str]]:
    """Extract edge for single row based on given path"""
    generated_edges = []
    chained_edges = []

    # TODO: add info about value type in edge dest and src (e.g. is it a title, abstract, etc.)

    # Paths can be either signle linked or multi linked
    # Single linked: Node Type 1 -> Node Type 2
    # Multi linked: NT1 -> NT3 -> NT4 -> NT5
    # In either case paths are generated by generating paths link by link

    for i, link in enumerate(path):
        src_type = link["src"]
        dest_type = link["dest"]

        src_val = row[src_type]
        dest_val = row[dest_type]

        relationship = link["relationship"]

        if i == 0:
            # There are no existing edges so there is no need to chain our edges to existing edges
            for edge in generate_edges(src_val, dest_val, relationship):
                if edge_has_empty_node(edge):
                    continue

                src = str(edge[0]) + str(
                    dest_type if relationship == "manyToOne" else src_type
                )
                dest = str(edge[1]) + str(
                    src_type if relationship == "manyToOne" else dest_type
                )

                if not edge_is_in_list(generated_edges, src, dest):
                    generated_edges.append((src, dest))

        else:
            # There are existing edges therfore we have to chain our edges to existing edges
            for chained_edge in generate_edges(src_val, dest_val, relationship):
                if edge_has_empty_node(chained_edge):
                    continue
                for edge in generated_edges:

                    src = str(chained_edge[0]) + str(src_type)
                    dest = str(chained_edge[1]) + str(dest_type)

                    if edge[1] == src and not edge_is_in_list(
                        chained_edges, edge[0], dest
                    ):
                        chained_edges.append((edge[0], dest))

            generated_edges = chained_edges
            chained_edges = []

    if path[0]["src"] in newly_conencted_nodes:

        for new_edge in list(combinations(row[path[0]["src"]], 2)):
            if isinstance(new_edge, list):
                src = str(new_edge[0]) + str(path[0]["src"])
                dest = str(new_edge[1]) + str(path[0]["src"])
                generated_edges.append((src, dest))

        for new_edge in list(combinations(row[path[-1]["dest"]], 2)):
            if isinstance(new_edge, list):
                src = str(new_edge[0]) + str(path[-1]["dest"])
                dest = str(new_edge[1]) + str(path[-1]["dest"])
                generated_edges.append((src, dest))

    return generated_edges


def generate_edges(
    src: Union[str, List[str]], dest: Union[str, List[str]], relationship: str
) -> Union[List[List[str]], List[Tuple[str, str]]]:
    """Generate edges based on given relationship, source and destination."""

    if relationship == "oneToOne":
        if not isinstance(src, list):
            src = [src]
        if not isinstance(dest, list):
            dest = [dest]

        return list(zip(src, dest))

    if relationship == "oneToMany":
        if not isinstance(dest, list):
            dest = [dest]

        return [[src, entry] for entry in dest]

    if relationship == "manyToOne":
        if not isinstance(src, list):
            src = [src]

        return [[dest, entry] for entry in src]

    if relationship == "manyToMany":
        if not isinstance(src, list):
            src = [src]
        if not isinstance(dest, list):
            dest = [dest]

        return list(product(src, dest))

    return []


def edge_has_empty_node(edge: Union[List[str], Tuple[str, str]]) -> bool:
    """Check if edge contains an empty node."""
    return not str(edge[0]) or not str(edge[1])


def edge_is_in_list(edges: List[Tuple[str, str]], dest: str, src: str) -> bool:
    """Check if edge with a specified destination and source is in given edge list."""
    for edge in edges:
        if edge[0] == dest and edge[1] == src:
            return True
    return False
