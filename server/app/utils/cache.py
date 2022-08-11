import redis
import pickle
import networkx as nx

import app.utils.analysis as csx_analysis

r = redis.Redis(host="redis", port=6379, db=0)


def save_current_graph(uuid, cache_data, graph_type):
    cache_data[graph_type]["meta"] = {
        **cache_data[graph_type]["meta"],
        "nx_graph": nx.to_dict_of_dicts(
            csx_analysis.graph_from_graph_data(cache_data[graph_type])
        ),
    }

    r.set(uuid, pickle.dumps(cache_data))


def save_new_instance_of_cache_data(uuid, cache_data):
    r.set(uuid, pickle.dumps(cache_data))


def load_current_graph(uuid):
    graph = r.get(uuid)
    if graph:
        return pickle.loads(graph)
    return {}


def compare_instances(cache_data, params, graph_type):
    difference = None
    action = "from_cache"

    if not cache_data:
        difference = "data"
        action = "from_scratch"
    elif cache_data["global"]["search_uuid"] != params["search_uuid"]:
        difference = "search_uuid"
        action = "from_scratch"
    elif cache_data["global"]["query"] != params["query"]:
        difference = "query"
        action = "from_scratch"
    elif not cache_data[graph_type]:
        difference = "graph_type"
        action = "from_existing_data"
    elif cache_data[graph_type]["meta"]["schema"] != params["schema"]:
        difference = "schema"
        action = "from_existing_data"
    elif cache_data[graph_type]["meta"]["dimensions"] != params["dimensions"]:
        difference = "dimensions"
        action = "from_existing_data"
    elif (
        "anchor_properties" in cache_data[graph_type]["meta"]
        and cache_data[graph_type]["meta"]["anchor_properties"]
        != params["anchor_properties"]
    ):
        difference = "anchor_properties"
        action = "from_anchor_properties"

    # TODO: Check for table data

    return {
        "same": difference == None,
        "difference": difference,
        "action": action,
        "data": cache_data,
    }


def generate_cache_data(
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
):
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
            "index": index,
            "new_dimensions": dimensions["query_generated"],
            "query": query,
            "table_data": table_data,
            "results_df": results.to_json(),
            "elastic_json": elastic_json,
        },
    }
