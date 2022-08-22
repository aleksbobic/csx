import networkx as nx


def graph_from_graph_data(graph_data) -> nx.Graph:
    graph = nx.Graph()
    graph.add_nodes_from([node["id"] for node in graph_data["nodes"]])
    graph.add_edges_from(
        [(edge["source"], edge["target"]) for edge in graph_data["edges"]]
    )
    return graph


def graph_from_cache(graph_data) -> nx.Graph:
    graph = nx.from_dict_of_dicts(graph_data["meta"]["nx_graph"])
    return graph


def get_max_degree(graph: nx.Graph):
    return max([d for n, d in graph.degree()])
