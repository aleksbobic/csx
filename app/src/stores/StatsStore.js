import { makeAutoObservable } from 'mobx';
import { interpolateRainbow, schemeTableau10 } from 'd3-scale-chromatic';

export class StatsStore {
    isStatsModalVisible = false;
    chartTypes = ['Doughnut', 'Bar', 'Line'];
    newChartProps = {
        type: 'doughnut',
        network_data: 'selection',
        elements: 'nodes',
        element_values: 'values'
    };

    charts = {};

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    toggleStatsModalVisiblity = val => {
        this.isStatsModalVisible = val;
    };

    getGraphColors = labels => {
        const skipfactor = labels.length > 10 ? 1 / labels.length : null;

        const graphColors = [];

        for (let i = 0; i < labels.length; i++) {
            graphColors.push(
                skipfactor
                    ? interpolateRainbow(i * skipfactor)
                    : schemeTableau10[i]
            );
        }

        return graphColors;
    };

    resetChartProps = () => {
        this.newChartProps = {
            type: 'doughnut',
            network_data: 'selection',
            elements: 'nodes',
            element_values: 'values'
        };
    };

    changeSelectedChartType = index => {
        this.newChartProps.type = this.chartTypes[index];
    };

    changeChartNetworkData = val => {
        this.newChartProps.network_data = val;
    };

    changeChartNetworkElements = val => {
        this.newChartProps.elements = val;
    };

    getElementValues = () => {
        if (this.newChartProps.elements === 'nodes') {
            return [{ value: 'value', label: 'Node values' }].concat(
                this.store.schema.overviewDataNodeProperties.map(entry => {
                    return {
                        value: entry,
                        label: entry.charAt(0).toUpperCase() + entry.slice(1)
                    };
                })
            );
        }

        return [
            { value: 'value', label: 'Edge values' },
            { value: 'weight', label: 'Edge weights' }
        ];
    };

    addChart = () => {
        const dataset = this.store.search.currentDataset;

        if (Object.keys(this.charts).includes(dataset)) {
            this.charts[dataset].push({ ...this.newChartProps });
        } else {
            this.charts[dataset] = [{ ...this.newChartProps }];
        }

        this.toggleStatsModalVisiblity(false);
    };

    getChartListForDataset = () => {
        const dataset = this.store.search.currentDataset;
        return this.charts[dataset];
    };
}
