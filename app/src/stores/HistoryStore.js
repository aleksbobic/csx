import { makeAutoObservable } from 'mobx';
import { MarkerType } from 'react-flow-renderer';
import dagre from 'dagre';

export class HistoryStore {
    nodes = [];
    edges = [];
    nodeHeight = 100;
    nodeWidth = 200;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    generateHistoryNodes = () => {
        this.nodes = [];
        this.edges = [];

        this.store.core.studyHistory.forEach((historyItem, index) => {
            const historyNode = {
                id: `${historyItem.id}`,
                type: 'historyNode',
                data: {
                    parent: historyItem.parent_id,
                    action: historyItem.action,
                    graphType: historyItem.graph_type,
                    comments: historyItem.comments,
                    actionTime: historyItem.action_time,
                    isActive: this.store.core.studyHistoryItemIndex === index,
                    loadStudy: this.loadStudy
                },
                position: {
                    x: 50,
                    y: index * 150 + 150
                },
                targetPosition: 'top',
                sourcePosition: 'bottom',
                style: {
                    background:
                        this.store.core.studyHistoryItemIndex === index
                            ? '#3182ceeb'
                            : '#000000eb',
                    borderRadius: '6px',
                    height: `${this.nodeHeight}px`,
                    width: `${this.nodeWidth}px`
                }
            };

            this.nodes.push(historyNode);
        });

        for (let i = 1; i < this.nodes.length; i++) {
            this.edges.push({
                id: `${this.nodes[i].data.parent}${this.nodes[i].id}`,
                source: `${this.nodes[i].data.parent}`,
                target: `${this.nodes[i].id}`,
                data: {},
                markerEnd: {
                    type: MarkerType.ArrowClosed
                }
            });
        }

        this.generateLayout();
    };

    loadStudy = historyID => {
        this.store.graph.getStudyFromHistory(
            this.store.core.studyUuid,
            historyID
        );
    };

    getLayoutedElements = (nodes, edges, direction = 'TB') => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const isHorizontal = direction === 'LR';
        dagreGraph.setGraph({ rankdir: direction });

        nodes.forEach(node => {
            dagreGraph.setNode(node.id, {
                width: this.nodeWidth,
                height: this.nodeHeight
            });
        });

        edges.forEach(edge => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        nodes.forEach(node => {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.targetPosition = isHorizontal ? 'left' : 'top';
            node.sourcePosition = isHorizontal ? 'right' : 'bottom';

            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            node.position = {
                x: nodeWithPosition.x - this.nodeWidth / 2,
                y: nodeWithPosition.y - this.nodeHeight / 2
            };

            return node;
        });

        return { nodes, edges };
    };

    generateLayout = () => {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
            this.getLayoutedElements(
                this.nodes,
                this.edges,
                'TB' // Vertical layout top -> bottom
            );

        this.nodes = [...layoutedNodes];
        this.edges = [...layoutedEdges];
    };

    addComment = comment => {
        console.log(comment);
    };
}
