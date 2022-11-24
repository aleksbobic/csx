import { makeAutoObservable } from 'mobx';
import { interpolateRainbow, schemeTableau10 } from 'd3-scale-chromatic';
import { v4 as uuidv4 } from 'uuid';

export class StatsStore {
    isStatsModalVisible = false;
    chartTypes = [
        'Doughnut',
        'Bar',
        'Line',
        'Vertical Bar',
        'Grouped Bar',
        'Nodes',
        'Components',
        'Graph stats',
        'Connections',
        'Node Filter'
    ];
    availableTypes = ['all'];
    newChartProps = {
        title: '',
        hoverLabel: '',
        groupHoverLabel: '',
        network: 'overview',
        type: 'doughnut',
        network_data: 'all',
        onlyVisible: false,
        elements: 'nodes',
        show_only: 'all',
        element_values: 'values',
        display_limit: 'all',
        group_by: 'types',
        colSpan: 1,
        height: '200px',
        legend: false,
        labels: {
            x: {
                display: false
            },
            y: {
                display: false
            }
        }
    };

    charts = {};

    constructor(store) {
        this.store = store;

        const configString = localStorage.getItem('chartConfig');
        if (configString) {
            this.charts = JSON.parse(configString);
        }

        makeAutoObservable(this);
    }

    toggleStatsModalVisiblity = (val, types) => {
        if (types) {
            this.availableTypes = types;
            this.newChartProps['network_data'] = types[0];
        }

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
            title: '',
            hoverLabel: '',
            groupHoverLabel: '',
            network: 'overview',
            type: 'doughnut',
            onlyVisible: false,
            network_data: 'all',
            elements: 'nodes',
            show_only: 'all',
            element_values: 'values',
            display_limit: 'all',
            group_by: 'types',
            colSpan: 1,
            height: '200px',
            legend: false,
            labels: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        };
    };

    changeChartTitle = val => {
        this.newChartProps.title = val;
    };

    changeChartHoverLabel = val => {
        this.newChartProps.hoverLabel = val;
    };

    changeChartGroupHoverLabel = val => {
        this.newChartProps.groupHoverLabel = val;
    };

    changeSelectedChartType = index => {
        this.newChartProps.type = this.chartTypes[index];
    };

    changeChartNetworkData = val => {
        this.newChartProps.network_data = val;
    };

    changeIsOnlyVisible = val => {
        this.newChartProps.onlyVisible = val;
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

    changeShowOnly = val => {
        this.newChartProps.show_only = val;
    };

    getElementValues = () => {
        if (this.newChartProps.elements === 'nodes') {
            let elementValues = [
                { value: 'values', label: 'Node values' },
                { value: 'types', label: 'Node types' }
            ];

            if (this.store.core.currentGraph !== 'detail') {
                elementValues = elementValues.concat(
                    this.store.schema.overviewDataNodeProperties.map(entry => {
                        return {
                            value: entry,
                            label:
                                entry.charAt(0).toUpperCase() + entry.slice(1)
                        };
                    })
                );
            }

            return elementValues;
        }

        if (this.store.core.currentGraph === 'detail') {
            this.newChartProps.element_values = 'weight';
            return [{ value: 'weight', label: 'Edge weights' }];
        }

        this.newChartProps.element_values = 'values';
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
                height: '200px',
                network: this.store.core.currentGraph
            });
        } else {
            this.charts[dataset] = [
                {
                    ...this.newChartProps,
                    id: uuidv4(),
                    colSpan: 1,
                    height: '200px',
                    network: this.store.core.currentGraph
                }
            ];
        }

        this.toggleStatsModalVisiblity(false);
        localStorage.setItem('chartConfig', JSON.stringify(this.charts));

        //TODO: Send info to backend and update current history item
        const charts =
            this.store.stats.charts[this.store.search.currentDataset];

        this.charts = { ...this.charts };

        this.store.history.updateStudyCharts(charts);
    };

    removeChart = id => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].filter(
            chart => chart.id !== id
        );

        localStorage.setItem('chartConfig', JSON.stringify(this.charts));

        const charts =
            this.store.stats.charts[this.store.search.currentDataset];

        this.charts = { ...this.charts };
        this.store.history.updateStudyCharts(charts);
    };

    expandChart = id => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].map(chart => {
            if (chart.id !== id) {
                return chart;
            }

            return {
                ...chart,
                colSpan: 2,
                height: '400px'
            };
        });
        localStorage.setItem('chartConfig', JSON.stringify(this.charts));

        const charts =
            this.store.stats.charts[this.store.search.currentDataset];

        this.charts = { ...this.charts };
        this.store.history.updateStudyCharts(charts);
    };

    shrinkChart = id => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].map(chart => {
            if (chart.id !== id) {
                return chart;
            }

            return {
                ...chart,
                colSpan: 1,
                height: '200px',
                legend: false,
                labels: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                }
            };
        });
        localStorage.setItem('chartConfig', JSON.stringify(this.charts));

        const charts =
            this.store.stats.charts[this.store.search.currentDataset];
        this.charts = { ...this.charts };

        this.store.history.updateStudyCharts(charts);
    };

    toggleLegend = id => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].map(chart => {
            if (chart.id !== id) {
                return chart;
            }

            return {
                ...chart,
                legend: !chart.legend
            };
        });
        localStorage.setItem('chartConfig', JSON.stringify(this.charts));

        const charts =
            this.store.stats.charts[this.store.search.currentDataset];

        this.store.history.updateStudyCharts(charts);
    };

    toggleAxisLabels = (id, axis) => {
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = this.charts[dataset].map(chart => {
            if (chart.id !== id) {
                return chart;
            }

            if (axis === 'x') {
                return {
                    ...chart,
                    labels: {
                        ...chart.labels,
                        x: {
                            display: !chart.labels.x.display
                        }
                    }
                };
            } else {
                return {
                    ...chart,
                    labels: {
                        ...chart.labels,
                        y: {
                            display: !chart.labels.y.display
                        }
                    }
                };
            }
        });
        localStorage.setItem('chartConfig', JSON.stringify(this.charts));

        const charts =
            this.store.stats.charts[this.store.search.currentDataset];
        this.charts = { ...this.charts };

        this.store.history.updateStudyCharts(charts);
    };

    setChartListForDataset = charts => {
        console.log('new charts: ', charts);
        const dataset = this.store.search.currentDataset;
        this.charts[dataset] = charts;
        this.charts = { ...this.charts };
        localStorage.setItem('chartConfig', JSON.stringify(this.charts));
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

        const groupColors = this.getGraphColors(Object.keys(data));

        Object.keys(data).forEach((group, index) => {
            datasets.push({
                label: group,
                data: data[group],
                backgroundColor: groupColors[index],
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

    getEdgeGroups = (groupBy, data) => {
        console.log(groupBy);
        console.log(data);
        const groups = {};

        if (groupBy.type === 'basic') {
            data.forEach(link => {
                const group = link[groupBy.prop];

                if (Object.keys(groups).includes(group)) {
                    groups[group].push(link);
                } else {
                    groups[group] = [link];
                }
            });
        } else {
            data.forEach(link => {
                link.connections.forEach(connection => {
                    const group = connection[groupBy.prop];

                    if (Object.keys(groups).includes(group)) {
                        groups[group].push(link);
                    } else {
                        groups[group] = [link];
                    }
                });
            });
        }

        return groups;
    };

    getUniqueEdgeValues = (data, edgeProperty) => {
        const uniqueValues = [];

        if (edgeProperty.type === 'basic') {
            data.forEach(link => {
                uniqueValues.push(link[edgeProperty.prop]);
            });
        } else {
            data.forEach(link => {
                link.connections.forEach(connection => {
                    uniqueValues.push(connection[edgeProperty.prop]);
                });
            });
        }
        return [...new Set(uniqueValues)];
    };

    getEdgeAllValueCounts = (
        allValueCounts,
        data,
        edgeProperty,
        uniqueValues
    ) => {
        if (edgeProperty.type === 'basic') {
            data.forEach(link => {
                allValueCounts[
                    uniqueValues.indexOf(link[edgeProperty.prop])
                ] += 1;
            });
        } else {
            data.forEach(link => {
                link.connections.forEach(connection => {
                    allValueCounts[
                        uniqueValues.indexOf(connection[edgeProperty.prop])
                    ] += 1;
                });
            });
        }

        return allValueCounts;
    };

    getEdgeCounts = (
        edgeProperty,
        chartType,
        display_limit,
        groupBy,
        network_data
    ) => {
        let values = [];
        let counts = [];
        let data = this.store.graph.currentGraphData.links;

        if (network_data === 'visible') {
            data = data.filter(link => link.visible);
        }

        if (!data.length) {
            return { labels: [] };
        }

        if (groupBy) {
            let groupedByCounts = {};
            const groups = this.getEdgeGroups(groupBy, data);

            const uniqueValues = this.getUniqueEdgeValues(data, edgeProperty);

            let allValueCounts = new Array(uniqueValues.length).fill(0);

            allValueCounts = this.getEdgeAllValueCounts(
                allValueCounts,
                data,
                edgeProperty,
                uniqueValues
            );

            Object.keys(groups).forEach(group => {
                groupedByCounts[group] = new Array(uniqueValues.length).fill(0);
            });

            const [valuesSorted] = this.getSortedValues(
                allValueCounts,
                uniqueValues,
                display_limit
            );

            Object.keys(groups).forEach(group => {
                data = groups[group];

                if (edgeProperty.type === 'basic') {
                    data.forEach(link => {
                        const labelLocation = valuesSorted.indexOf(
                            link[edgeProperty.prop]
                        );

                        groupedByCounts[group][labelLocation] += 1;
                    });
                } else {
                    data.forEach(link => {
                        link.connections.forEach(connection => {
                            const labelLocation = valuesSorted.indexOf(
                                connection[edgeProperty.prop]
                            );

                            groupedByCounts[group][labelLocation] += 1;
                        });
                    });
                }
            });

            return {
                edgeProperty: edgeProperty,
                ...this.getChartDataBasedOnType(
                    valuesSorted,
                    groupedByCounts,
                    chartType
                )
            };
        }

        if (edgeProperty.type === 'basic') {
            data.forEach(link => {
                const labelLocation = values.indexOf(link[edgeProperty.prop]);

                if (labelLocation >= 0) {
                    counts[labelLocation] += 1;
                } else {
                    values.push(link[edgeProperty.prop]);
                    counts.push(1);
                }
            });
        } else {
            data.forEach(link => {
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

        return {
            edgeProperty: edgeProperty,
            ...this.getChartDataBasedOnType(
                valuesSorted,
                countsSorted,
                chartType
            )
        };
    };

    getNodeDataBasedOnNetworkSelection = (network_data, showOnly) => {
        let nodes;
        switch (network_data) {
            case 'selected':
                nodes = this.store.graph.currentGraphData.selectedNodes;
                break;
            case 'visible':
                nodes = this.store.graph.currentGraphData.nodes.filter(
                    node => node.visible
                );
                break;
            default:
                nodes = this.store.graph.currentGraphData.nodes;
                break;
        }

        if (showOnly !== 'all') {
            nodes = nodes.filter(node => node.feature === showOnly);
        }

        return nodes;
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
        groupBy,
        show_only
    ) => {
        let data = this.getNodeDataBasedOnNetworkSelection(
            network_data,
            show_only
        );
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

            const allValueCounts = new Array(uniqueValues.length).fill(0);

            data.map(node => {
                return {
                    value: getNodeProp(node, nodeProperty.prop),
                    weight: node.entries.length
                };
            }).forEach(entry => {
                allValueCounts[uniqueValues.indexOf(entry.value)] +=
                    entry.weight;
            });

            Object.keys(groups).forEach(group => {
                groupedByCounts[group] = new Array(uniqueValues.length).fill(0);
            });

            const [valuesSorted] = this.getSortedValues(
                allValueCounts,
                uniqueValues,
                display_limit
            );

            Object.keys(groups).forEach(group => {
                data = groups[group];

                data.forEach(node => {
                    const labelLocation = valuesSorted.indexOf(
                        getNodeProp(node, nodeProperty.prop)
                    );

                    groupedByCounts[group][labelLocation] +=
                        node.entries.length;
                });
            });

            return {
                nodeProperty: nodeProperty,
                ...this.getChartDataBasedOnType(
                    valuesSorted,
                    groupedByCounts,
                    chartType
                )
            };
        } else {
            let values = [];
            let counts = [];

            data.forEach(node => {
                const labelLocation = values.indexOf(
                    getNodeProp(node, nodeProperty.prop)
                );

                if (labelLocation >= 0) {
                    counts[labelLocation] += node.entries.length;
                } else {
                    values.push(getNodeProp(node, nodeProperty.prop));
                    counts.push(node.entries.length);
                }
            });

            const [valuesSorted, countsSorted] = this.getSortedValues(
                counts,
                values,
                display_limit
            );

            return {
                nodeProperty: nodeProperty,
                ...this.getChartDataBasedOnType(
                    valuesSorted,
                    countsSorted,
                    chartType
                )
            };
        }
    };
}
