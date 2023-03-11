from itertools import count
from typing import TypedDict, List, Optional, Literal, Tuple, Dict, Union


class Node(TypedDict):
    entries: List[str]
    id: str
    label: str
    feature: str
    community: int
    component: int
    size: int
    x: Optional[int]
    y: Optional[int]
    properties: Optional[dict]
    neighbours: Optional[set]


CacheDifference = Literal[
    "data",
    "search_uuid",
    "query",
    "graph_type",
    "schema",
    "dimensions",
    "anchor_properties",
]

CacheDifferenceAction = Literal[
    "from_cache", "from_scratch", "from_existing_data", "from_anchor_properties"
]


class ComparisonResults(TypedDict):
    same: bool
    difference: Union[CacheDifference, None]
    action: CacheDifferenceAction
    data: Optional[Dict]
    history_action: str


SchemaRelationship = Literal["oneToOne", "manyToOne", "oneToMany", "manyToMany"]


class SchemaElement(TypedDict):
    dest: str
    src: str
    relationship: SchemaRelationship


class EdgeConnection(TypedDict):
    label: str
    feature: str


class Edge(TypedDict):
    id: str
    source: str
    target: str
    visible: bool
    weight: int
    component: Optional[int]
    connections: Optional[List[EdgeConnection]]


class Keyphrase(TypedDict):
    label: str
    type: str


class ConnectionCount(TypedDict):
    label: str
    feature: str
    count: int


class Component(TypedDict):
    id: int
    node_count: int
    largest_nodes: List[Node]
    largest_connections: List[ConnectionCount]
    entries: List[str]
    nodes: List[str]
