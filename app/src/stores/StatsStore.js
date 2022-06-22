import { makeAutoObservable } from 'mobx';
import { interpolateRainbow, schemeTableau10 } from 'd3-scale-chromatic';
import { v4 as uuidv4 } from 'uuid';

export class StatsStore {
    isStatsModalVisible = false;
    chartTypes = ['Doughnut', 'Bar', 'Line', 'Vertical Bar', 'Grouped Bar'];
    newChartProps = {
        type: 'doughnut',
        network_data: 'all',
        elements: 'nodes',
        element_values: 'values',
        display_limit: 'all',
        group_by: 'types'
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
            network_data: 'all',
            elements: 'nodes',
            element_values: 'values',
            display_limit: 'all',
            group_by: 'types'
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

    changeChartElementDisplayLimit = val => {
        this.newChartProps.display_limit = val;
    };

    changeChartGroupByValues = val => {
        this.newChartProps.group_by = val;
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

    getBarChartData = (labels, data, label) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data,
                    backgroundColor: '#3182ce',
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getLineChartData = (labels, data, label) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data,
                    backgroundColor: '#3182ce',
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getDoughnutChartData = (labels, data, label) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data,
                    backgroundColor: this.getGraphColors(labels),
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getEdgeValueCounts = (chartType, display_limit) => {
        let values = [];
        let counts = [];

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

        if (display_limit > 0) {
            values = values.slice(0, display_limit);
            counts = counts.slice(0, display_limit);
        }

        if (display_limit < 0) {
            values = values.slice(display_limit);
            counts = counts.slice(0, display_limit);
        }

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts, 'counts');
            case 'line':
                return this.getLineChartData(values, counts, 'counts');
            default:
                return this.getDoughnutChartData(values, counts, 'counts');
        }
    };

    getEdgeWeightCounts = (chartType, display_limit) => {
        let values = [];
        let counts = [];

        this.store.graph.currentGraphData.links.forEach(link => {
            const labelLocation = values.indexOf(`Edge weight ${link.weight}`);

            if (labelLocation >= 0) {
                counts[labelLocation] += 1;
            } else {
                values.push(`Edge weight ${link.weight}`);
                counts.push(1);
            }
        });

        if (display_limit > 0) {
            values = values.slice(0, display_limit);
            counts = counts.slice(0, display_limit);
        }

        if (display_limit < 0) {
            values = values.slice(display_limit);
            counts = counts.slice(0, display_limit);
        }

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts, 'counts');
            case 'line':
                return this.getLineChartData(values, counts, 'counts');
            default:
                return this.getDoughnutChartData(values, counts, 'counts');
        }
    };

    getEdgeFeatureCounts = (chartType, display_limit) => {
        let values = [];
        let counts = [];

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

        if (display_limit > 0) {
            values = values.slice(0, display_limit);
            counts = counts.slice(0, display_limit);
        }

        if (display_limit < 0) {
            values = values.slice(display_limit);
            counts = counts.slice(0, display_limit);
        }

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts, 'counts');
            case 'line':
                return this.getLineChartData(values, counts, 'counts');
            default:
                return this.getDoughnutChartData(values, counts, 'counts');
        }
    };

    getNodeValueCounts = (chartType, display_limit) => {
        let values = [];
        let counts = [];

        this.store.graph.currentGraphData.nodes.forEach(node => {
            const labelLocation = values.indexOf(node.label);

            if (labelLocation >= 0) {
                counts[labelLocation] += 1;
            } else {
                values.push(node.label);
                counts.push(1);
            }
        });

        if (display_limit > 0) {
            values = values.slice(0, display_limit);
            counts = counts.slice(0, display_limit);
        }

        if (display_limit < 0) {
            values = values.slice(display_limit);
            counts = counts.slice(0, display_limit);
        }

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts, 'counts');
            case 'line':
                return this.getLineChartData(values, counts, 'counts');
            default:
                return this.getDoughnutChartData(values, counts, 'counts');
        }
    };

    getNodeFeatureCounts = (chartType, display_limit) => {
        let values = [];
        let counts = [];

        this.store.graph.currentGraphData.nodes.forEach(node => {
            const labelLocation = values.indexOf(node.feature);

            if (labelLocation >= 0) {
                counts[labelLocation] += 1;
            } else {
                values.push(node.feature);
                counts.push(1);
            }
        });

        if (display_limit > 0) {
            values = values.slice(0, display_limit);
            counts = counts.slice(0, display_limit);
        }

        if (display_limit < 0) {
            values = values.slice(display_limit);
            counts = counts.slice(0, display_limit);
        }

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(values, counts, 'counts');
            case 'line':
                return this.getLineChartData(values, counts, 'counts');
            default:
                return this.getDoughnutChartData(values, counts, 'counts');
        }
    };

    getNodePropertyCounts = (chartType, property, display_limit) => {
        let values = [];
        const counts = [];
        const valuesSorted = [];
        const countsSorted = [];

        this.store.graph.currentGraphData.nodes.forEach(node => {
            const labelLocation = values.indexOf(node.properties[property]);

            if (labelLocation >= 0) {
                counts[labelLocation] += 1;
            } else {
                values.push(node.properties[property]);
                counts.push(1);
            }
        });

        values = values
            .map((val, index) => {
                return { value: val, counts: counts[index] };
            })
            .sort((first, second) => {
                if (first.counts > second.counts) {
                    return -1;
                } else if (first.counts < second.counts) {
                    return 1;
                } else {
                    return 0;
                }
            });

        if (display_limit > 0) {
            values = values.slice(0, display_limit);
        }

        if (display_limit < 0) {
            values = values.slice(display_limit);
        }

        values.forEach(entry => {
            valuesSorted.push(entry.value);
            countsSorted.push(entry.counts);
        });

        switch (chartType) {
            case 'bar':
                return this.getBarChartData(
                    valuesSorted,
                    countsSorted,
                    'counts'
                );
            case 'line':
                return this.getLineChartData(
                    valuesSorted,
                    countsSorted,
                    'counts'
                );
            default:
                return this.getDoughnutChartData(
                    valuesSorted,
                    countsSorted,
                    'counts'
                );
        }
    };
}
