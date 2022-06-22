import { makeAutoObservable } from 'mobx';
import { interpolateRainbow, schemeTableau10 } from 'd3-scale-chromatic';
import { v4 as uuidv4 } from 'uuid';

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

    changeChartElementValue = val => {
        this.newChartProps.element_values = val;
    };

    getElementValues = () => {
        if (this.newChartProps.elements === 'nodes') {
            return [
                { value: 'values', label: 'Node values' },
                { value: 'types', label: 'Node types' }
            ].concat(
                this.store.schema.overviewDataNodeProperties.map(entry => {
                    return {
                        value: entry,
                        label: entry.charAt(0).toUpperCase() + entry.slice(1)
                    };
                })
            );
        }

        return [
            { value: 'values', label: 'Edge values' },
            { value: 'types', label: 'Edge types' },
            { value: 'weight', label: 'Edge weights' }
        ];
    };

    addChart = () => {
        const dataset = this.store.search.currentDataset;

        if (Object.keys(this.charts).includes(dataset)) {
            this.charts[dataset].push({
                ...this.newChartProps,
                id: uuidv4(),
                colSpan: 1,
                height: '200px'
            });
        } else {
            this.charts[dataset] = [
                {
                    ...this.newChartProps,
                    id: uuidv4(),
                    colSpan: 1,
                    height: '200px'
                }
            ];
        }

        this.toggleStatsModalVisiblity(false);
    };

    removeChart = id => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].filter(
            chart => chart.id !== id
        );
    };

    expandChart = id => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].map(chart => {
            if (chart.id !== id) {
                return chart;
            }

            return { ...chart, colSpan: 2, height: '400px' };
        });
    };

    shrinkChart = id => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].map(chart => {
            if (chart.id !== id) {
                return chart;
            }

            return { ...chart, colSpan: 1, height: '200px' };
        });
    };

    getChartListForDataset = () => {
        const dataset = this.store.search.currentDataset;
        if (Object.keys(this.charts).includes(dataset)) {
            return this.charts[dataset];
        }
        return [];
    };

    // Each element has connections which are an array of elements
    // Each element has has a feature and a label property
    // Each edge has a weight

    getBarChartData = (labels, data) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: 'node values',
                    data: data,
                    backgroundColor: '#3182ce',
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getLineChartData = (labels, data) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: 'node values',
                    data: data,
                    backgroundColor: '#3182ce',
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getDoughnutChartData = (labels, data) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: 'node values',
                    data: data,
                    backgroundColor: this.getGraphColors(labels),
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getEdgeValueCounts = chartType => {
        const values = [];
        const counts = [];

        this.store.graph.currentGraphData.links.forEach(link => {
            link.connections.forEach(connection => {
                const labelLocation = values.indexOf(connection.label);

                if (labelLocation >= 0) {
                    counts[labelLocation] += 1;
                } else {
                    values.push(connection.label);
                    counts.push(1);
                }
            });
        });

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts);
            default:
                return this.getDoughnutChartData(values, counts);
        }
    };

    getEdgeWeightCounts = chartType => {
        const values = [];
        const counts = [];

        this.store.graph.currentGraphData.links.forEach(link => {
            const labelLocation = values.indexOf(`Edge weight ${link.weight}`);

            if (labelLocation >= 0) {
                counts[labelLocation] += 1;
            } else {
                values.push(`Edge weight ${link.weight}`);
                counts.push(1);
            }
        });

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts);
            default:
                return this.getDoughnutChartData(values, counts);
        }
    };

    getEdgeFeatureCounts = chartType => {
        const values = [];
        const counts = [];

        this.store.graph.currentGraphData.links.forEach(link => {
            link.connections.forEach(connection => {
                const labelLocation = values.indexOf(connection.feature);

                if (labelLocation >= 0) {
                    counts[labelLocation] += 1;
                } else {
                    values.push(connection.feature);
                    counts.push(1);
                }
            });
        });

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts);
            case 'line':
                return this.getLineChartData(values, counts);
            default:
                return this.getDoughnutChartData(values, counts);
        }
    };
}
