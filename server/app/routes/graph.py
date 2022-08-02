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
    graph_type: str


@router.post("/trim")
def trim_network(
    data: Data,
):
    node_ids = data.nodes
    cache_data = csx_cache.load_current_graph(data.user_id)
    cache_data[data.graph_type]["nodes"] = [
        node for node in cache_data[data.graph_type]["nodes"] if node["id"] in node_ids
    ]

    cache_data[data.graph_type]["edges"] = [
        edge
        for edge in cache_data[data.graph_type]["edges"]
        if edge["source"] in node_ids and edge["target"] in node_ids
    ]

    cache_data[data.graph_type]["components"] = [
        component
        for component in cache_data[data.graph_type]["components"]
        if len(list(set(component["nodes"]).intersection(set(node_ids)))) > 0
    ]

    list_of_entries = [node["entries"] for node in cache_data[data.graph_type]["nodes"]]
    entries = list(set([entry for entries in list_of_entries for entry in entries]))

    cache_data["global"]["table_data"] = [
        data for data in cache_data["global"]["table_data"] if data["entry"] in entries
    ]

    data_df = pd.read_json(cache_data["global"]["results_df"])

    cache_data["global"]["results_df"] = data_df[
        data_df["entry"].isin(entries)
    ].to_json()

    cache_data[data.graph_type]["meta"]["nx_graph"] = nx.to_dict_of_dicts(
        csx_analysis.graph_from_graph_data(cache_data[data.graph_type])
    )

    csx_cache.save_current_graph(
        data.user_id,
        cache_data,
        data.graph_type,
        {},
    )

    return cache_data[data.graph_type]
