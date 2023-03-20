from fastapi import APIRouter
from pydantic import BaseModel

import app.services.data.autocomplete as csx_auto

router = APIRouter(prefix="/search", tags=["search"])


class SuggestionData(BaseModel):
    index: str
    feature: str
    input: str


@router.post("/suggest")
def get_suggestion(data: SuggestionData):
    return csx_auto.get_suggestions(data.index, data.input, data.feature)
