from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel


class HistoryItemConfigData(BaseModel):
    history_item_id: str
    graph_type: Literal["overview", "detail"]
    graph_schema: List
    visible_dimensions: List
    visible_entries: List
    index: str
    query: str
    anchor: str
    search_uuid: Optional[Union[str, None]]
    links: List
    anchor_properties: List
    action_time: str
    history_parent_id: Optional[Union[str, None]]
    charts: List
    page: Optional[int]


class UpdateChartsData(BaseModel):
    charts: List[Dict]


class ExpandNodesData(BaseModel):
    values: dict
    graph_type: str
    anchor: str
    visible_entries: List
    anchor_properties: List
    links: List
    action_time: str
    history_parent_id: str
    charts: List
    preserve_context: bool
    page: Optional[int]


class DeleteNodesData(BaseModel):
    nodes: List[str]
    delete_type: str
    action_time: str
    graph_type: str
    charts: List
    history_parent_id: str
