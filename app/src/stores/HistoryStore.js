import { makeAutoObservable } from 'mobx';
import { MarkerType } from 'react-flow-renderer';

export class HistoryStore {
    nodes = [];
    edges = [];

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
                    action: historyItem.action,
                    graphType: historyItem.graph_type,
                    comment: historyItem.comment,
                    actionTime: historyItem.action_time
                },
                position: { x: 50, y: index * 150 + 150 },
                targetPosition: 'top',
                sourcePosition: 'bottom',
                style: {
                    background:
                        this.store.core.studyHistoryItemIndex === index
                            ? '#3182ceeb'
                            : '#000000eb',
                    borderRadius: '6px',
                    height: '100px',
                    width: '200px'
                }
            };

            this.nodes.push(historyNode);
        });

        for (let i = 1; i < this.nodes.length; i++) {
            this.edges.push({
                id: `${this.nodes[i - 1].id}${this.nodes[i].id}`,
                source: `${this.nodes[i - 1].id}`,
                target: `${this.nodes[i].id}`,
                data: {},
                markerEnd: {
                    type: MarkerType.ArrowClosed
                }
            });
        }
    };
}
