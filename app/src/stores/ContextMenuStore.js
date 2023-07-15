import { makeAutoObservable } from 'mobx';

const CONTEXT_TYPES = {
    NODE: 'node',
    CANVAS: 'canvas',
    NODE_DETAILS: 'node_details'
};

export class ContextMenuStore {
    isVisible = false;
    contextType = null;
    originNode = null;
    xOffset = 0;

    x = 0;
    y = 0;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setXOffset = val => (this.xOffset = val);

    hideContextMenu = () => {
        this.originNode = null;
        this.isVisible = false;
        this.contextType = null;
    };

    setContextType = type => (this.contextType = type);

    showNodeDetails = (node, x, y) => {
        this.setContextType(CONTEXT_TYPES.NODE_DETAILS);
        this.x =
            window.innerWidth - this.xOffset - x < 200
                ? `${x - 200 - node.size}px`
                : `${x + node.size}px`;

        this.y =
            window.innerHeight - y < 300
                ? `${y - 210 - node.size}px`
                : `${y - node.size}px`;
        this.originNode = node;
        this.isVisible = true;
    };

    showContextMenu = (node, x, y) => {
        this.setContextType(CONTEXT_TYPES.NODE);
        this.x =
            window.innerWidth - this.xOffset - x < 200
                ? `${x - 200}px`
                : `${x}px`;
        this.y = window.innerHeight - y < 138 ? `${y - 138}px` : `${y}px`;
        this.originNode = node;
        this.isVisible = true;
    };

    showCanvasContextMenu = (x, y) => {
        this.setContextType(CONTEXT_TYPES.CANVAS);
        this.x =
            window.innerWidth - this.xOffset - x < 200
                ? `${x - 200}px`
                : `${x}px`;
        this.y = window.innerHeight - y < 350 ? `${y - 332}px` : `${y}px`;
        this.isVisible = true;
    };
}
