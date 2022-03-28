import uuid

from fastapi import APIRouter

router = APIRouter()


@router.get("/uuid")
def get_uuid() -> str:
    return uuid.uuid4().hex
