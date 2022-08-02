import redis
import pickle
import networkx as nx

import app.utils.analysis as csx_analysis

r = redis.Redis(host="redis", port=6379, db=0)


def save_current_graph(uuid, cache_data, graph_type, additional_params):
    # store overview graph, detail graph and global settings

    cache_data[graph_type]["meta"] = {
        **cache_data[graph_type]["meta"],
        **additional_params,
        "nx_graph": nx.to_dict_of_dicts(
            csx_analysis.graph_from_graph_data(cache_data[graph_type])
        ),
    }

    r.set(uuid, pickle.dumps(cache_data))


def load_current_graph(uuid):
    graph = r.get(uuid)
    if graph:
        return pickle.loads(graph)
    return


def is_same_graph(cache_data, params, graph_type):
    if (
        not cache_data
        or not cache_data[graph_type]
        or cache_data["global"]["index"] != params["index"]
    ):
        return {"same": False, "difference": "index", "data": cache_data}

    if cache_data["global"]["query"] != params["query"]:
        return {"same": False, "difference": "query", "data": cache_data}

    if cache_data[graph_type]["meta"]["schema"] != params["schema"]:
        return {"same": False, "difference": "schema", "data": cache_data}

    if cache_data[graph_type]["meta"]["dimensions"] != params["dimensions"]:
        return {"same": False, "difference": "dimensions", "data": cache_data}

    if (
        graph_type == "overview"
        and cache_data[graph_type]["meta"]["anchor_properties"]
        != params["anchor_properties"]
    ):
        return {"same": False, "difference": "anchor_properties", "data": cache_data}

    return {"same": True, "difference": None, "data": cache_data}
