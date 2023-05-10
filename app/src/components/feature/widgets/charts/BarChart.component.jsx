import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { useEffect, useRef, useState } from 'react';
import { Chart as ChartReactCharts, getElementAtEvent } from 'react-chartjs-2';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function BarChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const [data, setData] = useState(null);

    const [chartConfig, setChartConfig] = useState(
        store.stats?.activeWidgets?.find(
            widget => widget.id === props.chart.id
        ) || {}
    );

    useEffect(() => {
        if (store.comment.chartToAttach === props.chart.id) {
            store.comment.attachChart(
                chartRef.current.toBase64Image('image/octet-stream', 1.0)
            );
            store.comment.setChartToAttach(null);
        }
    }, [props.chart.id, store.comment, store.comment.chartToAttach]);

    const getGroupBy = chart => {
        if (chart.type.toLowerCase() !== 'grouped bar') {
            return null;
        }

        if (chart.elements === 'nodes') {
            switch (chart.group_by) {
                case 'values':
                    return { type: 'basic', prop: 'label' };
                case 'types':
                    return { type: 'basic', prop: 'feature' };
                case 'degree':
                    return { type: 'basic', prop: 'degree' };
                default:
                    return {
                        type: 'advanced',
                        prop: chart.group_by
                    };
            }
        }

        switch (chart.group_by) {
            case 'values':
                return { type: 'advanced', prop: 'label' };
            case 'types':
                return { type: 'advanced', prop: 'feature' };
            default:
                return {
                    type: 'basic',
                    prop: chart.group_by
                };
        }
    };

    const getElementProperties = chart => {
        switch (chart.element_values) {
            case 'values':
                return chart.elements === 'nodes'
                    ? { type: 'basic', prop: 'label' }
                    : { type: 'advanced', prop: 'label' };
            case 'types':
                return chart.elements === 'nodes'
                    ? { type: 'basic', prop: 'feature' }
                    : { type: 'advanced', prop: 'feature' };
            case 'degree':
                return { type: 'basic', prop: 'degree' };
            default:
                return chart.elements === 'nodes'
                    ? {
                          type: 'advanced',
                          prop: chart.element_values
                      }
                    : { type: 'basic', prop: 'weight' };
        }
    };

    const getChartData = useCallback(
        chart => {
            if (!chart) {
                return null;
            }

            const groupBy = getGroupBy(chart);
            const elementProperty = getElementProperties(chart);

            const anchor_properties = store.core.isOverview
                ? store.overviewSchema.anchorProperties
                : [];

            if (chart.elements !== 'nodes') {
                return store.stats.getEdgeCounts(
                    elementProperty,
                    chart.type,
                    chart.display_limit,
                    groupBy,
                    chart.network_data
                );
            }

            if (
                elementProperty.type === 'advanced' &&
                !anchor_properties.includes(elementProperty.prop)
            ) {
                return null;
            }

            return store.stats.getNodeCounts(
                elementProperty,
                chart.type,
                chart.display_limit,
                chart.network_data,
                groupBy,
                chart.show_only,
                chart.element_sort_values
            );
        },
        [
            store.core.isOverview,
            store.overviewSchema.anchorProperties,
            store.stats
        ]
    );

    useEffect(() => {
        if (props.demoData) {
            setData(props.demoData);
        } else {
            const chart = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );

            setChartConfig(chart);

            setData(getChartData(chart));
        }
    }, [
        props.chart.id,
        props.demoData,
        store.core.currentGraph,
        store.core.isOverview,
        store.overviewSchema.anchorProperties,
        store.stats,
        store.stats.activeWidgets,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents,
        getChartData
    ]);

    const getPropertiesInChart = () => {
        if (!chartConfig) {
            return '';
        }

        switch (chartConfig.element_values) {
            case 'values':
                return chartConfig.elements === 'nodes'
                    ? chartConfig.show_only !== 'all'
                        ? chartConfig.show_only
                        : 'Node value'
                    : 'Edge value';

            case 'types':
                return chartConfig.elements === 'nodes'
                    ? 'Node feature'
                    : 'Edge feature';

            default:
                return chartConfig.elements === 'nodes'
                    ? chartConfig.element_values
                    : 'Edge weight';
        }
    };

    const getPluginOptions = () => {
        const propsInChart = getPropertiesInChart();

        const pluginOptions = {
            tooltip: {
                displayColors: false,
                callbacks: {
                    title: tooltipItem => {
                        if (props.chart.type.toLowerCase() === 'grouped bar') {
                            return `${propsInChart}:${
                                tooltipItem[0].dataset.label.length > 10
                                    ? '\n'
                                    : ' '
                            }${tooltipItem[0].dataset.label}`;
                        }

                        return `${propsInChart}:${
                            tooltipItem[0].label.length > 10 ? '\n' : ' '
                        }${tooltipItem[0].label}`;
                    },
                    label: tooltipItem => {
                        return `${chartConfig.element_sort_values}: ${tooltipItem.formattedValue}`;
                    }
                }
            }
        };

        if (props.chart.groupHoverLabel) {
            pluginOptions.tooltip.callbacks.title = tooltipItems => {
                return `${props.chart.hoverLabel}: ${tooltipItems[0].label}`;
            };
        }

        return pluginOptions;
    };

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={[
                    props.chart.type.toLowerCase() !== 'grouped bar' &&
                        'item type',
                    props.chart.type.toLowerCase() !== 'grouped bar' &&
                        'second axis',
                    props.chart.type.toLowerCase() === 'grouped bar' && 'group',
                    'main axis',
                    'item state',
                    'item count',
                    store.core.isDetail && 'visible types'
                ]}
                mainAxis={props.chart.type.toLowerCase() === 'bar' ? 'Y' : 'X'}
            />
        );
    }

    if (!data || data.labels.length === 0) {
        return <WidgetAlert size={props.isExpanded ? 'md' : 'sm'} />;
    }

    const getPadding = () => {
        return {
            right: props.isExpanded ? 5 : 0,
            top: props.isExpanded ? 5 : 0,
            bottom: props.isExpanded ? 5 : 0,
            left: props.isExpanded ? 5 : 0
        };
    };

    const getAxisTitle = () => {
        if (props.chart.type.toLowerCase() === 'grouped bar') {
            if (props.demoData) {
                return 'Group by property';
            }

            return (
                props.chart.group_by.charAt(0).toUpperCase() +
                props.chart.group_by.slice(1).toLowerCase()
            );
        }

        if (props.chart.elements === 'edges') {
            if (props.demoData) {
                return 'Edge property';
            }

            switch (props.chart.element_values) {
                case 'values':
                    return 'Edge values';
                case 'types':
                    return 'Edge types';
                default:
                    return 'Edge weights';
            }
        }

        if (props.demoData) {
            return 'Node property';
        }

        switch (props.chart.element_values) {
            case 'values':
                return props.chart.show_only
                    ? props.chart.show_only
                    : 'Node values';
            case 'types':
                return 'Node types';
            default:
                return (
                    props.chart.element_values.charAt(0).toUpperCase() +
                    props.chart.element_values.slice(1).toLowerCase()
                );
        }
    };

    return (
        <ChartReactCharts
            style={{ maxWidth: '100%' }}
            ref={chartRef}
            type="bar"
            height="250px"
            key={`chart_instance_${props.chartIndex}_${Math.random()}`}
            redraw
            data={{ ...data }}
            onClick={event => {
                if (!props.isExample) {
                    let dataIndex;
                    let groupValue;
                    let groupProperty;
                    let clickedValue;

                    try {
                        const { index } = getElementAtEvent(
                            chartRef.current,
                            event
                        )[0];

                        const points =
                            chartRef.current.getElementsAtEventForMode(
                                event,
                                'nearest',
                                { intersect: true },
                                true
                            );

                        groupProperty = props.chart.group_by;
                        groupValue =
                            data.datasets[points[0].datasetIndex].label;
                        clickedValue = data.labels[points[0].index];

                        dataIndex = index;
                    } catch (error) {
                        return;
                    }

                    let visibleNodeIds;

                    if ('nodeProperty' in data) {
                        store.track.trackEvent(
                            `Details Panel - Widget - ${props.chart.id}`,
                            'Chart Area',
                            JSON.stringify({
                                type: 'Click',
                                property: data.nodeProperty,
                                value: data.labels[dataIndex]
                            })
                        );

                        if (props.chart.type.toLowerCase() === 'grouped bar') {
                            visibleNodeIds =
                                store.graphInstance.filterNodesWithValue(
                                    data.nodeProperty,
                                    groupValue,
                                    clickedValue,
                                    groupProperty
                                );
                        } else {
                            visibleNodeIds =
                                store.graphInstance.filterNodesWithValue(
                                    data.nodeProperty,
                                    clickedValue
                                );
                        }
                    } else {
                        store.track.trackEvent(
                            `Details Panel - Widget - ${props.chart.id}`,
                            'Chart area',
                            JSON.stringify({
                                type: 'Click',
                                property: data.edgeProperty,
                                value: data.labels[dataIndex]
                            })
                        );

                        visibleNodeIds =
                            store.graphInstance.filterEdgesWithValue(
                                data.edgeProperty,
                                clickedValue
                            );
                    }

                    store.graphInstance.setIsFiltered(true);
                    if (visibleNodeIds.length === 1) {
                        store.graphInstance.zoomToFitByNodeId(
                            visibleNodeIds[0],
                            400
                        );
                    } else {
                        store.graphInstance.zoomToFitByNodeIds(visibleNodeIds);
                    }
                }
            }}
            options={{
                maintainAspectRatio: false,
                responsive: true,
                animation: false,
                borderColor: '#fff',
                devicePixelRatio: 2,
                indexAxis: props.chart.type.toLowerCase() === 'bar' && 'y',
                layout: {
                    padding: getPadding()
                },
                onHover: (event, elements) => {
                    if (elements.length) {
                        event.native.target.style.cursor = 'pointer';
                    } else {
                        event.native.target.style.cursor = 'default';
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            color: 'white',
                            text: ['vertical bar', 'grouped bar'].includes(
                                props.chart.type.toLowerCase()
                            )
                                ? chartConfig.element_sort_values
                                : getAxisTitle()
                        },
                        display: props.isExpanded,
                        ticks: {
                            color: 'white',
                            diplay: props.isExpanded,
                            callback: function (value, index, ticks) {
                                const stringValue =
                                    this.getLabelForValue(value);
                                if (stringValue) {
                                    if (stringValue.length > 17) {
                                        return `${stringValue.slice(0, 17)}...`;
                                    }
                                    return stringValue;
                                }
                                return value;
                            }
                        },
                        grid: {
                            color: context => {
                                if (
                                    props.chart.type.toLowerCase() === 'bar' ||
                                    context.index === 0
                                ) {
                                    return 'transparent';
                                }
                                return '#FFFFFF55';
                            },
                            drawBorder: false,
                            borderDash: [2, 8]
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            color: 'white',
                            text: ['bar'].includes(
                                props.chart.type.toLowerCase()
                            )
                                ? chartConfig?.element_sort_values
                                    ? chartConfig?.element_sort_values
                                    : 'frequency'
                                : getAxisTitle()
                        },
                        display: props.isExpanded,
                        ticks: {
                            color: 'white',
                            diplay: props.isExpanded,
                            callback: function (value, index, ticks) {
                                const stringValue =
                                    this.getLabelForValue(value);
                                if (stringValue) {
                                    if (stringValue.length > 17) {
                                        return `${stringValue.slice(0, 17)}...`;
                                    }
                                    return stringValue;
                                }
                                return value;
                            }
                        },
                        grid: {
                            color: context => {
                                if (
                                    props.chart.type.toLowerCase() ===
                                        'vertical bar' ||
                                    context.index === 0
                                ) {
                                    return 'transparent';
                                }
                                return '#FFFFFF55';
                            },
                            drawBorder: false,
                            borderDash: [2, 8]
                        }
                    }
                },
                dataset: [
                    {
                        border: { radius: 10 }
                    }
                ],
                maxBarThickness: 22,
                borderRadius: 4,
                borderSkipped: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display:
                            props.chart.type.toLowerCase() === 'grouped bar' &&
                            props.isExpanded &&
                            data.datasets &&
                            data.datasets.length <= 10,
                        labels: {
                            usePointStyle: true,
                            generateLabels: chart => {
                                const datasets = chart.data.datasets;
                                return datasets.map((data, i) => {
                                    let label = data.label;

                                    if (data.label.length > 25) {
                                        label = `${data.label.slice(0, 25)}...`;
                                    }

                                    return {
                                        text: label,
                                        fillStyle: data.backgroundColor,
                                        index: i,
                                        pointStyle: 'rectRounded'
                                    };
                                });
                            }
                        }
                    },
                    ...getPluginOptions(),
                    datalabels: {
                        display: false
                    }
                }
            }}
        />
    );
}
BarChart.propTypes = {
    demoData: PropTypes.any,
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool
};

BarChart.defaultProps = {
    isExpanded: false,
    isExample: false
};

export default observer(BarChart);
