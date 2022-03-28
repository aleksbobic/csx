import { makeAutoObservable } from 'mobx';

export class DataPanelStore {
    isVisible = false;

    tableColumns = [
        { Header: 'Node', accessor: 'label' },
        { Header: 'Type', accessor: 'attribute' },
        { Header: 'Rows', accessor: 'reference_count' },
        { Header: 'Color', accessor: 'color', disableSortBy: true },
        { Header: 'id', accessor: 'id', disableSortBy: true }
    ];

    hiddenColumns = ['id', 'color', 'reference_count'];

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    toggleVisiblity = () => {
        this.isVisible = !this.isVisible;
    };

    getHiddenTableColumns = () => {
        const hiddenColumns = {};
        for (
            let i = 0;
            i < this.store.graph.currentGraphData.activeTableData.length;
            i++
        ) {
            const keys = Object.keys(
                this.store.graph.currentGraphData.activeTableData[i]
            ).filter(key => key.endsWith('_id'));

            for (let j = 0; j < keys.length; j++) {
                hiddenColumns[keys[j]] =
                    this.store.graph.currentGraphData.activeTableData[i][
                        keys[j]
                    ];
            }
        }

        return hiddenColumns;
    };

    getTableColumns = () => {
        const visible_columns =
            this.store.graph.currentGraphData.perspectivesInGraph.map(
                perspective => {
                    return {
                        Header: perspective.toUpperCase(),
                        accessor: perspective
                    };
                }
            );

        return visible_columns;
    };
}
