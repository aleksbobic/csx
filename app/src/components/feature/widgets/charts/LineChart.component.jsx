import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { useEffect, useRef, useState } from 'react';
import { getElementAtEvent, Line } from 'react-chartjs-2';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function LineChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);

    const [data, setData] = useState(null);

    const [chartConfig, setChartConfig] = useState(
        store.stats.activeWidgets.find(
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

    const getElementProperties = useCallback(chart => {
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
    }, []);

    const getChartData = useCallback(
        chart => {
            if (!chart) {
                return null;
            }

            let data = null;
            const elementProperty = getElementProperties(chart);
            const anchor_properties = store.core.isOverview
                ? store.overviewSchema.anchorProperties
                : [];

            if (chart.elements === 'nodes') {
                if (
                    elementProperty.type === 'advanced' &&
                    !anchor_properties.includes(elementProperty.prop)
                ) {
                    return data;
                }

                data = store.stats.getNodeCounts(
                    elementProperty,
                    chart.type,
                    chart.display_limit,
                    chart.network_data,
                    null,
                    chart.show_only,
                    chart.element_sort_values
                );

                if (!data.labels.length) {
                    return data;
                }

                return {
                    ...data,
                    datasets: [
                        {
                            ...data.datasets[0],
                            fill: true,
                            backgroundColor: function (context) {
                                if (!context.chart.chartArea) {
                                    return 'transparent';
                                }
                                const gradient =
                                    context.chart.ctx.createLinearGradient(
                                        0,
                                        context.chart.chartArea.top,
                                        0,
                                        context.chart.chartArea.bottom
                                    );

                                gradient.addColorStop(0, '#3182CE99');
                                gradient.addColorStop(1, '#3182CE01');
                                return gradient;
                            },
                            borderColor: '#3182CE',
                            borderWidth: 2,
                            pointBackgroundColor: '#3182CE',
                            pointRadius: props.isExpanded ? 3 : 0
                        }
                    ]
                };
            }

            data = store.stats.getEdgeCounts(
                elementProperty,
                chart.type,
                chart.display_limit,
                null,
                chart.network_data
            );

            if (!data.labels.length) {
                return data;
            }

            return {
                ...data,
                datasets: [
                    {
                        ...data.datasets[0],
                        fill: true,
                        backgroundColor: function (context) {
                            if (!context.chart.chartArea) {
                                return 'transparent';
                            }
                            const gradient =
                                context.chart.ctx.createLinearGradient(
                                    0,
                                    context.chart.chartArea.top,
                                    0,
                                    context.chart.chartArea.bottom
                                );

                            gradient.addColorStop(0, '#3182CE99');
                            gradient.addColorStop(1, '#3182CE01');
                            return gradient;
                        },
                        borderColor: '#3182CE',
                        borderWidth: 2,
                        pointBackgroundColor: '#3182CE',
                        pointRadius: props.isExpanded
                            ? function () {
                                  if (data.labels.length > 10) {
                                      return 2;
                                  }
                                  return 3;
                              }
                            : 0
                    }
                ]
            };
        },
        [
            getElementProperties,
            props.isExpanded,
            store.core.isOverview,
            store.overviewSchema.anchorProperties,
            store.stats
        ]
    );

    useEffect(() => {
        if (props.demoData) {
            setData({
                ...props.demoData,
                datasets: [
                    {
                        ...props.demoData.datasets[0],
                        fill: true,
                        backgroundColor: function (context) {
                            if (!context.chart.chartArea) {
                                return 'transparent';
                            }
                            const gradient =
                                context.chart.ctx.createLinearGradient(
                                    0,
                                    context.chart.chartArea.top,
                                    0,
                                    context.chart.chartArea.bottom
                                );

                            gradient.addColorStop(0, '#3182CE99');
                            gradient.addColorStop(1, '#3182CE01');
                            return gradient;
                        },
                        borderColor: '#3182CE',
                        borderWidth: 2,
                        pointBackgroundColor: '#3182CE',
                        pointRadius: props.isExpanded ? 3 : 0
                    }
                ]
            });
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
        getChartData,
        props.isExpanded
    ]);

    const getPluginOptions = () => {
        const pluginOptions = {};

        let propsInChart = '';

        switch (props.chart.element_values) {
            case 'values':
                propsInChart =
                    props.chart.elements === 'nodes'
                        ? props.chart.show_only !== 'all'
                            ? props.chart.show_only
                            : 'Node value'
                        : 'Edge value';
                break;
            case 'types':
                propsInChart =
                    props.chart.elements === 'nodes'
                        ? 'Node feature'
                        : 'Edge feature';
                break;
            default:
                propsInChart =
                    props.chart.elements === 'nodes'
                        ? props.chart.element_values
                        : 'Edge weight';
                break;
        }

        pluginOptions.tooltip = {
            displayColors: false,
            callbacks: {
                title: tooltipItem => {
                    return `${propsInChart}:${
                        tooltipItem[0].label.length > 10 ? '\n' : ' '
                    }${tooltipItem[0].label}`;
                },
                label: tooltipItem => {
                    return `${chartConfig.element_sort_values}: ${tooltipItem.formattedValue}`;
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

    const getAxisTitle = () => {
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

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={[
                    'item type',
                    'second axis',
                    'main axis',
                    'item state',
                    'item count',
                    'visible types'
                ]}
                mainAxis={'X'}
            />
        );
    }

    if (!data || data.labels.length === 0) {
        return <WidgetAlert size={props.isExpanded ? 'md' : 'sm'} />;
    }

    return (
        <Line
            style={{ maxWidth: '100%' }}
            ref={chartRef}
            data={{ ...data }}
            height="250px"
            key={`chart_instance_${props.chartIndex}_${Math.random()}`}
            redraw
            onClick={event => {
                if (!props.isExample) {
                    let dataIndex;

                    try {
                        const { index } = getElementAtEvent(
                            chartRef.current,
                            event
                        )[0];
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

                        visibleNodeIds =
                            store.graphInstance.filterNodesWithValue(
                                data.nodeProperty,
                                data.labels[dataIndex]
                            );
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
                                data.labels[dataIndex]
                            );
                    }

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
                devicePixelRatio: 2,
                layout: {
                    padding: {
                        right: props.isExpanded ? 5 : 0,
                        top: props.isExpanded ? 5 : 0,
                        bottom: props.isExpanded ? 5 : 0,
                        left: props.isExpanded ? 5 : 0
                    }
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
                            text: chartConfig.element_sort_values
                        },
                        display: props.isExpanded,
                        beginAtZero: true,
                        ticks: {
                            color: 'white',
                            diplay: props.isExpanded,

                            callback: function (value, index, ticks) {
                                const stringValue =
                                    this.getLabelForValue(value);
                                if (stringValue.length > 17) {
                                    return `${stringValue.slice(0, 17)}...`;
                                } else {
                                    return stringValue;
                                }
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
                            text: getAxisTitle()
                        },
                        display: props.isExpanded,
                        ticks: {
                            color: 'white',
                            diplay: props.isExpanded,
                            beginAtZero: true,
                            callback: function (value, index, ticks) {
                                const stringValue =
                                    this.getLabelForValue(value);
                                if (stringValue.length > 17) {
                                    return `${stringValue.slice(0, 17)}...`;
                                } else {
                                    return stringValue;
                                }
                            }
                        },
                        grid: {
                            display: false,
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
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: false
                    },
                    datalabels: {
                        display: false
                    },
                    ...getPluginOptions()
                }
            }}
        />
    );
}

LineChart.propTypes = {
    demoData: PropTypes.any,
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool
};

LineChart.defaultProps = {
    isExpanded: false,
    isExample: false
};

export default observer(LineChart);
