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
    entries_with_nodes,
    node_ids_with_labels,
) -> List[Tuple[str, str]]:
    """Get node tuples that represent the graphs edges."""

    # anchor_features = []

    # If anchor is not visible new edges have to be created between all features connected through the anchor feature
    # if anchor not in visible_features:
    #     anchor_features = get_anchor_features(schema, anchor)

    # Features connected through anchor will have an m to n conenction
    # TODO Change this to latest version
    shortest_paths = get_shortest_schema_paths(features, visible_features, schema)

    print("\n\n\n shortest paths", shortest_paths)

    edge_tuples = []

    # If shortest paths between various graph features have been identified use them to get actual graph edges

    if shortest_paths:
        print("shortest paths exist")
        for path in shortest_paths:
            edge_tuples.extend(
                get_edges_based_on_path(
                    df, path, entries_with_nodes, node_ids_with_labels
                )
            )

        return edge_tuples

    # for feature in visible_features:
    #     print("shortest paths don't exist")
    #     if feature in anchor_features:
    #         # generate edges for the selected dimension based on the newly connected edges
    #         edge_tuples = get_single_column_edges(df, feature, entries_with_nodes)
    #         break

    return edge_tuples


@use_timing
def get_overview_edge_tuples(
    df: pd.DataFrame,
    anchor: str,
    links: List[str],
    nodes: List[Node],
    entries_with_nodes,
    node_ids_with_labels,
):
    overview_schema_paths = get_overview_graph_schema(anchor, links)

    candidate_edges = []

    for path in overview_schema_paths:
        candidate_edges.extend(
            get_edges_based_on_path(df, path, entries_with_nodes, node_ids_with_labels)
        )

    graph = nx.MultiGraph()
    graph.add_nodes_from([node["id"] for node in nodes])
    graph.add_edges_from(candidate_edges)

    edge_tuples = []
    edge_tuple_lookup = {}

    link_nodes = [node["id"] for node in nodes if node["feature"] in links]

    for node in graph.nodes:
        if node in link_nodes:

            temp_new_edge_tuples = combinations(list(graph.neighbors(node)), 2)

            node_instance = [
                node_instance for node_instance in nodes if node_instance["id"] == node
            ][0]

            # edge_tuples.extend(
            #     [
            #         {
            #             "label": node_instance["label"],
            #             "feature": node_instance["feature"],
            #             "edge": edge,
            #         }
            #         for edge in temp_new_edge_tuples
            #     ]
            # )

            for edge in temp_new_edge_tuples:
                if edge in edge_tuple_lookup:
                    edge_tuple_lookup[edge].append(
                        {
                            "label": node_instance["label"],
                            "feature": node_instance["feature"],
                        }
                    )
                else:
                    edge_tuple_lookup[edge] = [
                        {
                            "label": node_instance["label"],
                            "feature": node_instance["feature"],
                        }
                    ]

    return edge_tuple_lookup
    # return edge_tuples, edge_tuple_lookup


@use_timing
def get_overview_edges(edge_tuple_lookup, nx_edges) -> List[Edge]:
    """Generate a position for each node in graph."""

    edge_tuples_counts = Counter(nx_edges)

    return [
        cast(
            Edge,
            {
                "id": uuid.uuid4().hex,
                "source": edge[0],
                "target": edge[1],
                "visible": True,
                "weight": len(edge_tuple_lookup[edge]),
                "connections": edge_tuple_lookup[edge],
            },
        )
        for edge in edge_tuples_counts
    ]


@use_timing
def get_overview_nx_edges(
    enriched_edge_tuples: List[EnrichedEdgeTuple],
) -> List[Tuple[str, str]]:
    """Get edges which can be used directly in a networkx graph."""

    edge_tuples = [edge_tuple["edge"] for edge_tuple in enriched_edge_tuples]

    return list(set(edge_tuples))


@use_timing
def get_edges(edge_tuples: List[Tuple[str, str]]) -> List[Edge]:
    """Get list of edge objects that can be used by the frontend."""

    edge_tuples_counts = Counter(edge_tuples)

    return [
        cast(
            Edge,
            {
                "id": uuid.uuid4().hex,
                "source": edge[0],
                "target": edge[1],
                "visible": True,
                "weight": edge_tuples_counts[edge],
            },
        )
        for edge in edge_tuples_counts
    ]


@use_timing
def get_nx_edges(edge_tuples: List[Tuple[str, str]]) -> List[Tuple[str, str]]:
    """Get edges which can be used directly in a networkx graph."""

    # edge_tuples_counts = list(set(edge_tuples))
    return list(set(edge_tuples))
    # return [(node_lookup[edge[0]], node_lookup[edge[1]]) for edge in edge_tuples_counts]


def get_anchor_features(schema: List[SchemaElement], anchor: str) -> List[str]:
    """Get features directly connected to anchor feature."""

    return [
        edge["dest"] if edge["src"] == anchor else edge["src"]
        for edge in schema
        if edge["dest"] == anchor or edge["src"] == anchor
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
        temp_shortest_path_length = 0
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
                if not temp_shortest_path or temp_shortest_path_length > len(path):
                    temp_shortest_path_length = len(path)
                    temp_shortest_path = []
                    temp_shortest_path.append(path)
                elif temp_shortest_path_length == len(path):
                    temp_shortest_path.append(path)

        if len(temp_shortest_path) > 0:
            for entry in temp_shortest_path:
                shortest_schema_paths.append(entry)
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
    features: List[str], visible_features: List[str], schema: List[SchemaElement]
) -> List[List[SchemaElement]]:
    """Get shortest paths from schema nodes to the anchor schema node and from the anchor schema node to scehma nodes."""

    # new stuff
    new_graph = nx.DiGraph()
    new_graph.add_nodes_from(features)
    for edge_data in schema:
        if edge_data["dest"] != "":
            new_graph.add_edge(
                edge_data["src"],
                edge_data["dest"],
                relationship=edge_data["relationship"],
            )

    new_shortest_paths = []
    new_leaf_nodes_src = set()
    new_leaf_nodes_trg = set()

    for pair in permutations(visible_features, 2):
        if pair[0] == pair[1]:
            continue
        try:

            new_shortest_path = nx.shortest_path(
                new_graph, source=pair[0], target=pair[1]
            )
            new_shortest_path_details = []

            for i, node in enumerate(new_shortest_path):
                if i == len(new_shortest_path) - 1:
                    break

                temp_edge_data = cast(
                    Dict[str, str],
                    new_graph.get_edge_data(node, new_shortest_path[i + 1]),
                )

                new_shortest_path_details.append(
                    {
                        "src": node,
                        "dest": new_shortest_path[i + 1],
                        "relationship": temp_edge_data["relationship"],
                    }
                )

                new_leaf_nodes_src.add(new_shortest_path[0])
                new_leaf_nodes_trg.add(new_shortest_path[1])
            new_shortest_paths.append(new_shortest_path_details)
        except:
            continue

    new_shortest_schema_paths = []

    for node in new_leaf_nodes_src:
        new_temp_shortest_path_from_src = []
        shortest_length = 0

        for path in new_shortest_paths:
            if path[0]["src"] == node:
                if not new_temp_shortest_path_from_src or shortest_length >= len(path):
                    if shortest_length == len(path):
                        new_temp_shortest_path_from_src.append(path)
                    else:
                        new_temp_shortest_path_from_src = [path]
                        shortest_length = len(path)

        for entry in new_temp_shortest_path_from_src:
            new_shortest_schema_paths.append(entry)

    for node in new_leaf_nodes_trg:
        new_temp_shortest_path_from_src = []
        shortest_length = 0

        for path in new_shortest_paths:
            if path[-1]["dest"] == node:
                if not new_temp_shortest_path_from_src or shortest_length >= len(path):
                    if shortest_length == len(path):
                        new_temp_shortest_path_from_src.append(path)
                    else:
                        new_temp_shortest_path_from_src = [path]
                        shortest_length = len(path)

        for entry in new_temp_shortest_path_from_src:
            if not shortest_path_exists(
                new_shortest_schema_paths,
                entry[0]["src"],
                entry[-1]["dest"],
            ):
                new_shortest_schema_paths.append(entry)

    return new_shortest_schema_paths


def get_single_column_edges(
    df: pd.DataFrame, feature: str, entries_with_nodes
) -> List[Tuple[str, str]]:
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
        lambda row: {
            "entry": row["entry"],
            "edges": list(combinations(row[feature], 2)),
        },
        axis=1,
    ).tolist()

    for group in edge_groups:

        entry_nodes = entries_with_nodes[group.entry]

        for edge in group["edges"]:
            if str(edge[0]) == "" or str(edge[1]) == "":
                continue
            # TODO: Check if this makes any sense
            src_val = next(
                filter(
                    lambda node: node["feature"] == feature and node["id"] == edge[0],
                    entry_nodes,
                )
            )

            dest_val = next(
                filter(
                    lambda node: node["feature"] == feature and node["id"] == edge[1],
                    entry_nodes,
                )
            )

            edges.append((src_val, dest_val))

    return edges


# TODO: ignores relationships in the column itself those should be generated separately!
def get_edges_based_on_path(
    df: pd.DataFrame,
    path: List[SchemaElement],
    entries_with_nodes,
    node_ids_with_labels,
) -> List[Tuple[str, str]]:
    """Extract all relevant edges from row based on given path."""

    edges = []

    edge_groups = cast(
        List[List[Tuple[str, str]]],
        df.apply(
            lambda row: get_row_edge_based_on_path(
                row,
                path,
                entries_with_nodes,
                node_ids_with_labels,
            ),
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
    row: pd.Series,
    path: List[SchemaElement],
    entries_with_nodes,
    node_ids_with_labels,
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

        entry_nodes = entries_with_nodes[row.entry]

        src_val_temp = {
            node["label"]: node["id"]
            for node in list(
                filter(lambda node: node["feature"] == src_type, entry_nodes)
            )
        }

        if isinstance(row[src_type], list):
            src_val = [src_val_temp[label] for label in row[src_type]]
        else:
            src_val = [src_val_temp[row[src_type]]]

        if len(src_val) == 1:
            src_val = src_val[0]

        dest_val_temp = {
            node["label"]: node["id"]
            for node in list(
                filter(lambda node: node["feature"] == dest_type, entry_nodes)
            )
        }

        if isinstance(row[dest_type], list):
            dest_val = [dest_val_temp[label] for label in row[dest_type]]
        else:
            dest_val = [dest_val_temp[row[dest_type]]]

        if len(dest_val) == 1:
            dest_val = dest_val[0]

        relationship = link["relationship"]

        if i == 0:
            # There are no existing edges so there is no need to chain our edges to existing edges
            for edge in generate_edges(src_val, dest_val, relationship):
                if edge_has_empty_node(edge, node_ids_with_labels):
                    continue

                src = edge[0]

                dest = edge[1]

                if not edge_is_in_list(generated_edges, src, dest):
                    generated_edges.append((src, dest))

        else:
            # There are existing edges therfore we have to chain our edges to existing edges
            for chained_edge in generate_edges(src_val, dest_val, relationship):
                if edge_has_empty_node(chained_edge, node_ids_with_labels):
                    continue
                for edge in generated_edges:

                    # src = str(chained_edge[0]) + str(src_type)
                    # dest = str(chained_edge[1]) + str(dest_type)
                    src = chained_edge[0]
                    dest = chained_edge[1]

                    if edge[1] == src and not edge_is_in_list(
                        chained_edges, edge[0], dest
                    ):
                        chained_edges.append((edge[0], dest))

            generated_edges = chained_edges
            chained_edges = []

    # if path[0]["src"] in newly_conencted_nodes:

    #     for new_edge in list(combinations(row[path[0]["src"]], 2)):
    #         if isinstance(new_edge, list):
    #             src = str(new_edge[0]) + str(path[0]["src"])
    #             dest = str(new_edge[1]) + str(path[0]["src"])
    #             generated_edges.append((src, dest))

    #     for new_edge in list(combinations(row[path[-1]["dest"]], 2)):
    #         if isinstance(new_edge, list):
    #             src = str(new_edge[0]) + str(path[-1]["dest"])
    #             dest = str(new_edge[1]) + str(path[-1]["dest"])
    #             generated_edges.append((src, dest))

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

        return [[entry, dest] for entry in src]

    if relationship == "manyToMany":
        if not isinstance(src, list):
            src = [src]
        if not isinstance(dest, list):
            dest = [dest]

        return list(product(src, dest))

    return []


def edge_has_empty_node(
    edge: Union[List[str], Tuple[str, str]], node_ids_with_labels
) -> bool:
    """Check if edge contains an empty node."""
    return not str(node_ids_with_labels[edge[0]]) or not str(
        node_ids_with_labels[edge[1]]
    )


def edge_is_in_list(edges: List[Tuple[str, str]], dest: str, src: str) -> bool:
    """Check if edge with a specified destination and source is in given edge list."""
    for edge in edges:
        if edge[0] == dest and edge[1] == src:
            return True
    return False
