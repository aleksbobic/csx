import { makeAutoObservable } from 'mobx';

export class ContextMenuStore {
    isVisible = false;
    originNode = null;
    x = 0;
    y = 0;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    hideContextMenu = () => {
        this.originNode = null;
        this.isVisible = false;
    };

    showContextMenu = (node, x, y) => {
        this.x = window.innerWidth - x < 200 ? `${x - 200}px` : `${x}px`;
        this.y = window.innerHeight - y < 108 ? `${y - 64}px` : `${y}px`;
        this.originNode = node;
        this.isVisible = true;
    };
}
