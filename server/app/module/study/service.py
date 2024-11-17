import uuid
from typing import Any, Dict, List, Literal

import app.services.graph.graph as csx_graph
import networkx as nx
import pandas as pd
from app.services.storage.base import BaseStorageConnector
from app.types import ComparisonResults

from . import utils as study_utils


def compare_instances(
    cache_data: Dict, params: Dict, graph_type: Literal["overview", "detail"]
) -> ComparisonResults:
    """
    Compare existing cache graph with a set of given parameters.

    Args:
        cache_data (Dict): The existing cache data.
        params (Dict): The parameters to compare against.
        graph_type (Literal["overview", "detail"]): The type of graph.

    Returns:
        ComparisonResults: The result of the comparison.
    """

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

    if "graph_type_changed" in params and params["graph_type_changed"]:
        difference = "graph_type"
        action = "from_existing_data"
        history_action = "change graph type"

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
    """
    Generate cache data.

    Args:
        graph_type (Literal["overview", "detail"]): The type of graph.
        cache_data (Dict[str, Any]): The existing cache data.
        graph_data (Dict[str, Any]): The new graph data.
        search_uuid (str): The search UUID.
        index (str): The index.
        query (str): The query.
        dimensions (Dict[str, Any]): The dimensions.
        table_data (List[Dict[str, Any]]): The table data.
        results (pd.DataFrame): The results dataframe.
        comparison_res (ComparisonResults): The comparison results.
        elastic_json (Dict[str, Any]): The elastic JSON data.
        study_id (str): The study ID.

    Returns:
        Dict[str, Any]: The generated cache data.
    """

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


def enrich_cache_with_ng_graph(
    cache_data: Dict, graph_type: Literal["overview", "detail"]
) -> Dict[str, Any]:
    """
    Enrich the cache data with a NetworkX graph.

    Args:
        cache_data (Dict[str, Any]): The existing cache data.
        graph_type (Literal["overview", "detail"]): The type of graph.

    Returns:
        Dict[str, Any]: The enriched cache data.
    """
    meta = cache_data[graph_type]["meta"]
    nx_graph = nx.to_dict_of_dicts(csx_graph.from_graph_data(cache_data[graph_type]))

    cache_data[graph_type]["meta"] = {**meta, "nx_graph": nx_graph}

    return cache_data


def extract_history_items(study) -> List[dict]:
    """
    Extract history items from a study.

    Args:
        study (Dict[str, Any]): The study dictionary.

    Returns:
        List[Dict[str, Any]]: The extracted history items.
    """
    if not study or "history" not in study or not study["history"]:
        return []

    return [
        {
            "id": str(item["item_id"]),
            "action": item["action"],
            "comments": study_utils.extract_comments(item["comments"]),
            "parent": str(item["parent"]),
            "query": item["query"],
            "graph_type": item["graph_type"],
            "action_time": item["action_time"],
            "schema": item["schema"],
            "anchor_properties": item["anchor_properties"],
            "anchor": item["anchor"],
            "links": item["links"],
            "visible_dimensions": item["visible_dimensions"],
            "parent_id": item["parent"],
            "charts": item["charts"],
            "edge_count": item["edge_count"],
            "node_count": item["node_count"],
        }
        for item in study["history"]
    ]


def get_study_details(
    study: Dict[str, Any], storage: BaseStorageConnector
) -> Dict[str, Any]:
    """
    Retrieve study details including history items and charts.

    Args:
        study (Dict[str, Any]): The study dictionary.
        storage (BaseStorageConnector): The storage connector.

    Returns:
        Dict[str, Any]: The formatted study response.
    """
    try:
        history_id = study["history"][-1]["item_id"]
        charts = study["history"][-1]["charts"]
        history_item = storage.get_history_item(history_id)
        history = extract_history_items(study)
    except (KeyError, IndexError) as e:
        raise ValueError(f"Error retrieving study details: {e}")

    return study_utils.format_study_response(study, history_item, history, charts)


def update_study_settings(
    study_id: str,
    data: Dict[str, Any],
    user_id: str,
    study: Dict[str, Any],
    storage: BaseStorageConnector,
) -> str:
    """
    Update study settings and return public URL if public is set to true for the first time.

    Args:
        study_id (str): The ID of the study.
        data (Dict[str, Any]): The study update data.
        user_id (str): The ID of the user.
        study (Dict[str, Any]): The current study.
        storage (BaseStorageConnector): The storage connector.

    Returns:
        str: The public URL if updated, otherwise an empty string.
    """
    updated_settings = {**data, "saved": True}

    if not study.get("public_url") and data.get("public"):
        updated_settings["public_url"] = uuid.uuid4().hex
    else:
        updated_settings["public_url"] = study.get("public_url", "")

    try:
        storage.update_study_settings(study_id, user_id, updated_settings)
    except Exception as e:
        raise ValueError(f"Error updating study settings: {e}")

    return updated_settings.get("public_url", "")
