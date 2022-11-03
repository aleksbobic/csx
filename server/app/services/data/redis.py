import pickle

import app.services.graph.graph as csx_graph
import app.services.data.mongo as csx_data
import networkx as nx
import pandas as pd

from typing import Dict, Any, List, Union, Tuple, Literal
from app.types import Component, ConnectionCount, Edge, Node, ComparisonResults
import redis

r = redis.Redis(host="redis", port=6379, db=0)


def save_current_graph(
    uuid: str, cache_data: Dict, graph_type: Literal["overview", "detail"]
):
    cache_data[graph_type]["meta"] = {
        **cache_data[graph_type]["meta"],
        "nx_graph": nx.to_dict_of_dicts(
            csx_graph.from_graph_data(cache_data[graph_type])
        ),
    }

    r.set(uuid, pickle.dumps(cache_data))
    return cache_data


def save_new_instance_of_cache_data(uuid: str, cache_data: Dict):
    r.set(uuid, pickle.dumps(cache_data))
    return cache_data


def load_current_graph(uuid: str) -> Dict:
    graph = r.get(uuid)
    if graph:
        return pickle.loads(graph)
    return {}


def compare_instances(
    cache_data: Dict, params: Dict, graph_type: Literal["overview", "detail"]
) -> ComparisonResults:
    """Compare existing cache graph with set of given parameters"""
    difference = None
    action = "from_cache"
    history_action = "initial search"

    if not cache_data:
        difference = "data"
        action = "from_scratch"
        history_action = "initial search"
    elif cache_data["global"]["search_uuid"] != params["search_uuid"]:
        difference = "search_uuid"
        action = "from_scratch"
        history_action = "modified search"
    elif cache_data["global"]["query"] != params["query"]:
        difference = "query"
        action = "from_scratch"
        history_action = "modified search"
    elif not cache_data[graph_type]:
        difference = "graph_type"
        action = "from_existing_data"
        history_action = "change graph type"
    elif cache_data[graph_type]["meta"]["schema"] != params["schema"]:
        difference = "schema"
        action = "from_existing_data"
        history_action = "change schema"
    elif cache_data[graph_type]["meta"]["dimensions"] != params["dimensions"]:
        difference = "dimensions"
        action = "from_existing_data"
        history_action = "change visible nodes"
    elif (
        "anchor_properties" in cache_data[graph_type]["meta"]
        and cache_data[graph_type]["meta"]["anchor_properties"]
        != params["anchor_properties"]
    ):
        difference = "anchor_properties"
        action = "from_anchor_properties"
        history_action = "change anchor properties"

    return {
        "same": difference == "",
        "difference": difference,
        "action": action,
        "data": cache_data,
        "history_action": history_action,
    }


def generate_cache_data(
    graph_type: Literal["overview", "detail"],
    cache_data: Dict,
    graph_data: Dict,
    search_uuid: str,
    index: str,
    query: str,
    dimensions: Dict,
    table_data: List[Dict],
    results: pd.DataFrame,
    comparison_res: ComparisonResults,
    elastic_json: Dict,
    study_id: str,
) -> Dict:
    """Generate cache data"""

    if graph_type == "overview":
        overview = graph_data
        if comparison_res["difference"] == "search_uuid":
            detail = {}
        else:
            detail = cache_data["detail"] if cache_data else {}
    else:
        if comparison_res["difference"] == "search_uuid":
            overview = {}
        else:
            overview = cache_data["overview"] if cache_data else {}
        detail = graph_data

    return {
        "overview": overview,
        "detail": detail,
        "global": {
            "search_uuid": search_uuid,
            "study_id": study_id,
            "index": index,
            "new_dimensions": dimensions["query_generated"],
            "query": query,
            "table_data": table_data,
            "results_df": results.to_json(),
            "elastic_json": elastic_json,
        },
    }
