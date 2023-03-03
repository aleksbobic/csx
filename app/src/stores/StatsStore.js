import { schemeTableau10 } from 'd3-scale-chromatic';
import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    DoughnutController,
    LineController,
    BarController,
    Filler,
    Tooltip as ChartJSTooltip,
    RadarController,
    RadialLinearScale
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { capitaliseFirstLetter } from 'general.utils';

export class StatsStore {
    isStatsModalVisible = false;
    chartTypes = [
        'Doughnut',
        'Bar',
        'Line',
        'Vertical Bar',
        'Grouped Bar',
        'Radar',
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
        display_limit: '10',
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

        ChartJS.register(
            RadarController,
            RadialLinearScale,
            ArcElement,
            ChartJSTooltip,
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Legend,
            PointElement,
            LineElement,
            DoughnutController,
            LineController,
            BarController,
            ChartDataLabels,
            Filler
        );
    }

    toggleStatsModalVisiblity = (val, types) => {
        if (types) {
            this.availableTypes = types;
            this.newChartProps['network_data'] = types[0];
        }

        this.isStatsModalVisible = val;
    };

    getGraphColors = (labels, data) => {
        let uniqueValues;

        if (data) {
            uniqueValues = [...new Set(data)];
        }

        const graphColors = [];

        if (data && uniqueValues && uniqueValues?.length <= 10) {
            for (let i = 0; i < labels.length; i++) {
                graphColors.push(
                    schemeTableau10[uniqueValues.indexOf(data[i])]
                );
            }
        } else {
            for (let i = 0; i < labels.length; i++) {
                if (labels.length <= 10) {
                    graphColors.push(schemeTableau10[i]);
                } else {
                    graphColors.push('#3182CE');
                }
            }
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
            network_data: 'all',
            onlyVisible: false,
            elements: 'nodes',
            show_only: 'all',
            element_values: 'values',
            display_limit: '10',
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

    getNodeSortValues = () => {
        let sortValues = [
            { value: 'frequency', label: 'Frequency' },
            { value: 'neighbours', label: 'Neighbour count' }
        ];

        if (this.store.core.isDetail) {
            return sortValues;
        }

        return [
            ...sortValues,
            ...this.store.graph.currentGraphData.meta.anchorProperties
                .map(entry => entry.property)
                .filter(property =>
                    ['integer', 'float'].includes(
                        this.store.overviewSchema.featureTypes[property]
                    )
                )
                .map(property => {
                    return { value: property, label: property };
                })
        ];
    };

    getWidgetNodeProperties = (group = false) => {
        let elementValues = [];
        if (!group) {
            elementValues.push({ value: 'values', label: 'Node values' });
        }

        elementValues = [
            ...elementValues,
            { value: 'types', label: 'Node types' },
            {
                value: 'degree',
                label: 'Neighbour count'
            }
        ];

        if (this.store.core.isDetail) {
            return elementValues;
        }

        return [
            ...elementValues,
            ...this.store.overviewSchema.anchorProperties.map(entry => {
                return {
                    value: entry,
                    label: capitaliseFirstLetter(entry)
                };
            })
        ];
    };

    getWidgetEdgeProperties = () => {
        if (this.store.core.isDetail) {
            return [{ value: 'weight', label: 'Edge weights' }];
        }

        return [
            { value: 'values', label: 'Edge values' },
            { value: 'types', label: 'Edge types' },
            { value: 'weight', label: 'Edge weights' }
        ];
    };

    getElementValues = (group = false) => {
        if (this.newChartProps.elements === 'nodes') {
            let elementValues = [];
            if (!group) {
                elementValues.push({ value: 'values', label: 'Node values' });
            }

            elementValues.push({ value: 'types', label: 'Node types' });
            elementValues.push({
                value: 'degree',
                label: 'Neighbour count'
            });

            if (this.store.core.currentGraph !== 'detail') {
                elementValues = elementValues.concat(
                    this.store.overviewSchema.anchorProperties.map(entry => {
                        return {
                            value: entry,
                            label: capitaliseFirstLetter(entry)
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

    setWidgetProperty = (widgetID, property, value) => {
        this.activeWidgets.find(chart => chart.id === widgetID)[property] =
            value;
        localStorage.setItem('chartConfig', JSON.stringify(this.charts));
    };

    setWidgetProperties = (widgetID, properties) => {
        const dataset = this.store.search.currentDataset;
        const widgetIdenx = this.charts[dataset].findIndex(
            chart => chart.id === widgetID
        );
        this.charts[dataset][widgetIdenx] = {
            ...this.charts[dataset][widgetIdenx],
            ...properties
        };

        this.charts[dataset] = [...this.charts[dataset]];

        localStorage.setItem('chartConfig', JSON.stringify(this.charts));
    };

    getNewWidgetTitle = () => {
        if (this.newChartProps.title) {
            return this.newChartProps.title;
        }

        if (this.newChartProps.type.toLowerCase() === 'nodes') {
            return 'Graph nodes';
        }

        if (this.newChartProps.type.toLowerCase() === 'components') {
            return 'Graph components';
        }

        if (this.newChartProps.type.toLowerCase() === 'graph stats') {
            return 'Graph properties';
        }

        if (this.newChartProps.type.toLowerCase() === 'node filter') {
            return 'Node filter';
        }

        if (this.newChartProps.type.toLowerCase() === 'connections') {
            return 'Node connections';
        }

        if (this.newChartProps.type.toLowerCase() === 'radar') {
            return 'Element comparison';
        }

        switch (this.newChartProps.element_values) {
            case 'values':
                return this.newChartProps.elements === 'nodes'
                    ? 'node values'
                    : 'edge values';
            case 'types':
                return this.newChartProps.elements === 'nodes'
                    ? 'node types'
                    : 'edge types';
            default:
                return this.newChartProps.elements === 'nodes'
                    ? `property ${this.newChartProps.element_values} values`
                    : 'edge weights';
        }
    };

    get activeWidgets() {
        return this.charts[this.store.search.currentDataset];
    }

    addChart = () => {
        const dataset = this.store.search.currentDataset;

        const newChartId = uuidv4();

        this.store.track.trackEvent(
            'Widget Modal',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: 'Add new chart',
                properties: {
                    id: newChartId,
                    type: this.newChartProps.type,
                    elements: this.newChartProps.elements,
                    element_values: this.newChartProps.element_values,
                    network: this.newChartProps.network
                }
            })
        );

        if (Object.keys(this.charts).includes(dataset)) {
            this.charts[dataset].push({
                ...this.newChartProps,
                id: newChartId,
                colSpan: 1,
                height: '200px',
                network: this.store.core.currentGraph,
                title: this.getNewWidgetTitle(),
                element_sort_values: 'frequency'
            });
        } else {
            this.charts[dataset] = [
                {
                    ...this.newChartProps,
                    id: newChartId,
                    colSpan: 1,
                    height: '200px',
                    network: this.store.core.currentGraph,
                    title: this.getNewWidgetTitle(),
                    element_sort_values: 'frequency'
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

    getWidgetTitle = id =>
        this.activeWidgets.find(widget => widget.id === id)?.title;

    getWidgetItemType = id =>
        this.activeWidgets.find(widget => widget.id === id)?.elements;

    getWidgetSelectedItemprop = id =>
        this.activeWidgets.find(widget => widget.id === id)?.element_values;

    getWidgetShowOnly = id =>
        this.activeWidgets.find(widget => widget.id === id)?.show_only;

    getWidgetGroupBy = id =>
        this.activeWidgets.find(widget => widget.id === id)?.group_by;

    getWidgetItemProps = id => {
        if (
            this.activeWidgets.find(widget => widget.id === id).elements ===
            'nodes'
        ) {
            return this.getWidgetNodeProperties();
        }

        return this.getWidgetEdgeProperties();
    };

    getWidgetSecondaryAxis = id => {
        const secondaryAxisValue = this.activeWidgets.find(
            widget => widget.id === id
        )?.element_sort_values;

        if (secondaryAxisValue) {
            return secondaryAxisValue;
        }

        return 'frequency';
    };

    getWidgetItemState = id =>
        this.activeWidgets.find(widget => widget.id === id)?.network_data;

    getWidgetItemCount = id =>
        this.activeWidgets.find(widget => widget.id === id)?.display_limit ||
        10;

    expandChart = (id, makeHistoryEntry = true) => {
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

        if (makeHistoryEntry) {
            this.store.history.updateStudyCharts(charts);
        }
    };

    shrinkChart = (id, makeHistoryEntry = true) => {
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

        if (makeHistoryEntry) {
            this.store.history.updateStudyCharts(charts);
        }
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
                    backgroundColor: this.getGraphColors(labels, data),
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getGroupedBarChartData = (labels, data, label) => {
        const datasets = [];

        const groupColors = this.getGraphColors(labels);

        const groups = [];

        Object.keys(data).forEach((group, index) => {
            groups.push(group);
        });

        labels.forEach((label, index) => {
            datasets.push({
                label: label,
                data: groups.map(group => data[group][index]),
                backgroundColor: groupColors[index],
                borderColor: 'transparent'
            });
        });

        return {
            labels: groups,
            datasets: datasets
        };
    };

    getComponentByID = componentID => {
        return this.store.graph.currentGraphData.components.find(
            component => component.id === componentID
        );
    };

    getComponentLinkCount = component =>
        this.store.graph.currentGraphData.links.filter(link =>
            component.nodes.includes(link.source.id)
        ).length;

    getComponentNodeCount = component => component.nodes.length;

    getComponentEntryCount = component => component.entries.length;

    getComponentLargestEntryCount = component => {
        return component.largest_nodes.length
            ? component.largest_nodes[0].entries.length
            : 0;
    };

    getRadarDetailComponents = () => {
        const labels = [
            'Node count',
            'Edge count',
            'Entry count',
            'Largest node entry count'
        ];

        const datasets =
            this.store.graph.currentGraphData.selectedComponents.map(
                componentID => {
                    const component = this.getComponentByID(componentID);

                    return {
                        label: `Component ${component.id}`,
                        data: [
                            this.getComponentNodeCount(component),
                            this.getComponentLinkCount(component),
                            this.getComponentEntryCount(component),
                            this.getComponentLargestEntryCount(component)
                        ]
                    };
                }
            );

        if (!datasets.length) {
            return null;
        }

        return { labels: labels, datasets: datasets };
    };

    getRadarOverviewComponents = () => {
        const labels = ['Node count', 'Edge count', 'Entry count'];

        const datasets =
            this.store.graph.currentGraphData.selectedComponents.map(
                componentID => {
                    const component = this.getComponentByID(componentID);

                    return {
                        label: `Component ${component.id}`,
                        data: [
                            this.getComponentNodeCount(component),
                            this.getComponentLinkCount(component),
                            this.getComponentEntryCount(component)
                        ]
                    };
                }
            );

        if (!datasets.length) {
            return null;
        }

        return { labels: labels, datasets: datasets };
    };

    getRadarDetailNodeProperties = () => {
        const neighbourTypes = this.store.core.visibleDimensions['detail'].map(
            feature => `${feature} neighbours`
        );

        return {
            basic: ['Neighbours', 'Documents', 'Links'],
            neighbourTypes: neighbourTypes
        };
    };

    getRadarOverviewNodeProperties = () => {
        const linkTypes = this.store.overviewSchema.links.map(
            linkType => linkType
        );

        const anchorProperties =
            this.store.graph.currentGraphData.meta.anchorProperties
                .filter(entry =>
                    ['integer', 'float'].includes(
                        this.store.overviewSchema.featureTypes[entry.property]
                    )
                )
                .map(entry => entry.property);

        return {
            basic: ['Neighbours', 'Documents', 'Links'],
            linkTypes: linkTypes,
            anchorProperties: anchorProperties
        };
    };

    getNodeLinks = node =>
        this.store.graph.currentGraphData.links.filter(
            link => link.source.id === node.id || link.target.id === node.id
        );

    getNodeNeighbourCountProperty = node => node.neighbours.size;
    getNodeEntryCountProperty = node => node.entries.length;
    getNodeLinkCountProperty = nodeLinks =>
        nodeLinks.reduce((counts, link) => {
            return counts + link.weight;
        }, 0);

    getBasicNodeProperties = (node, nodeLinks, properties) => {
        return properties.map(property => {
            switch (property) {
                case 'Neighbours':
                    return this.getNodeNeighbourCountProperty(node);
                case 'Documents':
                    return this.getNodeEntryCountProperty(node);
                default:
                    return this.getNodeLinkCountProperty(nodeLinks);
            }
        });
    };

    getLinkTypeProperties = (nodeLinks, properties) => {
        return properties.map(linkType => {
            return nodeLinks.reduce((counts, link) => {
                link.connections.forEach(connection => {
                    counts =
                        connection.feature === linkType ? counts + 1 : counts;
                });
                return counts;
            }, 0);
        });
    };

    getAnchorProperties = (node, properties) => {
        return properties.map(prop => parseFloat(node.properties[prop]));
    };

    getRadarOverviewNodes = visibleProperties => {
        let labels = Object.keys(visibleProperties)
            .map(key => visibleProperties[key])
            .flat();

        const datasets = this.store.graph.currentGraphData.selectedNodes.map(
            node => {
                const nodeLinks = this.getNodeLinks(node);

                return {
                    label: `${node.label.substring(0, 20)}${
                        node.label.length > 20 ? '...' : ''
                    }`,
                    data: [
                        ...Object.keys(visibleProperties)
                            .map(key => {
                                if (key === 'basic') {
                                    return this.getBasicNodeProperties(
                                        node,
                                        nodeLinks,
                                        visibleProperties[key]
                                    );
                                }

                                if (key === 'linkTypes') {
                                    return this.getLinkTypeProperties(
                                        nodeLinks,
                                        visibleProperties[key]
                                    );
                                }

                                return this.getAnchorProperties(
                                    node,
                                    visibleProperties[key]
                                );
                            })
                            .flat()
                    ]
                };
            }
        );

        if (!datasets.length) {
            return null;
        }

        return { labels: labels, datasets: datasets };
    };

    getNeighbourTypeProperties = (node, properties) => {
        return properties.map(neighbourType => {
            return node.neighbourObjects.reduce((counts, neighbour) => {
                return neighbour.feature === neighbourType.split(' ')[0]
                    ? counts + 1
                    : counts;
            }, 0);
        });
    };

    getRadarDetailNodes = visibleProperties => {
        let labels = Object.keys(visibleProperties)
            .map(key => visibleProperties[key])
            .flat();

        const datasets = this.store.graph.currentGraphData.selectedNodes.map(
            node => {
                const nodeLinks = this.getNodeLinks(node);

                return {
                    label: `${node.label.substring(0, 20)}${
                        node.label.length > 20 ? '...' : ''
                    }`,
                    data: [
                        ...Object.keys(visibleProperties)
                            .map(key => {
                                if (key === 'basic') {
                                    return this.getBasicNodeProperties(
                                        node,
                                        nodeLinks,
                                        visibleProperties[key]
                                    );
                                }

                                return this.getNeighbourTypeProperties(
                                    node,
                                    visibleProperties[key]
                                );
                            })
                            .flat()
                    ]
                };
            }
        );

        if (!datasets.length) {
            return null;
        }

        return { labels: labels, datasets: datasets };
    };

    getLineChartData = (labels, data, label) => {
        return {
            labels: labels,
            datasets: [
                {
                    label: label,
                    data: data,
                    backgroundColor: this.getGraphColors(labels, data),
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
                    backgroundColor: this.getGraphColors(labels, data),
                    borderColor: 'rgb(0,0,0)'
                }
            ]
        };
    };

    getEdgeGroups = (groupBy, data) => {
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
                if (link.connections) {
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
                }
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

    getNodeNeighbourCount = node =>
        node.neighbours.size === 1
            ? `${node.neighbours.size} neighbour`
            : `${node.neighbours.size} neighbours`;

    getNodeBasicProp = (node, prop) => node[prop];

    getNodeFeature = node => node.feature;

    getNodeAdvancedProp = (node, prop) => node.properties[prop];

    getNodeGroups = (groupBy, data) => {
        const groups = {};
        let getNodeProp;

        if (groupBy.prop === 'degree') {
            getNodeProp = this.getNodeNeighbourCount;
        } else if (groupBy.type === 'basic') {
            getNodeProp = this.getNodeBasicProp;
        } else {
            getNodeProp = this.getNodeAdvancedProp;
        }

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
        show_only,
        sortBy = 'frequency'
    ) => {
        let data = this.getNodeDataBasedOnNetworkSelection(
            network_data,
            show_only
        );

        let getNodeProp;

        if (nodeProperty.prop === 'degree') {
            getNodeProp = this.getNodeNeighbourCount;
        } else if (nodeProperty.type === 'basic') {
            getNodeProp = this.getNodeBasicProp;
        } else {
            getNodeProp = this.getNodeAdvancedProp;
        }

        if (groupBy) {
            let groupedByCounts = {};

            // Nodes grouped in the groupBy groups
            const groups = this.getNodeGroups(groupBy, data);

            // Unique node values
            const uniqueValues = [
                ...new Set(
                    data.map(node => getNodeProp(node, nodeProperty.prop))
                )
            ];

            // Unique node value counts (so the frequnecy for each entry in uniqueValues)
            const allValueCounts = new Array(uniqueValues.length).fill(0);

            // Get all visible nodes
            const visibleEntries =
                network_data === 'visible'
                    ? this.store.graph.currentGraphData.activeTableData.map(
                          row => row.entry
                      )
                    : this.store.graph.currentGraphData.tableData.map(
                          row => row.entry
                      );

            data.map(node => {
                return {
                    value: getNodeProp(node, nodeProperty.prop),
                    weight: node.entries.filter(entryID =>
                        visibleEntries.includes(entryID)
                    ).length
                };
            }).forEach(entry => {
                allValueCounts[uniqueValues.indexOf(entry.value)] +=
                    entry.weight;
            });

            // For each group form groups the counts for each of the values in unique node values
            Object.keys(groups).forEach(group => {
                groupedByCounts[group] = new Array(uniqueValues.length).fill(0);
            });

            // node vlaues but ordered based on frequency
            const [valuesSorted] = this.getSortedValues(
                allValueCounts,
                uniqueValues,
                display_limit
            );

            // generate data for groupedByCounts
            // The format is:
            // {
            //     groupName1: [val1freq1, val2freq1],
            //     groupName2: [val1freq2, val2freq2],
            //     groupName3: [val1freq3, val2freq3]
            // }
            Object.keys(groups).forEach(group => {
                data = groups[group];

                data.forEach(node => {
                    const labelLocation = valuesSorted.indexOf(
                        getNodeProp(node, nodeProperty.prop)
                    );

                    groupedByCounts[group][labelLocation] +=
                        node.entries.filter(entryID =>
                            visibleEntries.includes(entryID)
                        ).length;
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

            const visibleEntries =
                network_data === 'visible'
                    ? this.store.graph.currentGraphData.activeTableData.map(
                          row => row.entry
                      )
                    : this.store.graph.currentGraphData.tableData.map(
                          row => row.entry
                      );

            data.forEach(node => {
                const labelLocation = values.indexOf(
                    getNodeProp(node, nodeProperty.prop)
                );

                if (sortBy === 'frequency') {
                    if (labelLocation >= 0) {
                        counts[labelLocation] += node.entries.filter(entryID =>
                            visibleEntries.includes(entryID)
                        ).length;
                    } else {
                        values.push(getNodeProp(node, nodeProperty.prop));
                        counts.push(
                            node.entries.filter(entryID =>
                                visibleEntries.includes(entryID)
                            ).length
                        );
                    }
                } else if (sortBy === 'neighbours') {
                    if (labelLocation >= 0) {
                        counts[labelLocation] += node.neighbours.size;
                    } else {
                        values.push(getNodeProp(node, nodeProperty.prop));
                        counts.push(node.neighbours.size);
                    }
                } else {
                    if (labelLocation >= 0) {
                        counts[labelLocation] += parseFloat(
                            node.properties[sortBy]
                        );
                    } else {
                        values.push(getNodeProp(node, nodeProperty.prop));
                        counts.push(parseFloat(node.properties[sortBy]));
                    }
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
