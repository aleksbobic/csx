import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

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
    Tooltip as ChartJSTooltip
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { Heading, Text, useColorMode, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Chart as ChartReactCharts, getElementAtEvent } from 'react-chartjs-2';

function Chart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const { colorMode } = useColorMode();
    const [data, setData] = useState(null);

    useEffect(() => {
        ChartJS.register(
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
            ChartDataLabels
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
                            groupBy = { type: 'advanced', prop: groupBy };
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
                            groupBy = { type: 'basic', prop: groupBy };
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

    const getAnchorLabelAlignForChart = () => {
        switch (props.chart.type) {
            case 'Bar':
                return 'end';
            case 'Vertical Bar':
            case 'doughnut':
                return 'center';
            case 'Grouped Bar':
            case 'Line':
                return 'end';
            default:
                return 'end';
        }
    };

    const getLabelAlignForChart = () => {
        switch (props.chart.type) {
            case 'Bar':
                return 'center';
            case 'Vertical Bar':
            case 'doughnut':
            case 'Grouped Bar':
            case 'Line':
                return 'end';
            default:
                return 'end';
        }
    };

    const getPluginOptions = () => {
        const pluginOptions = {};

        if (props.chart.hoverLabel) {
            pluginOptions.tooltip = {
                callbacks: {
                    label: tooltipItem => {
                        if (props.chart.groupHoverLabel) {
                            return `${props.chart.groupHoverLabel}: ${tooltipItem.dataset.label}`;
                        }

                        return `${props.chart.hoverLabel}: ${tooltipItem.label}`;
                    },
                    afterLabel: tooltipItem => {
                        return `Frequency: ${tooltipItem.formattedValue}`;
                    }
                }
            };
        } else {
            pluginOptions.tooltip = {
                callbacks: {
                    label: tooltipItem => tooltipItem.label,
                    afterLabel: tooltipItem => {
                        return `Frequency: ${tooltipItem.formattedValue}`;
                    }
                }
            };
        }

        if (props.chart.type === 'Bar') {
            pluginOptions.datalabels = {
                display:
                    props.isExpanded &&
                    [10, -10].includes(props.elementDisplayLimit)
                        ? 'auto'
                        : false,
                color: 'white',
                offset: -60,
                clamp: true,
                labels: {
                    value: {
                        anchor: 'end',
                        align: 'end',
                        color: 'black',
                        backgroundColor: 'white',
                        borderRadius: 10,
                        padding: {
                            left: 7,
                            right: 7,
                            top: 4,
                            bottom: 4
                        },
                        formatter: (value, context) => {
                            let name =
                                context.chart.data.labels[context.dataIndex];
                            if (name && name.length > 15) {
                                return `${name.slice(0, 15)}...: ${value}`;
                            } else {
                                return `${name}: ${value}`;
                            }
                        }
                    }
                    // name: {
                    //     anchor: 'center',
                    //     align: 'center',
                    //     color: 'white',
                    //     fontWeight: 'bold',
                    //     backgroundColor: 'transparent',
                    //     formatter: (value, context) => {
                    //         return `${
                    //             context.chart.data.labels[context.dataIndex]
                    //         }`;
                    //     }
                    // }
                }
            };
        } else if (props.chart.type === 'Line') {
            pluginOptions.datalabels = {
                display: props.isExpanded ? 'auto' : false,
                color: 'white',
                anchor: 'start',
                align: 'start',
                offset: store.core.rightPanelWidth === 600 ? -10 : -46,
                font: {
                    weight: 'bold'
                },
                formatter: (value, context) => {
                    let name = context.chart.data.labels[context.dataIndex];
                    if (name?.length > 15) {
                        return `${name.slice(0, 15)}... : ${value}`;
                    } else {
                        return `${name}: ${value}`;
                    }
                },
                labels: {
                    value: {
                        color: 'black',
                        backgroundColor: 'white',
                        borderRadius: 4
                    }
                }
            };
        } else {
            pluginOptions.datalabels = {
                display: props.isExpanded ? 'auto' : false,
                color: 'white',
                anchor: getAnchorLabelAlignForChart(),
                align: getLabelAlignForChart(),
                offset: store.core.rightPanelWidth === 600 ? -10 : -46,
                clamp: true,
                font: {
                    weight: 'bold'
                },
                formatter: (value, context) => {
                    let name = context.chart.data.labels[context.dataIndex];
                    if (name?.length > 15) {
                        return `${name.slice(0, 15)}... : ${value}`;
                    } else {
                        return `${name}: ${value}`;
                    }
                },
                labels: {
                    value: {
                        color: 'black',
                        backgroundColor: 'white',
                        borderRadius: 4
                    }
                }
            };
        }

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
        <ChartReactCharts
            style={{ maxWidth: '100%' }}
            ref={chartRef}
            type={getChartType()}
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
                indexAxis: props.chart.type.toLowerCase() === 'bar' && 'y',
                layout: {
                    padding:
                        props.chart.type === 'Line'
                            ? props.isExpanded
                                ? 40
                                : 5
                            : {
                                  y: props.isExpanded ? 20 : 5,
                                  left: props.isExpanded ? 20 : 5,
                                  right: props.isExpanded
                                      ? props.chart.type === 'Bar'
                                          ? 50
                                          : 20
                                      : 5
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
                        display: props.chart.labels.y.display,
                        ticks: {
                            diplay: props.chart.labels.y.display
                        },
                        gridLines: {
                            display: false
                        }
                    },
                    x: {
                        display: props.chart.labels.x.display,
                        ticks: {
                            diplay: props.chart.labels.x.display
                        },
                        gridLines: {
                            display: false
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
                    ...getPluginOptions()
                }
            }}
        />
    );
}
Chart.propTypes = {
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

Chart.defaultProps = {
    isExpanded: false,
    isExample: false,
    networkData: 'all',
    elementDisplayLimit: 10
};

export default observer(Chart);
