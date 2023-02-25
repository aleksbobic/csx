import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { Heading, Text, useColorMode, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { getElementAtEvent, Line } from 'react-chartjs-2';

function LineChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const { colorMode } = useColorMode();
    const [data, setData] = useState(null);

    useEffect(() => {
        if (store.comment.chartToAttach === props.chart.id) {
            store.comment.attachChart(
                chartRef.current.toBase64Image('image/octet-stream', 1.0)
            );
            store.comment.setChartToAttach(null);
        }
    }, [props.chart.id, store.comment.chartToAttach]);

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
                        pointRadius: props.isExpanded ? 4 : 0
                    }
                ]
            });
        } else {
            let elementProperty;
            let groupBy;

            switch (props.chart.element_values) {
                case 'values':
                    elementProperty =
                        props.chart.elements === 'nodes'
                            ? { type: 'basic', prop: 'label' }
                            : { type: 'advanced', prop: 'label' };
                    break;
                case 'types':
                    elementProperty =
                        props.chart.elements === 'nodes'
                            ? { type: 'basic', prop: 'feature' }
                            : { type: 'advanced', prop: 'feature' };
                    break;
                case 'degree':
                    elementProperty = { type: 'basic', prop: 'degree' };
                    break;
                default:
                    elementProperty =
                        props.chart.elements === 'nodes'
                            ? {
                                  type: 'advanced',
                                  prop: props.chart.element_values
                              }
                            : { type: 'basic', prop: 'weight' };
                    break;
            }
            const anchor_properties =
                store.core.currentGraph === 'overview'
                    ? store.overviewSchema.anchorProperties
                    : [];

            if (props.chart.elements === 'nodes') {
                if (
                    elementProperty.type === 'advanced' &&
                    !anchor_properties.includes(elementProperty.prop)
                ) {
                    setData(null);
                } else {
                    const nodeData = store.stats.getNodeCounts(
                        elementProperty,
                        props.chart.type,
                        props.elementDisplayLimit,
                        props.networkData,
                        groupBy,
                        props.chart.show_only
                    );

                    if (nodeData.labels.length > 0) {
                        setData({
                            ...nodeData,
                            datasets: [
                                {
                                    ...nodeData.datasets[0],
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
                        setData(nodeData);
                    }
                }
            } else {
                const edgeData = store.stats.getEdgeCounts(
                    elementProperty,
                    props.chart.type,
                    props.elementDisplayLimit,
                    groupBy,
                    props.networkData
                );

                if (edgeData.labels.length > 0) {
                    setData({
                        ...edgeData,
                        datasets: [
                            {
                                ...edgeData.datasets[0],
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
                                    ? function (context) {
                                          if (edgeData.labels.length > 10) {
                                              return 2;
                                          }
                                          return 3;
                                      }
                                    : 0
                            }
                        ]
                    });
                } else {
                    setData(edgeData);
                }
            }
        }
    }, [
        props.chart.element_values,
        props.chart.elements,
        props.chart.groupBy,
        props.chart.network_data,
        props.chart.onlyVisible,
        props.chart.show_only,
        props.chart.type,
        props.demoData,
        store.stats,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents,
        props.elementDisplayLimit,
        props.networkData,
        props.chart.group_by,
        store.core.currentGraph,
        store.overviewSchema.anchorProperties,
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
                    return `Frequency: ${tooltipItem.formattedValue}`;
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

    const getChartType = () => {
        switch (props.chart.type.toLowerCase()) {
            case 'vertical bar':
            case 'grouped bar':
            case 'histogram':
                return 'bar';
            default:
                return props.chart.type.toLowerCase();
        }
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

    if (!data || data.labels.length === 0) {
        return (
            <VStack
                height="100%"
                width="100%"
                spacing={1}
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.200' : 'blackAlpha.800'
                }
                borderRadius="6px"
                justifyContent="center"
                padding="20%"
            >
                <Heading size="md" opacity="0.5">
                    NO DATA
                </Heading>
                {props.networkData === 'selected' && props.isExpanded && (
                    <Text
                        textAlign="center"
                        fontSize="sm"
                        fontWeight="bold"
                        opacity="0.5"
                    >
                        Select some nodes to see details here! 😉
                    </Text>
                )}
            </VStack>
        );
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
                            text: 'Frequency'
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
                        display: props.chart.legend
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
    title: PropTypes.string,
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    options: PropTypes.object,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool,
    networkData: PropTypes.string,
    elementDisplayLimit: PropTypes.number
};

LineChart.defaultProps = {
    isExpanded: false,
    isExample: false,
    networkData: 'all',
    elementDisplayLimit: 10
};

export default observer(LineChart);
