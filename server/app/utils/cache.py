from curses import meta
import redis
import pickle
import networkx as nx

import app.utils.analysis as csx_analysis

r = redis.Redis(host="redis", port=6379, db=0)


def save_current_network(uuid, graph_data, params):
    graph_data["meta"] = {
        **graph_data["meta"],
        **params,
        "nx_graph": nx.to_dict_of_dicts(csx_analysis.graph_from_graph_data(graph_data)),
    }

    r.set(uuid, pickle.dumps(graph_data))


def load_current_network(uuid):
    graph = r.get(uuid)
    if graph:
        return pickle.loads(graph)
    return


def same_network(graph_data, params):
    if not graph_data or graph_data["meta"]["index"] != params["index"]:
        return {"same": False, "difference": "index", "data": graph_data}
    if graph_data["meta"]["graph"] != params["query"]:
        return {"same": False, "difference": "query", "data": graph_data}
    if graph_data["meta"]["schema"] != params["schema"]:
        return {"same": False, "difference": "schema", "data": graph_data}
    if graph_data["meta"]["dimensions"] != params["dimensions"]:
        return {"same": False, "difference": "dimensions", "data": graph_data}
    if graph_data["meta"]["anchor_properties"] != params["anchor_properties"]:
        return {"same": False, "difference": "anchor_properties", "data": graph_data}
    return {"same": True, "difference": None, "data": graph_data}
