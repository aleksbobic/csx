import itertools
import math
import uuid
from collections import Counter
from typing import Dict, List, Tuple, cast

import networkx as nx
import numpy as np
import pandas as pd
import polars as pl
from app.types import Component, Node
from app.utils.timer import use_timing


@use_timing
def get_labels(df: pd.DataFrame, feature: str) -> Counter:
    """Extract unique values and their counts of a given feature."""
    isFeatureList = isinstance(df[feature].iloc[0], list)

    if isFeatureList:
        return Counter(itertools.chain.from_iterable(df[feature]))

    return Counter(df[feature].tolist())


def get_label_entries(df: pd.DataFrame, feature: str, label: str) -> List[str]:
    """Extract entry ids for a given feature, label tuple."""
    isFeatureList = isFeatureList = isinstance(df[feature].iloc[0], list)

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

    for feature in properties:
        if not type(properties[feature]) == str and np.issubdtype(
            properties[feature], np.integer
        ):
            if type(properties[feature]).__module__ == np.__name__:
                properties[feature] = properties[feature].item()

    node["properties"] = properties
    return node


@use_timing
def enrich_with_props(
    df: pd.DataFrame, nodes: List[Node], anchor: str, anchor_properties: List[str]
) -> List[Node]:
    return [
        enrich_node_with_props(node, df, anchor_properties)
        if node["feature"] == anchor
        else node
        for node in nodes
    ]


def adjust_node_size(
    nodes: List[Node], df: pd.DataFrame, features: List[str]
) -> List[Node]:
    """Adjust size of nodes based on frequency of labesl in given dataframe"""

    node_label_frequencies = {}

    for feature in features:
        node_label_frequencies[feature] = get_labels(df, feature)

    for node in nodes:
        if (
            node["feature"] in node_label_frequencies
            and node["label"] in node_label_frequencies[node["feature"]]
        ):
            calculated_size = np.log2(
                node_label_frequencies[node["feature"]][node["label"]]
            )

            if calculated_size == -np.inf:
                calculated_size = 0
        else:
            calculated_size = 0

        node["size"] = math.ceil(calculated_size + 5)

    return nodes


def get_label_counts(
    data: pl.DataFrame, feature, featureIsList, size_factor
) -> List[Dict]:
    """Get counts of labels in a given feature"""
    if featureIsList:
        data = (
            data.explode(feature)
            .with_columns(csx_entry=pl.col("entry"))
            .groupby(feature, maintain_order=True)
            .all()
        )

        return (
            data.lazy()
            .with_columns(
                [
                    pl.col("csx_entry").list.lengths().alias("csx_frequency"),
                    pl.col("csx_entry").list.unique().alias("csx_entries"),
                    pl.lit(feature).alias("feature"),
                    pl.lit(0).alias("community"),
                    pl.lit(0).alias("component"),
                    pl.Series(
                        name="id", values=[uuid.uuid4().hex for _ in range(len(data))]
                    ),
                ]
            )
            .with_columns(
                pl.col("csx_entries").list.lengths().alias("csx_entry_frequency")
            )
            .with_columns(
                pl.col("csx_entry_frequency")
                .apply(lambda x: math.ceil(np.log2(x) + size_factor))
                .alias("size")
            )
            .drop("csx_entry")
            .rename({feature: "label", "csx_entries": "entries"})
            .select(
                pl.col(
                    [
                        "feature",
                        "label",
                        "csx_frequency",
                        "entries",
                        "csx_entry_frequency",
                        "community",
                        "component",
                        "id",
                        "size",
                    ]
                )
            )
            .collect()
            .to_dicts()
        )

    data = (
        data.with_columns(csx_entry=pl.col("entry"))
        .groupby(feature, maintain_order=True)
        .all()
    )
    return (
        data.lazy()
        .with_columns(
            [
                pl.col("csx_entry").list.lengths().alias("csx_frequency"),
                pl.col("csx_entry").list.lengths().alias("csx_entry_frequency"),
                pl.lit(feature).alias("feature"),
                pl.lit(0).alias("community"),
                pl.lit(0).alias("component"),
                pl.Series(
                    name="id", values=[uuid.uuid4().hex for _ in range(len(data))]
                ),
            ]
        )
        .with_columns(
            pl.col("csx_entry_frequency")
            .apply(lambda x: math.ceil(np.log2(x) + size_factor))
            .alias("size")
        )
        .rename({"csx_entry": "entries", feature: "label"})
        .select(
            pl.col(
                [
                    "feature",
                    "label",
                    "csx_frequency",
                    "entries",
                    "csx_entry_frequency",
                    "community",
                    "component",
                    "id",
                    "size",
                ]
            )
        )
        .collect()
        .to_dicts()
    )


def get_entry_list(df: pl.DataFrame):
    return {entry: [] for entry in df.get_column("entry").to_list()}


@use_timing
def get_feature_nodes(df: pd.DataFrame, feature: str, size_factor: int = 2):
    # -> List[Node]:
    """Generate list of node objects for all values of a given feature."""
    pldf = pl.from_pandas(df)

    featureIsList = isinstance(df.iloc[0][feature], list)

    new_entry_list = get_entry_list(pldf)
    new_nodes = get_label_counts(pldf, feature, featureIsList, size_factor)
    for node in new_nodes:
        for entry in node["entries"]:
            new_entry_list[entry].append(node)

    return new_nodes, new_entry_list


def enrich_entries_with_nodes(entries_with_nodes: Dict, nodes: List[Node]) -> Dict:
    """Enrich existing entries with nodes with additional nodes"""
    for node in nodes:
        for entry in node["entries"]:
            if entry in entries_with_nodes:
                entries_with_nodes[entry].append(node)
            else:
                entries_with_nodes[entry] = [node]

    return entries_with_nodes

@use_timing
def get_new_entries(new_entries_array):
    entries = {}
    for entry_array in new_entries_array:
        for entry in entry_array:
            if entry in entries:
                entries[entry] = entries[entry] + entry_array[entry]
            else:
                entries[entry] = entry_array[entry]
    return entries


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

    new_entries_arrays = []

    feature_list = features if len(features) > 0 else df.columns

    for feature in feature_list:
        new_nodes, new_entries = get_feature_nodes(df, feature, 5)
        nodes.extend(new_nodes)
        new_entries_arrays.append(new_entries)

    if len(features) > 0:
        nodes = enrich_with_props(df, nodes, anchor, anchor_properties)

    entries = get_new_entries(new_entries_arrays)

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
