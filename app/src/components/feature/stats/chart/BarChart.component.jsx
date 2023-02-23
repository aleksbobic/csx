import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import {
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip as ChartJSTooltip
} from 'chart.js';

import { Heading, Text, useColorMode, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Chart as ChartReactCharts, getElementAtEvent } from 'react-chartjs-2';

function BarChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const { colorMode } = useColorMode();
    const [data, setData] = useState(null);

    useEffect(() => {
        ChartJS.register(
            ChartJSTooltip,
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Legend,
            BarController
        );
    });

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
            setData(props.demoData);
        } else {
            let elementProperty;
            let groupBy;

            if (props.chart.type.toLowerCase() === 'grouped bar') {
                if (props.chart.elements === 'nodes') {
                    switch (props.chart.group_by) {
                        case 'values':
                            groupBy = { type: 'basic', prop: 'label' };
                            break;
                        case 'types':
                            groupBy = { type: 'basic', prop: 'feature' };
                            break;
                        default:
                            groupBy = {
                                type: 'advanced',
                                prop: props.chart.group_by
                            };
                            break;
                    }
                } else {
                    switch (props.chart.group_by) {
                        case 'values':
                            groupBy = { type: 'advanced', prop: 'label' };
                            break;
                        case 'types':
                            groupBy = { type: 'advanced', prop: 'feature' };
                            break;
                        default:
                            groupBy = {
                                type: 'basic',
                                prop: props.chart.group_by
                            };
                            break;
                    }
                }
            }

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
                    setData(
                        store.stats.getNodeCounts(
                            elementProperty,
                            props.chart.type,
                            props.elementDisplayLimit,
                            props.networkData,
                            groupBy,
                            props.chart.show_only
                        )
                    );
                }
            } else {
                setData(
                    store.stats.getEdgeCounts(
                        elementProperty,
                        props.chart.type,
                        props.elementDisplayLimit,
                        groupBy,
                        props.networkData
                    )
                );
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
        store.overviewSchema.anchorProperties
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
                                ? 'Frequency'
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
                                ? 'Frequency'
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
                            pointStyle: 'rectRounded'
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
    title: PropTypes.string,
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    options: PropTypes.object,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool,
    networkData: PropTypes.string,
    elementDisplayLimit: PropTypes.number
};

BarChart.defaultProps = {
    isExpanded: false,
    isExample: false,
    networkData: 'all',
    elementDisplayLimit: 10
};

export default observer(BarChart);
