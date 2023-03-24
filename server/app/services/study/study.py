import pickle

import app.services.data.mongo as csx_data
from bson import ObjectId
from typing import Dict, Literal, List
from app.types import ComparisonResults
import pandas as pd
import networkx as nx
import app.services.graph.graph as csx_graph
from typing import Union


def store_history_entry(entry):
    return csx_data.insert_large_document(entry)
    # return csx_data.insert_document("history", entry)


def new_history_entry(study_id, user_id, data):
    # insert_response = store_history_entry({"data": data["graph_data"]})
    insert_response = store_history_entry(data["graph_data"])

    csx_data.update_document(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        {
            "$push": {
                "history": {
                    "item_id": insert_response,
                    "action": data["action"],
                    "graph_type": data["graph_type"],
                    "query": data["query"],
                    "action_time": data["action_time"],
                    "schema": data["schema"],
                    "anchor_properties": data["anchor_properties"],
                    "anchor": data["anchor"],
                    "links": data["links"],
                    "visible_dimensions": data["visible_dimensions"],
                    "comments": [],
                    "parent": data["history_parent_id"],
                    "charts": data["charts"],
                    "edge_count": data["edge_count"],
                    "node_count": data["node_count"],
                }
            }
        },
    )


def load_cache_data_from_histroy(history_item_id):
    last_history_item = csx_data.get_large_document(ObjectId(history_item_id))
    return pickle.loads(last_history_item)

    # return pickle.loads(last_history_item["data"])


def load_last_history_item(study_id, user_id):
    history_list = list(
        csx_data.get_all_documents_by_conditions(
            "studies",
            {"$and": [{"user_uuid": user_id}, {"study_uuid": study_id}]},
            {"_id": 0},
        )
    )[0]["history"]

    return history_list[len(history_list) - 1]


def get_study(user_id, study_id):
    studies = list(
        csx_data.get_all_documents_by_conditions(
            "studies",
            {"$and": [{"user_uuid": user_id}, {"study_uuid": study_id}]},
            {"_id": 0},
        )
    )

    if len(studies) == 0:
        return None

    return studies[0]


def get_public_study(public_study_id):
    studies = list(
        csx_data.get_all_documents_by_conditions(
            "studies",
            {"$and": [{"public_url": public_study_id}]},
            {"_id": 0},
        )
    )

    if len(studies) == 0:
        return None

    return studies[0]


def add_index(study_uuid: str, user_uuid: str, index: str):
    csx_data.update_document(
        "studies",
        {"study_uuid": study_uuid, "user_uuid": user_uuid},
        {"$set": {"index": index}},
    )
    return


def add_comment(
    study_id: str,
    user_id: str,
    history_item_id: str,
    comment: str,
    comment_time: str,
    screenshot: Union[str, None],
    screenshot_width: Union[int, None],
    screenshot_height: Union[int, None],
    chart: Union[str, None],
):
    csx_data.update_document(
        "studies",
        {
            "study_uuid": study_id,
            "user_uuid": user_id,
            "history.item_id": ObjectId(history_item_id),
        },
        {
            "$push": {
                "history.$.comments": {
                    "_id": ObjectId(),
                    "comment": comment,
                    "time": comment_time,
                    "screenshot": screenshot,
                    "screenshot_width": screenshot_width,
                    "screenshot_height": screenshot_height,
                    "chart": chart,
                }
            }
        },
    )


def delete_comment(study_id: str, user_id: str, history_item_id: str, comment_id: str):
    csx_data.delete_from_array_by_id(
        "studies",
        {
            "study_uuid": study_id,
            "user_uuid": user_id,
            "history.item_id": ObjectId(history_item_id),
            "history.comments._id": ObjectId(comment_id),
        },
        "history.$.comments",
        comment_id,
    )


def edit_comment(
    study_id: str,
    user_id: str,
    history_item_id: str,
    comment_id: str,
    comment: str,
    comment_time: str,
    screenshot: Union[str, None],
    screenshot_width: Union[int, None],
    screenshot_height: Union[int, None],
    chart: Union[str, None],
):
    csx_data.edit_array_with_filters(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        {
            f"history.$[i].comments.$[j].comment": comment,
            f"history.$[i].comments.$[j].screenshot": screenshot,
            f"history.$[i].comments.$[j].screenshot_width": screenshot_width,
            f"history.$[i].comments.$[j].screenshot_height": screenshot_height,
            f"history.$[i].comments.$[j].chart": chart,
            f"history.$[i].comments.$[j].time": comment_time,
            f"history.$[i].comments.$[j].edited": True,
        },
        [{"i.item_id": ObjectId(history_item_id)}, {"j._id": ObjectId(comment_id)}],
    )


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


def enrich_cache_with_ng_graph(
    cache_data: Dict, graph_type: Literal["overview", "detail"]
):
    cache_data[graph_type]["meta"] = {
        **cache_data[graph_type]["meta"],
        "nx_graph": nx.to_dict_of_dicts(
            csx_graph.from_graph_data(cache_data[graph_type])
        ),
    }

    return cache_data


def extract_history_items(study) -> List[dict]:
    if study is None or "history" not in study or len(study["history"]) == 0:
        return []

    return [
        {
            "id": str(item["item_id"]),
            "action": item["action"],
            "comments": [
                {
                    "id": str(comment["_id"]),
                    "comment": comment["comment"],
                    "time": comment["time"],
                    "screenshot": comment["screenshot"],
                    "screenshot_width": comment["screenshot_width"],
                    "screenshot_height": comment["screenshot_height"],
                    "chart": comment["chart"],
                }
                for comment in item["comments"]
            ],
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
