import pickle

import app.services.data.mongo as csx_data
from bson import ObjectId


def store_history_entry(entry):
    return csx_data.insert_document("history", entry)


def new_history_entry(study_id, user_id, data):
    insert_response = store_history_entry({"data": data["graph_data"]})

    csx_data.update_document(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        {
            "$push": {
                "history": {
                    "item_id": insert_response.inserted_id,
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
                }
            }
        },
    )


def load_cache_data_from_histroy(history_item_id):
    last_history_item = list(
        csx_data.get_all_documents_by_conditions(
            "history",
            {"_id": ObjectId(history_item_id)},
            {"_id": 0},
        )
    )[0]

    return pickle.loads(last_history_item["data"])


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
    return list(
        csx_data.get_all_documents_by_conditions(
            "studies",
            {"$and": [{"user_uuid": user_id}, {"study_uuid": study_id}]},
            {"_id": 0},
        )
    )[0]


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
    history_item_index: int,
    comment: str,
    comment_time: str,
):

    csx_data.update_document(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        {
            "$push": {
                f"history.{history_item_index}.comments": {
                    "comment": comment,
                    "time": comment_time,
                }
            }
        },
    )


def delete_comment(
    study_id: str, user_id: str, history_item_index: int, comment_index: int
):
    csx_data.delete_from_array(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        f"history.{history_item_index}.comments",
        comment_index,
    )


def edit_comment(
    study_id: str,
    user_id: str,
    history_item_index: int,
    comment_index: int,
    comment: str,
):
    csx_data.edit_array(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        f"history.{history_item_index}.comments",
        comment_index,
        comment,
    )
