import app.services.storage.mongo as csx_data
from bson import ObjectId


def delete_history_item(study_id, user_id, history_item_ids):
    study_entry = list(
        csx_data.get_all_documents_by_conditions(
            "studies",
            {"$and": [{"study_uuid": study_id}, {"user_uuid": user_id}]},
            {"_id": 0},
        )
    )[0]

    for item_id in history_item_ids:
        csx_data.delete_large_document(ObjectId(item_id))

    csx_data.update_document(
        "studies",
        {"study_uuid": study_id, "user_uuid": user_id},
        {
            "$set": {
                "history": [
                    entry
                    for entry in study_entry["history"]
                    if str(entry["item_id"]) not in history_item_ids
                ]
            }
        },
    )
