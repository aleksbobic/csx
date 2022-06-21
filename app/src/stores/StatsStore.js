import { makeAutoObservable } from 'mobx';

export class StatsStore {
    isStatsModalVisible = false;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    toggleStatsModalVisiblity = val => {
        this.isStatsModalVisible = val;
    };
}
