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
                    backgroundColor: this.getGraphColors(labels),
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getGroupedBarChartData = (labels, data, label) => {
        const datasets = [];

        Object.keys(data).forEach((group, index) => {
            datasets.push({
                label: group,
                data: data[group],
                backgroundColor: this.getGraphColors(labels)[index],
                borderColor: 'rgb(0,0,0)'
            });
        });

        return {
            labels: labels,
            datasets: datasets
        };
    };

    getLineChartData = (labels, data, label) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data,
                    backgroundColor: this.getGraphColors(labels),
                    borderColor: 'rgba(255,255,255,0.25)'
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

    getEdgeCounts = (edgeProperty, chartType, display_limit) => {
        let values = [];
        let counts = [];

        if (edgeProperty.type === 'basic') {
            this.store.graph.currentGraphData.links.forEach(link => {
                const labelLocation = values.indexOf(link[edgeProperty.prop]);

                if (labelLocation >= 0) {
                    counts[labelLocation] += 1;
                } else {
                    values.push(link[edgeProperty.prop]);
                    counts.push(1);
                }
            });
        } else {
            this.store.graph.currentGraphData.links.forEach(link => {
                link.connections.forEach(connection => {
                    const labelLocation = values.indexOf(
                        connection[edgeProperty.prop]
                    );

                    if (labelLocation >= 0) {
                        counts[labelLocation] += 1;
                    } else {
                        values.push(connection[edgeProperty.prop]);
                        counts.push(1);
                    }
                });
            });
        }

        const [valuesSorted, countsSorted] = this.getSortedValues(
            counts,
            values,
            display_limit
        );

        return this.getChartDataBasedOnType(
            valuesSorted,
            countsSorted,
            chartType
        );
    };

    getNodeDataBasedOnNetworkSelection = network_data => {
        switch (network_data) {
            case 'selection':
                return this.store.graph.currentGraphData.selectedNodes;

            case 'visible':
                return this.store.graph.currentGraphData.nodes.filter(
                    node => node.visible
                );

            default:
                return this.store.graph.currentGraphData.nodes;
        }
    };

    getChartDataBasedOnType = (values, counts, chartType) => {
        switch (chartType.toLowerCase()) {
            case 'bar':
                return this.getBarChartData(values, counts, 'counts');
            case 'line':
                return this.getLineChartData(values, counts, 'counts');
            case 'grouped bar':
                return this.getGroupedBarChartData(values, counts, 'counts');
            default:
                return this.getDoughnutChartData(values, counts, 'counts');
        }
    };

    getSortedValues = (counts, values, display_limit) => {
        const valuesSorted = [];
        const countsSorted = [];

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

        return [valuesSorted, countsSorted];
    };

    getNodeBasicProp = (node, prop) => node[prop];

    getNodeAdvancedProp = (node, prop) => node.properties[prop];

    getNodeGroups = (groupBy, data) => {
        const groups = {};

        let getNodeProp =
            groupBy.type === 'basic'
                ? this.getNodeBasicProp
                : this.getNodeAdvancedProp;

        data.forEach(node => {
            const group = getNodeProp(node, groupBy.prop);

            if (Object.keys(groups).includes(group)) {
                groups[group].push(node);
            } else {
                groups[group] = [node];
            }
        });

        return groups;
    };

    getNodeCounts = (
        nodeProperty,
        chartType,
        display_limit,
        network_data,
        groupBy
    ) => {
        let data = this.getNodeDataBasedOnNetworkSelection(network_data);
        let getNodeProp =
            nodeProperty.type === 'basic'
                ? this.getNodeBasicProp
                : this.getNodeAdvancedProp;

        if (groupBy) {
            let groupedByCounts = {};

            const groups = this.getNodeGroups(groupBy, data);

            const uniqueValues = [
                ...new Set(
                    data.map(node => getNodeProp(node, nodeProperty.prop))
                )
            ];

            Object.keys(groups).forEach(group => {
                groupedByCounts[group] = new Array(uniqueValues.length).fill(0);
            });

            Object.keys(groups).forEach(group => {
                data = groups[group];

                data.forEach(node => {
                    const labelLocation = uniqueValues.indexOf(
                        getNodeProp(node, nodeProperty.prop)
                    );

                    groupedByCounts[group][labelLocation] += 1;
                });
            });

            return this.getChartDataBasedOnType(
                uniqueValues,
                groupedByCounts,
                chartType
            );
        } else {
            let values = [];
            let counts = [];

            data.forEach(node => {
                const labelLocation = values.indexOf(
                    getNodeProp(node, nodeProperty.prop)
                );

                if (labelLocation >= 0) {
                    counts[labelLocation] += 1;
                } else {
                    values.push(getNodeProp(node, nodeProperty.prop));
                    counts.push(1);
                }
            });

            const [valuesSorted, countsSorted] = this.getSortedValues(
                counts,
                values,
                display_limit
            );

            return this.getChartDataBasedOnType(
                valuesSorted,
                countsSorted,
                chartType
            );
        }
    };
}
