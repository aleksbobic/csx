from typing import Union
import uuid
import json
import pickle
import pandas as pd
from bson import ObjectId
import itertools
import os

from typing import List, Literal

from pydantic import BaseModel
import app.services.graph.graph as csx_graph
import app.services.data.mongo as csx_data
import app.services.data.elastic as csx_es
import app.services.study.study as csx_study
import app.services.data.redis as csx_redis

from elasticsearch import Elasticsearch
from elasticsearch_dsl import Q, Search

from fastapi import APIRouter
from app.utils.typecheck import isJson, isNumber

es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)

router = APIRouter()


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


class GetStudyData(BaseModel):
    study_uuid: str
    user_uuid: str
    history_id: Union[str, None]
    query: Union[str, None]
    user_id: Union[str, None]
    study_id: Union[str, None]
    search_uuid: Union[str, None]
    visible_dimensions: Union[List, None]
    graph_schema: Union[List, None]
    index: Union[str, None]
    anchor: Union[str, None]
    links: Union[List, None]
    graph_type: Union[Literal["overview", "detail"], None]
    visible_entries: Union[List, None]
    anchor_properties: Union[List, None]


@router.post("/")
def get_study(data: GetStudyData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
    history_entry_id = data.history_id

    study = csx_study.get_study(user_uuid, study_uuid)

    if len(study["history"]) > 0:
        if history_entry_id:
            history_id = [
                entry
                for entry in study["history"]
                if entry["item_id"] == ObjectId(history_entry_id)
            ][0]["item_id"]
        else:
            history_id = study["history"][len(study["history"]) - 1]["item_id"]

        history_item = list(
            csx_data.get_all_documents_by_conditions(
                "history",
                {"_id": history_id},
                {"_id": 0},
            )
        )[0]

        history = [
            {
                "id": str(item["item_id"]),
                "action": item["action"],
                "comments": item["comments"],
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
            }
            for item in study["history"]
        ]

        if history_entry_id:
            graph_type = [
                entry
                for entry in study["history"]
                if entry["item_id"] == ObjectId(history_entry_id)
            ][0]["graph_type"]
        else:
            graph_type = history[len(history) - 1]["graph_type"]

        return {
            "graph": pickle.loads(history_item["data"])[graph_type],
            "name": study["study_name"],
            "description": study["study_description"],
            "history": history,
            "index": study["index"],
        }

    return {
        "graph": {},
        "name": study["study_name"],
        "description": study["study_description"],
        "history": [],
        "index": study["index"],
    }


class ModifyStudyData(BaseModel):
    study_uuid: str
    user_uuid: str
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


@router.post("/modify")
def modify_study_graph(data: ModifyStudyData):
    study_uuid = data.study_uuid
    user_uuid = data.user_uuid
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

    """Run search using given query."""
    if history_item_id == "":
        cache_data = {}
        csx_study.add_index(study_uuid, user_uuid, index)
    else:
        cache_data = csx_study.load_cache_data_from_histroy(history_item_id)

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

    comparison_res = csx_redis.compare_instances(
        cache_data,
        {
            "index": index,
            "search_uuid": search_uuid,
            "query": query,
            "schema": schema,
            "dimensions": current_dimensions,
            "anchor_properties": anchor_properties,
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
            user_uuid,
            schema,
            anchor_properties,
            comparison_res,
            study_uuid,
            comparison_res["action"],
            query,
            action_time,
            comparison_res["history_action"],
            history_parent_id,
        ),
        "from_anchor_properties": lambda: csx_graph.get_graph_with_new_anchor_props(
            comparison_res,
            graph_type,
            dimensions,
            elastic_json,
            user_uuid,
            study_uuid,
            comparison_res["action"],
            query,
            index,
            action_time,
            comparison_res["history_action"],
            schema,
            anchor_properties,
            history_parent_id,
            cache_data,
        ),
        "from_existing_data": lambda: csx_graph.get_graph_from_existing_data(
            graph_type,
            dimensions,
            elastic_json,
            visible_entries,
            cache_data,
            user_uuid,
            schema,
            anchor_properties,
            index,
            study_uuid,
            comparison_res["action"],
            query,
            action_time,
            comparison_res["history_action"],
            history_parent_id,
        ),
        "from_cache": lambda: csx_graph.get_graph_from_cache(
            comparison_res,
            graph_type,
            study_uuid,
            comparison_res["action"],
            query,
            user_uuid,
            index,
            action_time,
            comparison_res["history_action"],
            schema,
            anchor_properties,
            dimensions,
            history_parent_id,
        ),
    }

    graph = comparison_switch[comparison_res["action"]]()

    study = csx_study.get_study(user_uuid, study_uuid)

    return {
        "graph": graph,
        "history": [
            {
                "id": str(item["item_id"]),
                "action": item["action"],
                "comments": item["comments"],
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
            }
            for item in study["history"]
        ],
    }


@router.get("/saved")
def get_studies(user_uuid: str):
    saved_studies = list(
        csx_data.get_all_documents_by_conditions(
            "studies", {"$and": [{"user_uuid": user_uuid}, {"saved": True}]}, {"_id": 0}
        )
    )

    return [
        {
            "study_uuid": study["study_uuid"],
            "study_description": study["study_description"],
            "study_name": study["study_name"],
        }
        for study in saved_studies
    ]


@router.get("/generate")
def generate_study(user_uuid: str, study_name: str) -> str:

    study_uuid = uuid.uuid4().hex
    csx_data.insert_document(
        "studies",
        {
            "study_uuid": study_uuid,
            "user_uuid": user_uuid,
            "study_name": study_name,
            "study_description": "",
            "saved": False,
            "index": "",
            "history": [],
        },
    )
    return study_uuid


@router.get("/update")
def update_study(
    study_uuid: str, user_uuid: str, study_name: str, study_description: str
):
    csx_data.update_document(
        "studies",
        {"study_uuid": study_uuid, "user_uuid": user_uuid},
        {
            "$set": {
                "study_name": study_name,
                "study_description": study_description,
                "saved": True,
            }
        },
    )
    return


@router.get("/save")
def save_study(study_uuid: str, user_uuid: str):
    csx_data.update_document(
        "studies",
        {"study_uuid": study_uuid, "user_uuid": user_uuid},
        {"$set": {"saved": True}},
    )
    return


@router.get("/delete")
def delete_study(study_uuid: str, user_uuid: str):

    study_entry = list(
        csx_data.get_all_documents_by_conditions(
            "studies",
            {"$and": [{"study_uuid": study_uuid}, {"user_uuid": user_uuid}]},
            {"_id": 0},
        )
    )

    if len(study_entry) > 0:
        history_ids = [item["item_id"] for item in study_entry[0]["history"]]

        csx_data.delete_documents("history", {"_id": {"$in": history_ids}})

    csx_data.delete_document(
        "studies", {"study_uuid": study_uuid, "user_uuid": user_uuid}
    )
    # TODO: Delete also history items if there are any
    return
