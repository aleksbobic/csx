from itertools import count
from typing import TypedDict, List, Optional, Literal, Tuple


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


class EnrichedEdgeTuple(TypedDict):
    label: str
    feature: str
    edge: Tuple[str, str]


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
