from typing import List
from fastapi import APIRouter
import json
import app.utils.cache as csx_cache
import pandas as pd
import networkx as nx
import app.utils.analysis as csx_analysis


router = APIRouter()

from pydantic import BaseModel


class Data(BaseModel):
    nodes: List
    user_id: str


@router.post("/trim")
def trim_network(
    # nodes: List,
    # user_id: str,
    data: Data,
):
    node_ids = data.nodes
    network_data = csx_cache.load_current_network(data.user_id)
    network_data["nodes"] = [
        node for node in network_data["nodes"] if node["id"] in node_ids
    ]

    network_data["edges"] = [
        edge
        for edge in network_data["edges"]
        if edge["source"] in node_ids and edge["target"] in node_ids
    ]

    network_data["components"] = [
        component
        for component in network_data["components"]
        if len(list(set(component["nodes"]).intersection(set(node_ids)))) > 0
    ]

    list_of_entries = [node["entries"] for node in network_data["nodes"]]
    entries = list(set([entry for entries in list_of_entries for entry in entries]))

    network_data["meta"]["table_data"] = [
        data for data in network_data["meta"]["table_data"] if data["entry"] in entries
    ]

    data_df = pd.read_json(network_data["meta"]["results_df"])

    network_data["meta"]["results_df"] = data_df[
        data_df["entry"].isin(entries)
    ].to_json()

    network_data["meta"]["nx_graph"] = nx.to_dict_of_dicts(
        csx_analysis.graph_from_graph_data(network_data)
    )

    csx_cache.save_current_network(
        data.user_id,
        network_data,
        {},
    )

    return network_data
