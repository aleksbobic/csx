from typing import Optional, Union

from pydantic import BaseModel


class StudyCreate(BaseModel):
    study_name: str


class StudyUpdate(BaseModel):
    study_name: Optional[str]
    study_description: Optional[str]
    study_author: Optional[Union[str, None]]
    public: Optional[bool]


class Study(BaseModel):
    study_name: str
    study_description: str
    study_author: str
    public: bool
    graph: dict
    history: list
    index: str
    charts: list
    empty: bool
    public_url: str
