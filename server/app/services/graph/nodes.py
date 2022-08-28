import itertools
import math
import uuid
from collections import Counter
from typing import Dict, List, Tuple, cast

import networkx as nx
import numpy as np
import pandas as pd
from app.utils.timer import use_timing
from app.types import Component, Node


@use_timing
def get_labels(df: pd.DataFrame, feature: str, isFeatureList: bool) -> Counter:
    """Extract unique values and their counts of a given feature."""

    if isFeatureList:
        return Counter(itertools.chain.from_iterable(df[feature]))

    return Counter(df[feature].tolist())


def get_label_entries(
    df: pd.DataFrame, feature: str, label: str, isFeatureList: bool
) -> List[str]:
    """Extract entry ids for a given feature, label tuple."""

    if isFeatureList:
        return df[df[feature].apply(lambda x: label in x)]["entry"].tolist()

    return df[df[feature] == label]["entry"].tolist()


def get_anchor_property_values(search_results, anchor_properties: List[str]) -> List:
    search_results_df = pd.DataFrame(search_results)

    return [
        {"values": search_results_df[prop].unique().tolist(), "property": prop}
        for prop in anchor_properties
    ]


@use_timing
def enrich_with_components(
    nodes: List[Node], components: List[Component]
) -> List[Node]:
    for node in nodes:
        for component in components:
            if node["id"] in component["nodes"]:
                node["component"] = component["id"]
                break
    return nodes


@use_timing
def enrich_with_neighbors(
    nodes: List[Node], edges: List[Tuple[str, str]], graph=None
) -> List[Node]:
    if not graph:
        graph = nx.MultiGraph()
        graph.add_nodes_from([node["id"] for node in nodes])
        graph.add_edges_from(edges)

    for node in nodes:
        node["neighbours"] = set(graph.neighbors(node["id"]))

    return nodes


def enrich_node_with_props(
    node: Node, df: pd.DataFrame, anchor_properties: List[str]
) -> Node:
    properties = {
        feature: df[df[node["feature"]] == node["label"]][feature].values[0]
        for feature in anchor_properties
    }

    node["properties"] = properties
    return node


@use_timing
def enrich_nodes_with_props(
    df: pd.DataFrame, nodes: List[Node], anchor: str, anchor_properties: List[str]
) -> List[Node]:
    return [
        enrich_node_with_props(node, df, anchor_properties)
        if node["feature"] == anchor
        else node
        for node in nodes
    ]


@use_timing
def get_feature_nodes(df: pd.DataFrame, feature: str, size_factor: int = 2):
    # -> List[Node]:
    """Generate list of node objects for all values of a given feature."""

    isFeatureList = isinstance(df[feature].iloc[0], list)

    node_labels = get_labels(df, feature, isFeatureList)

    entry_list = {}

    def expand_entities(node_label, node_labels):
        node = {
            "entries": get_label_entries(df, feature, node_label, isFeatureList),
            "id": uuid.uuid4().hex,
            "label": node_label,
            "feature": feature,
            "community": 0,
            "component": 0,
            "size": math.ceil(np.log2(node_labels[node_label]) + size_factor),
        }

        for entry in node["entries"]:
            if entry in entry_list:
                entry_list[entry].append(node)
            else:
                entry_list[entry] = [node]

        return node

    nodes = [
        cast(
            Node,
            expand_entities(node_label, node_labels),
        )
        for node_label in node_labels
    ]

    return nodes, entry_list


@use_timing
def get_nodes(
    df: pd.DataFrame,
    links: List[str] = [],
    anchor: str = "",
    anchor_properties: List[str] = [],
    is_anchor_list=False,
):
    """Get node objects for each feature or each passed feature in dataframe."""

    features = links + [anchor] if anchor != "" and not is_anchor_list else links
    nodes = []
    entries = {}

    if len(features) == 0:
        for feature in df.columns:
            new_nodes, new_entries = get_feature_nodes(df, feature, 5)
            nodes.extend(new_nodes)
            for entry in new_entries:
                if entry in entries:
                    entries[entry] = entries[entry] + new_entries[entry]
                else:
                    entries[entry] = new_entries[entry]
    else:
        for feature in features:
            new_nodes, new_entries = get_feature_nodes(df, feature, 5)
            nodes.extend(new_nodes)
            for entry in new_entries:
                if entry in entries:
                    entries[entry] = entries[entry] + new_entries[entry]
                else:
                    entries[entry] = new_entries[entry]
        nodes = enrich_nodes_with_props(df, nodes, anchor, anchor_properties)

    return nodes, entries


@use_timing
def get_node_ids_with_labels(nodes):
    return {node["id"]: node["label"] for node in nodes}


# TODO: Check if this makes any sense, nodes are not uniquely identifiable like this
@use_timing
def get_node_lookup_dict(nodes: List[Node]) -> Dict[str, str]:
    """Get node lookup dict where key is label and feature while value is node id"""
    return {str(node["label"]) + str(node["feature"]): node["id"] for node in nodes}


@use_timing
def get_positions(nodes: List[Node], edges) -> List[Node]:
    """Generate a position for each node in graph."""

    graph = nx.MultiGraph()
    graph.add_nodes_from([range(0, len(nodes))])
    graph.add_edges_from(edges)

    positions = nx.circular_layout(graph, scale=500)

    for index, node in enumerate(nodes):
        if node["id"] in positions:
            nodes[index]["x"] = positions[node["id"]][0]
            nodes[index]["y"] = positions[node["id"]][1]
    return nodes


@use_timing
def get_visible_nodes(nodes: List[Node], visible_features: List[str]) -> List[Node]:
    """Extract visible nodes from list of all nodes based on the provided visible features"""

    return [
        node
        for node in nodes
        if node["feature"] in visible_features and node["label"] != ""
    ]
