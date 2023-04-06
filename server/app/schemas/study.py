from typing import Optional, Union

from pydantic import BaseModel


class StudyCreate(BaseModel):
    study_name: str


class StudyUpdate(BaseModel):
    study_name: Optional[str]
    study_description: Optional[str]
    study_author: Optional[Union[str, None]]
    public: Optional[bool]


class StudyDelete(BaseModel):
    user_trigger: bool


class Study(BaseModel):
    graph: dict
    name: str
    description: str
    author: str
    history: list
    index: str
    charts: list
    empty: bool
    public: bool
    public_url: str
