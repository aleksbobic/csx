import itertools
import json
import os
import pickle
from typing import List, Literal, Union

import app.services.graph.graph as csx_graph
import app.services.search.elastic as csx_es
import app.services.study.study as csx_study
import pandas as pd
from app.api.dependencies import get_storage_connector, verify_user_exists
from app.services.storage.base import BaseStorageConnector
from app.utils.typecheck import isJson, isNumber
from bson import ObjectId
from elasticsearch_dsl import Q, Search
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel

from elasticsearch import Elasticsearch

router = APIRouter(prefix="/studies/{study_id}/history", tags=["history"])

es = Elasticsearch(
    "csx_elastic:9200",
    retry_on_timeout=True,
    http_auth=("elastic", os.getenv("ELASTIC_PASSWORD")),
)


@router.delete("/{history_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_items(
    history_item_id: str,
    study_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    storage.delete_history_item(study_id, user_id, history_item_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/")
def get_study_history(study_id: str, user_id: str = Depends(verify_user_exists)):
    study = csx_study.get_study(user_id, study_id)
    if study:
        history = csx_study.extract_history_items(study)
        return {
            "name": study["study_name"],
            "author": study["study_author"] if "study_author" in study else "",
            "description": study["study_description"],
            "history": history,
            "empty": False,
        }
    else:
        return {"empty": True}


@router.get("/{history_item_id}")
def get_history_item(
    history_item_id: str,
    study_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    study = csx_study.get_study(user_id, study_id)

    if not study:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study not found",
        )

    history_id = [
        entry
        for entry in study["history"]
        if entry["item_id"] == ObjectId(history_item_id)
    ][0]["item_id"]
    charts = [
        entry
        for entry in study["history"]
        if entry["item_id"] == ObjectId(history_item_id)
    ][0]["charts"]

    history_item = storage.get_history_item(history_id)

    history = csx_study.extract_history_items(study)

    graph_type = [
        entry
        for entry in study["history"]
        if entry["item_id"] == ObjectId(history_item_id)
    ][0]["graph_type"]

    return {
        "graph": history_item[graph_type],
        "name": study["study_name"],
        "description": study["study_description"],
        "author": study["study_author"] if "study_author" in study else "",
        "history": history,
        "index": study["index"],
        "charts": charts,
        "empty": False,
        "public": study["public"],
        "public_url": study["public_url"],
    }


class ModifyStudyData(BaseModel):
    history_item_id: str
    graph_type: Literal["overview", "detail"]
    graph_schema: List
    visible_dimensions: List
    visible_entries: List
    index: str
    query: str
    anchor: str
    search_uuid: Union[str, None]
    links: List
    anchor_properties: List
    action_time: str
    history_parent_id: Union[str, None]
    charts: List


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_history_item(
    data: ModifyStudyData,
    study_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    history_item_id = data.history_item_id
    query = data.query
    search_uuid = data.search_uuid
    visible_dimensions = data.visible_dimensions
    schema = data.graph_schema
    index = data.index
    anchor = data.anchor
    links = data.links
    graph_type = data.graph_type
    visible_entries = data.visible_entries
    anchor_properties = data.anchor_properties
    action_time = data.action_time
    history_parent_id = data.history_parent_id
    charts = data.charts

    """Run search using given query."""
    if history_item_id == "":
        cache_data = {}
        csx_study.add_index(study_id, user_id, index)
        graph_type_changed = False
    else:
        cache_data = storage.get_history_item(history_item_id)
        study = csx_study.get_study(user_id, study_id)
        if not study:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
            )

        graph_type_changed = [
            entry
            for entry in study["history"]
            if entry["item_id"] == ObjectId(history_parent_id)
        ][0]["graph_type"] != graph_type

    with open(f"./app/data/config/{index}.json") as config:
        config = json.load(config)

        dimension_types = config["dimension_types"]

        if len(schema) == 0:
            schema = config["schemas"][0]["relations"]

        if len(visible_dimensions) == 0:
            visible_dimensions = config["default_visible_dimensions"]

        default_search_fields = config["default_search_fields"]

        if anchor == "":
            anchor = config["anchor"]

        if not links:
            links = config["links"]

    search = Search(using=es, index=index)
    search = search[0:10000]

    id_list = visible_entries
    query_generated_dimensions = {}

    if len(id_list):
        results = convert_filter_res_to_df(
            search.filter("terms", _id=id_list).execute()
        )
    elif not isJson(query) or isNumber(query):
        filtered_fields = default_search_fields

        if not isNumber(query):
            filtered_fields = [
                field
                for field in filtered_fields
                if dimension_types[field] not in ["integer", "float"]
            ]

        es_query = Q(
            "query_string",
            query=csx_es.convert_to_elastic_safe_query(f"{query}"),
            type="phrase",
            fields=filtered_fields,
        )
        results = csx_es.query_to_dataframe(es_query, index)
    else:
        query_generated_dimensions = {
            entry["feature"]: entry["type"]
            for entry in get_new_features(json.loads(query))
        }

        results = csx_es.run_advanced_query(json.loads(query), index, dimension_types)

    if len(results.index) == 0:
        return {"nodes": []}

    elastic_json = json.loads(results.to_json(orient="records"))

    dimensions = {
        "links": links,
        "anchor": {"dimension": anchor, "props": anchor_properties},
        "visible": visible_dimensions,
        "query_generated": query_generated_dimensions,
        "all": [
            property
            for property in csx_es.get_index(index)[index]["mappings"]["properties"]
        ],
    }

    current_dimensions = visible_dimensions

    if graph_type == "overview":
        current_dimensions = links + [anchor]

    comparison_res = csx_study.compare_instances(
        cache_data,
        {
            "index": index,
            "search_uuid": search_uuid,
            "query": query,
            "schema": schema,
            "dimensions": current_dimensions,
            "anchor_properties": anchor_properties,
            "graph_type_changed": graph_type_changed,
        },
        graph_type,
    )

    comparison_switch = {
        "from_scratch": lambda: csx_graph.get_graph_from_scratch(
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
            comparison_res["history_action"],
            history_parent_id,
            charts,
        ),
        "from_anchor_properties": lambda: csx_graph.get_graph_with_new_anchor_props(
            comparison_res,
            graph_type,
            dimensions,
            elastic_json,
            user_id,
            study_id,
            comparison_res["action"],
            query,
            index,
            action_time,
            comparison_res["history_action"],
            schema,
            anchor_properties,
            history_parent_id,
            cache_data,
            charts,
        ),
        "from_existing_data": lambda: csx_graph.get_graph_from_existing_data(
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
            comparison_res["action"],
            query,
            action_time,
            comparison_res["history_action"],
            history_parent_id,
            charts,
        ),
        "from_cache": lambda: csx_graph.get_graph_from_cache(
            comparison_res,
            graph_type,
            study_id,
            comparison_res["action"],
            query,
            user_id,
            index,
            action_time,
            comparison_res["history_action"],
            schema,
            anchor_properties,
            dimensions,
            history_parent_id,
            charts,
        ),
    }

    graph = comparison_switch[comparison_res["action"]]()

    study = csx_study.get_study(user_id, study_id)

    return {
        "graph": graph,
        "history": csx_study.extract_history_items(study),
    }


class UpdateCharts(BaseModel):
    charts: List


@router.put("/{history_item_id}")
def update_history_item(
    study_id: str,
    history_item_id: str,
    data: UpdateCharts,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    storage.update_history_item_charts(study_id, user_id, history_item_id, data.charts)

    return Response(status_code=status.HTTP_200_OK)


class ExpandNodes(BaseModel):
    values: dict
    graph_type: str
    anchor: str
    visible_entries: List
    anchor_properties: List
    graph_schema: List
    visible_dimensions: List
    links: List
    action_time: str
    history_parent_id: str
    charts: List


@router.put("/{history_item_id}/nodes/expand")
def expand_nodes(
    data: ExpandNodes,
    study_id: str,
    history_item_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    cache_data = storage.get_history_item(history_item_id)
    last_history_item = csx_study.load_last_history_item(study_id, user_id)

    values = data.values
    graph_type = data.graph_type
    anchor_properties = data.anchor_properties
    schema = data.graph_schema
    visible_dimensions = data.visible_dimensions
    anchor = data.anchor
    links = data.links
    action_time = data.action_time
    history_parent_id = data.history_parent_id
    charts = data.charts

    if len(values["nodes"]) == 1:
        query = {
            "action": "visualise",
            "query": {
                "action": "search",
                "feature": values["nodes"][0]["feature"],
                "keyphrase": values["nodes"][0]["value"],
            },
        }
    else:
        atomic_queries = [
            {
                "action": "search",
                "feature": entry["feature"],
                "keyphrase": entry["value"],
            }
            for entry in values["nodes"]
        ]

        query = {
            "action": "visualise",
            "query": {
                "action": "connect",
                "connector": values["connector"],
                "queries": atomic_queries,
            },
        }

    dimension_types = {}

    with open(f"./app/data/config/{cache_data['global']['index']}.json") as config:
        config = json.load(config)

        dimension_types = config["dimension_types"]

    index = cache_data["global"]["index"]

    with open(f"./app/data/config/{index}.json") as config:
        config = json.load(config)

        dimension_types = config["dimension_types"]

        if len(schema) == 0:
            schema = config["schemas"][0]["relations"]

        if len(visible_dimensions) == 0:
            visible_dimensions = config["default_visible_dimensions"]

        if anchor == "":
            anchor = config["anchor"]

        if not links:
            links = config["links"]

    results = csx_es.run_advanced_query(
        query, cache_data["global"]["index"], dimension_types
    )

    elastic_json = cache_data["global"]["elastic_json"]
    new_elastic_json = json.loads(results.to_json(orient="records"))

    entries = list(set([row["entry"] for row in elastic_json]))

    elastic_json = elastic_json + [
        row for row in new_elastic_json if row["entry"] not in entries
    ]

    results = pd.concat(
        [
            pd.read_json(cache_data["global"]["results_df"]),
            results[~results["entry"].isin(entries)],
        ]
    ).reset_index(drop=True)

    dimensions = {
        "links": links,
        "anchor": {"dimension": anchor, "props": anchor_properties},
        "visible": visible_dimensions,
        "query_generated": {},
        "all": [
            property
            for property in csx_es.get_index(index)[index]["mappings"]["properties"]
        ],
    }

    history_action = "expand"

    if values["connector"] == "or":
        history_action = "wide expand"
    elif values["connector"] == "and":
        history_action = "narrow expand"

    graph = csx_graph.get_graph_from_scratch(
        graph_type,
        dimensions,
        elastic_json,
        [],
        index,
        cache_data,
        cache_data["global"]["search_uuid"],
        results,
        user_id,
        schema,
        anchor_properties,
        {"difference": "search_uuid"},
        study_id,
        last_history_item["query"],
        action_time,
        history_action,
        history_parent_id,
        charts,
    )

    study = csx_study.get_study(user_id, study_id)

    return {
        "graph": graph,
        "history": csx_study.extract_history_items(study),
    }


class DeleteNodes(BaseModel):
    nodes: List[str]
    delete_type: str
    action_time: str
    graph_type: str
    charts: List
    history_parent_id: str


@router.put("/{history_item_id}/nodes/delete")
def delete_nodes(
    data: DeleteNodes,
    study_id: str,
    history_item_id: str,
    user_id: str = Depends(verify_user_exists),
    storage: BaseStorageConnector = Depends(get_storage_connector),
):
    cache_data = storage.get_history_item(history_item_id)

    entry_list = [
        node["entries"]
        for node in cache_data[data.graph_type]["nodes"]
        if node["id"] in data.nodes
    ]

    entries = list(set([entry for entries in entry_list for entry in entries]))

    cache_data = calculate_global_cache_properties(cache_data, entries)

    if data.graph_type == "overview":
        cache_data = csx_graph.calculate_trimmed_graph(cache_data, entries, "overview")
        if cache_data["detail"] != {}:
            cache_data = csx_graph.calculate_trimmed_graph(
                cache_data, entries, "detail"
            )
    else:
        cache_data = csx_graph.calculate_trimmed_graph(cache_data, entries, "detail")
        if cache_data["overview"] != {}:
            cache_data = csx_graph.calculate_trimmed_graph(
                cache_data, entries, "overview"
            )

    last_history_item = csx_study.load_last_history_item(study_id, user_id)

    csx_study.new_history_entry(
        study_id,
        user_id,
        {
            "action": f"{data.delete_type} nodes",
            "graph_type": data.graph_type,
            "graph_data": pickle.dumps(cache_data),
            "query": last_history_item["query"],
            "action_time": data.action_time,
            "schema": last_history_item["schema"],
            "anchor_properties": last_history_item["anchor_properties"],
            "anchor": last_history_item["anchor"],
            "links": last_history_item["links"],
            "visible_dimensions": last_history_item["visible_dimensions"],
            "history_parent_id": data.history_parent_id,
            "charts": data.charts,
            "edge_count": len(cache_data[data.graph_type]["edges"]),
            "node_count": len(cache_data[data.graph_type]["nodes"]),
        },
    )

    study = csx_study.get_study(user_id, study_id)

    return {
        "graph": cache_data[data.graph_type],
        "history": csx_study.extract_history_items(study),
    }


def calculate_global_cache_properties(cache_data, entries):
    # Filter table data to include only entries necessary
    cache_data["global"]["table_data"] = [
        data for data in cache_data["global"]["table_data"] if data["entry"] in entries
    ]

    # Filter tabular data by entries
    tabular_data_df = pd.read_json(cache_data["global"]["results_df"])

    cache_data["global"]["results_df"] = tabular_data_df[
        tabular_data_df["entry"].isin(entries)
    ].to_json()

    cache_data["global"]["elastic_json"] = [
        data
        for data in cache_data["global"]["elastic_json"]
        if data["entry"] in entries
    ]

    return cache_data


def convert_filter_res_to_df(results):
    elastic_list = []
    for entry in results["hits"]["hits"]:
        entry_dict = entry["_source"].to_dict()
        entry_dict["entry"] = entry["_id"]
        elastic_list.append(entry_dict)

    return pd.DataFrame(elastic_list)


def get_new_features(query):
    if query["action"] == "connect":
        return list(
            itertools.chain.from_iterable(
                [get_new_features(entry) for entry in query["queries"]]
            )
        )

    if "newFeatureName" in query.keys():
        if query["action"] == "count array":
            return [{"feature": query["newFeatureName"], "type": "integer"}] + list(
                itertools.chain.from_iterable(get_new_features(query["query"]))
            )
        elif query["action"] == "extract keywords":
            return [{"feature": query["newFeatureName"], "type": "list"}] + list(
                itertools.chain.from_iterable(get_new_features(query["query"]))
            )

    if "query" not in query and "queries" not in query:
        return []

    return list(
        itertools.chain.from_iterable(filter(None, get_new_features(query["query"])))
    )