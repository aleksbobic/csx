import { makeAutoObservable } from 'mobx';
import { MarkerType } from 'react-flow-renderer';
import { format } from 'date-fns';
import dagre from 'dagre';
import axios from 'axios';

export class HistoryStore {
    nodes = [];
    edges = [];
    nodeHeight = 100;
    nodeWidth = 200;
    commentTrigger = true;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    getNodeTitle = comments => {
        let title;
        const re = new RegExp('^#{1,6} .*');

        if (comments.length) {
            const filteredComments = comments.filter(entry =>
                entry.comment.includes('#')
            );

            for (let i = 0; i < filteredComments.length; i++) {
                const regexMatches = re.exec(filteredComments[i].comment);
                if (regexMatches) {
                    title = regexMatches[0].replaceAll('#', '').trim();
                    break;
                }
            }
        }

        return title;
    };

    setCommentTrigger = val => (this.commentTrigger = val);

    generateHistoryNodes = () => {
        this.nodes = [];
        this.edges = [];

        this.store.core.studyHistory.forEach((historyItem, index) => {
            const historyNode = {
                id: `${historyItem.id}`,
                type: 'historyNode',
                data: {
                    parent: historyItem.parent_id,
                    title: this.getNodeTitle(historyItem.comments),
                    action: historyItem.action,
                    graphType: historyItem.graph_type,
                    comments: historyItem.comments,
                    actionTime: historyItem.action_time,
                    isActive: this.store.core.studyHistoryItemIndex === index,
                    loadStudy: this.loadStudy,
                    deleteNode: this.deleteNode
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
                label: this.nodes[i].data.action,
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

    addComment = async comment => {
        const comment_time = format(new Date(), 'H:mm do MMM yyyy OOOO');

        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_index: this.store.core.studyHistoryItemIndex,
            comment: comment,
            comment_time: comment_time
        };

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments.push({ comment: comment, time: comment_time });

        const response = await axios.post('history/comment', params);
        this.generateHistoryNodes();
    };

    deleteCommnet = async index => {
        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_index: this.store.core.studyHistoryItemIndex,
            comment_index: index
        };

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments.splice(index, 1);

        const response = await axios.post('history/deletecomment', params);
        this.generateHistoryNodes();
    };

    editComment = async (comment, index) => {
        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_index: this.store.core.studyHistoryItemIndex,
            comment_index: index,
            comment: comment
        };

        this.store.core.studyHistory[
            this.store.core.studyHistoryItemIndex
        ].comments[index].comment = comment;

        const response = await axios.post('history/editcomment', params);

        this.generateHistoryNodes();
    };

    getAllChildNodes = id => {
        const currentNode = this.nodes.find(node => node.id === id);
        const currentNodeChildren = this.nodes.filter(
            node => node.data.parent === id
        );

        if (currentNodeChildren.length) {
            return [
                currentNode.id,
                ...currentNodeChildren.map(childNode =>
                    this.getAllChildNodes(childNode.id)
                )
            ].flat();
        } else {
            return [currentNode.id];
        }
    };

    deleteNode = async id => {
        const deleteNodeIDs = this.getAllChildNodes(id);

        const params = {
            study_uuid: this.store.core.studyUuid,
            user_uuid: this.store.core.userUuid,
            history_item_indexes: deleteNodeIDs
        };

        const response = await axios.post('history/delete', params);

        const deletedNodeParent = this.nodes.find(node => node.id === id).data
            .parent;

        this.store.core.setStudyHistoryItemIndex(
            this.store.core.studyHistory.findIndex(
                entry => entry.id === deletedNodeParent
            )
        );

        this.store.core.setStudyHistory(
            this.store.core.studyHistory.filter(
                entry => !deleteNodeIDs.includes(entry.id)
            )
        );

        this.generateHistoryNodes();
        this.loadStudy(deletedNodeParent);
    };
}
