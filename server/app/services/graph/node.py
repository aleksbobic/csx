import math
import uuid
from typing import Dict, List, cast

import networkx as nx
import numpy as np
import pandas as pd
from app.types import Node
from app.utils.timer import use_timing
from collections import Counter
import itertools


@use_timing
def get_labels(df: pd.DataFrame, feature: str, isFeatureList: bool) -> Counter:
    """Extract unique values and their counts of a given feature."""

    if isFeatureList:
        return Counter(itertools.chain.from_iterable(df[feature]))

    return Counter(df[feature].tolist())


def get_label_entries(df: pd.DataFrame, feature: str, label: str) -> List[str]:
    """Extract entry ids for a given feature, label tuple."""
    return df[df[feature] == label]["entry"].tolist()


def get_list_label_entries(df: pd.DataFrame, feature: str, label: str) -> List[str]:
    """Extract entry ids for a given list valued feature, label tuple."""
    return df[df[feature].apply(lambda x: label in x)]["entry"].tolist()


@use_timing
def get_feature_nodes(
    df: pd.DataFrame, feature: str, size_factor: int = 2
) -> List[Node]:
    """Generate list of node objects for all values of a given feature."""

    featureIsList = isinstance(df[feature].iloc[0], list)

    node_labels = get_labels(df, feature, featureIsList)

    if featureIsList:
        return [
            cast(
                Node,
                {
                    "entries": get_list_label_entries(df, feature, node_label),
                    "id": uuid.uuid4().hex,
                    "label": node_label,
                    "feature": feature,
                    "community": 0,
                    "component": 0,
                    "size": math.ceil(np.log2(node_labels[node_label]) + size_factor),
                },
            )
            for node_label in node_labels
        ]

    return [
        cast(
            Node,
            {
                "entries": get_label_entries(df, feature, node_label),
                "id": uuid.uuid4().hex,
                "label": node_label,
                "feature": feature,
                "community": 0,
                "component": 0,
                "size": math.ceil(np.log2(node_labels[node_label]) + size_factor),
            },
        )
        for node_label in node_labels
    ]


@use_timing
def get_nodes(df: pd.DataFrame) -> List[Node]:
    """Get node objects for each feature in dataframe."""

    nodes = []

    for feature in df.columns:

        nodes.extend(get_feature_nodes(df, feature))

    return nodes


@use_timing
def get_selected_nodes(df: pd.DataFrame, features: List[str]) -> List[Node]:
    """Get node objects for each feature in dataframe."""

    nodes = []

    for feature in features:

        nodes.extend(get_feature_nodes(df, feature, 5))

    return nodes


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
    """Extract visible nodes from list of all nodes"""

    return [
        node
        for node in nodes
        if node["feature"] in visible_features and node["label"] != ""
    ]
