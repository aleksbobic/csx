import json
import pickle
import uuid
from typing import Dict, Generator, List, Literal, cast

import app.services.graph.components as csx_components
import app.services.graph.edges as csx_edges
import app.services.graph.nodes as csx_nodes
import app.services.study.study as csx_study
import networkx as nx
import pandas as pd
from app.services.storage.base import BaseStorageConnector
from app.types import Node, SchemaElement
from app.utils.timer import use_timing


def get_graph(
    storage: Generator[BaseStorageConnector, None, None],
    graph_type: Literal["overview", "detail"],
    elastic_json: Dict,
    dimensions: Dict,
    schema: List[SchemaElement],
    index: str,
) -> Dict:
    """Generate graph"""
    if graph_type == "overview":
        return get_overview_graph(
            storage,
            elastic_json,
            dimensions["links"],
            dimensions["anchor"]["dimension"],
            dimensions["anchor"]["props"],
            index,
        )

    return get_detail_graph(
        storage, elastic_json, dimensions["all"], dimensions["visible"], schema, index
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
    storage,
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

    config = storage.get_config(index)

    list_features = [
        feature for feature in features if config["dimension_types"][feature] == "list"
    ]
    non_list_features = [
        feature for feature in features if config["dimension_types"][feature] != "list"
    ]

    if len(non_list_features) > 0:
        nodes, entries_with_nodes = csx_nodes.get_nodes(
            search_results_df, non_list_features
        )
    else:
        nodes = []
        entries_with_nodes = {}

    if len(list_features) > 0:
        mongo_nodes = storage.get_precomputed_nodes(
            index, search_results_df.entry.tolist(), list_features
        )
        entries_with_nodes = csx_nodes.enrich_entries_with_nodes(
            entries_with_nodes, mongo_nodes
        )
        mongo_nodes = csx_nodes.adjust_node_size(
            mongo_nodes, search_results_df, list_features
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
    storage,
    search_results,
    links: List[str],
    anchor: str,
    anchor_properties: List[str],
    index,
):
    search_results_df = pd.DataFrame(search_results)

    is_anchor_list = False
    list_links = []
    non_list_links = []

    config = storage.get_config(index)

    is_anchor_list = config["dimension_types"][anchor] == "list"
    list_links = [link for link in links if config["dimension_types"][link] == "list"]
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
        mongo_nodes = storage.get_precomputed_nodes(
            index,
            search_results_df.entry.tolist(),
            list_links + [anchor] if is_anchor_list else list_links,
        )

        if is_anchor_list:
            unique_entry_set = set(search_results_df.entry.tolist())
            unique_mongo_anchor_node_entry_set = set(
                [
                    item
                    for sublist in [
                        node["entries"]
                        for node in mongo_nodes
                        if node["feature"] == anchor
                    ]
                    for item in sublist
                ]
            )

            entries_with_no_anchor_value = list(
                unique_entry_set - unique_mongo_anchor_node_entry_set
            )

            if len(entries_with_no_anchor_value) > 0:
                mongo_nodes.append(
                    {
                        "entries": entries_with_no_anchor_value,
                        "id": uuid.uuid4().hex,
                        "label": f"CSX_No_{anchor}",
                        "feature": anchor,
                        "community": 0,
                        "component": 0,
                        "size": len(entries_with_no_anchor_value) + 5,
                    }
                )

        entries_with_nodes = csx_nodes.enrich_entries_with_nodes(
            entries_with_nodes, mongo_nodes
        )

        mongo_nodes = csx_nodes.adjust_node_size(
            mongo_nodes,
            search_results_df,
            list_links + [anchor] if is_anchor_list else list_links,
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


@use_timing
def convert_table_data(nodes: List[Node], elastic_results: List[Dict]) -> List[Dict]:
    """Extract table data from elastic results and node list and generate particular entries needed for client side."""

    dataEntries = {}

    for node in nodes:
        for entryId in node["entries"]:
            dataEntries[entryId] = {}

    for node in nodes:
        for entryId in node["entries"]:
            dataEntries[entryId][f"{node['feature']}_{node['label']}_id"] = node["id"]

    return [{**dataEntries[row["entry"]], **row} for row in elastic_results]


def get_graph_from_scratch(
    storage,
    graph_type,
    dimensions,
    elastic_json,
    visible_entries,
    index,
    cache_data,
    search_uuid,
    results,
    user_id,
    schema,
    anchor_properties,
    comparison_res,
    study_id,
    query,
    action_time,
    history_action,
    history_parent_id,
    charts,
):
    graph_data = get_graph(storage, graph_type, elastic_json, dimensions, schema, index)
    table_data = convert_table_data(graph_data["nodes"], elastic_json)
    anchor_property_values = csx_nodes.get_anchor_property_values(
        elastic_json, dimensions["anchor"]["props"]
    )

    graph_data["meta"] = generate_graph_metadata(
        graph_type,
        dimensions,
        table_data,
        schema,
        query,
        visible_entries,
        anchor_properties,
        anchor_property_values,
        graph_data,
    )

    cache_data = csx_study.generate_cache_data(
        graph_type,
        cache_data,
        graph_data,
        search_uuid,
        index,
        query,
        dimensions,
        table_data,
        results,
        comparison_res,
        elastic_json,
        study_id,
    )

    cache_snapshot = csx_study.enrich_cache_with_ng_graph(cache_data, graph_type)

    storage.insert_history_item(
        study_id,
        user_id,
        {
            "action": history_action,
            "graph_type": graph_type,
            "graph_data": pickle.dumps(cache_snapshot),
            "query": query,
            "action_time": action_time,
            "schema": schema,
            "anchor_properties": dimensions["anchor"]["props"],
            "anchor": dimensions["anchor"]["dimension"],
            "links": dimensions["links"],
            "visible_dimensions": dimensions["visible"],
            "history_parent_id": history_parent_id,
            "charts": charts,
            "edge_count": len(graph_data["edges"]),
            "node_count": len(graph_data["nodes"]),
        },
    )

    return graph_data


def get_graph_with_new_anchor_props(
    storage,
    comparison_res,
    graph_type,
    dimensions,
    elastic_json,
    user_id,
    study_id,
    action,
    query,
    index,
    action_time,
    history_action,
    schema,
    anchor_properties,
    history_parent_id,
    cache_data,
    charts,
):
    graph_data = get_props_for_cached_nodes(
        comparison_res, dimensions["anchor"]["props"], graph_type
    )

    graph_data["meta"]["anchor_properties"] = anchor_properties
    graph_data["meta"]["anchor_property_values"] = csx_nodes.get_anchor_property_values(
        elastic_json, dimensions["anchor"]["props"]
    )

    cache_data[graph_type]["meta"]["anchor_property_values"] = graph_data["meta"][
        "anchor_property_values"
    ]
    cache_data[graph_type]["nodes"] = graph_data["nodes"]

    storage.insert_history_item(
        study_id,
        user_id,
        {
            "action": history_action,
            "graph_type": graph_type,
            "graph_data": pickle.dumps(cache_data),
            "query": query,
            "action_time": action_time,
            "schema": schema,
            "anchor_properties": dimensions["anchor"]["props"],
            "anchor": dimensions["anchor"]["dimension"],
            "links": dimensions["links"],
            "visible_dimensions": dimensions["visible"],
            "history_parent_id": history_parent_id,
            "charts": charts,
            "edge_count": len(graph_data["edges"]),
            "node_count": len(graph_data["nodes"]),
        },
    )

    return graph_data


def get_graph_from_existing_data(
    storage,
    graph_type,
    dimensions,
    elastic_json,
    visible_entries,
    cache_data,
    user_id,
    schema,
    anchor_properties,
    index,
    study_id,
    action,
    query,
    action_time,
    history_action,
    history_parent_id,
    charts,
):
    # Take global table data and generate grpah

    graph_data = get_graph(
        storage,
        graph_type,
        cache_data["global"]["elastic_json"],
        dimensions,
        schema,
        index,
    )

    table_data = convert_table_data(
        graph_data["nodes"], cache_data["global"]["elastic_json"]
    )

    anchor_property_values = csx_nodes.get_anchor_property_values(
        cache_data["global"]["elastic_json"], dimensions["anchor"]["props"]
    )

    graph_data["meta"] = generate_graph_metadata(
        graph_type,
        dimensions,
        table_data,
        schema,
        query,
        visible_entries,
        anchor_properties,
        anchor_property_values,
        graph_data,
    )

    cache_data[graph_type] = graph_data

    storage.insert_history_item(
        study_id,
        user_id,
        {
            "action": history_action,
            "graph_type": graph_type,
            "graph_data": pickle.dumps(cache_data),
            "query": query,
            "action_time": action_time,
            "schema": schema,
            "anchor_properties": dimensions["anchor"]["props"],
            "anchor": dimensions["anchor"]["dimension"],
            "links": dimensions["links"],
            "visible_dimensions": dimensions["visible"],
            "history_parent_id": history_parent_id,
            "charts": charts,
            "edge_count": len(graph_data["edges"]),
            "node_count": len(graph_data["nodes"]),
        },
    )

    return graph_data


def get_graph_from_cache(
    storage,
    comparison_res,
    graph_type,
    study_id,
    action,
    query,
    user_id,
    index,
    action_time,
    history_action,
    schema,
    anchor_properties,
    dimensions,
    history_parent_id,
    charts,
):
    storage.insert_history_item(
        study_id,
        user_id,
        {
            "action": history_action,
            "graph_type": graph_type,
            "graph_data": pickle.dumps(comparison_res["data"]),
            "query": query,
            "action_time": action_time,
            "schema": schema,
            "anchor_properties": dimensions["anchor"]["props"],
            "anchor": dimensions["anchor"]["dimension"],
            "links": dimensions["links"],
            "visible_dimensions": dimensions["visible"],
            "history_parent_id": history_parent_id,
            "charts": charts,
            "edge_count": len(comparison_res["data"][graph_type]["edges"]),
            "node_count": len(comparison_res["data"][graph_type]["nodes"]),
        },
    )

    return comparison_res["data"][graph_type]


def calculate_trimmed_graph(cache_data, entries, graph_type):
    df = cast(pd.DataFrame, pd.read_json(cache_data["global"]["results_df"]))

    # Filter graph nodes
    new_nodes = [
        node
        for node in cache_data[graph_type]["nodes"]
        if len(set(node["entries"]).intersection(set(entries))) > 0
    ]

    cache_data[graph_type]["nodes"] = new_nodes

    # Get visible nodes
    visible_nodes = [
        node["id"]
        for node in new_nodes
        if len(set(node["entries"]).intersection(set(entries))) > 0
    ]

    for node in cache_data[graph_type]["nodes"]:
        node["entries"] = list(set(node["entries"]).intersection(set(entries)))

    # Filter graph edges
    cache_data[graph_type]["edges"] = [
        edge
        for edge in cache_data[graph_type]["edges"]
        if edge["source"] in visible_nodes and edge["target"] in visible_nodes
    ]

    # Filter graph components
    cache_data[graph_type]["components"] = [
        component
        for component in cache_data[graph_type]["components"]
        if len(list(set(component["nodes"]).intersection(set(visible_nodes)))) > 0
    ]

    # Modify table data of graph
    # Due to the particular structure of table_data in the cxs client both overview and detail graph have to have their own instance of table data
    cache_data[graph_type]["meta"]["table_data"] = convert_table_data(
        cache_data[graph_type]["nodes"], cache_data["global"]["elastic_json"]
    )

    # Generate new NetworkX graph
    cache_data[graph_type]["meta"]["nx_graph"] = nx.to_dict_of_dicts(
        from_graph_data(cache_data[graph_type])
    )

    components = csx_components.get_components(
        cache_data[graph_type]["nodes"],
        [],
        from_graph_data(cache_data[graph_type]),
    )

    nodes = csx_nodes.enrich_with_components(new_nodes, components)
    nodes = csx_nodes.enrich_with_neighbors(
        nodes, [], from_graph_data(cache_data[graph_type])
    )

    nodes = csx_nodes.adjust_node_size(
        nodes, df, cache_data[graph_type]["meta"]["dimensions"]
    )

    cache_data[graph_type]["edges"] = csx_edges.enrich_with_components(
        cache_data[graph_type]["edges"], components
    )

    cache_data[graph_type]["nodes"] = nodes

    if graph_type == "overview":
        components = csx_components.enrich_with_top_connections(
            components, cache_data[graph_type]["edges"]
        )

        for property_value in cache_data[graph_type]["meta"]["anchor_property_values"]:
            property_value["values"] = [
                node["properties"][property_value["property"]]
                for node in cache_data[graph_type]["nodes"]
            ]

    components = sorted(components, key=lambda component: -component["node_count"])

    cache_data[graph_type]["components"] = components

    cache_data[graph_type]["meta"]["max_degree"] = get_max_degree(
        from_graph_data(cache_data[graph_type])
    )

    return cache_data
