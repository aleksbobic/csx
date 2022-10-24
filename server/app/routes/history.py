from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_item(study_uuid: str, item_uuid: str, uuid: str):
    return


@router.get("/insert")
def insert_item(study_uuid: str, item_uuid: str, uuid: str):
    return
