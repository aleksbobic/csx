import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import {
    Center,
    Editable,
    EditableInput,
    EditablePreview,
    Heading,
    HStack,
    Select,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { useEffect, useRef, useState } from 'react';
import { getElementAtEvent, Line } from 'react-chartjs-2';
import ChartAlertComponent from './ChartAlert.component';

function LineChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const { colorMode } = useColorMode();
    const [data, setData] = useState(null);
    const [title, setTitle] = useState(props.title);
    const [chartElement, setChartElement] = useState(props.chart.elements);
    const [chartElementValues, setChartElementValues] = useState(
        props.chart.elements === 'nodes'
            ? store.stats.getWidgetNodeProperties()
            : store.stats.getWidgetEdgeProperties()
    );
    const [chartElementSelectedValue, setChartElementSelectedValue] = useState(
        props.chart.element_values
    );
    const [chartNetworkData, setChartNetworkData] = useState(
        props.chart.network_data
    );
    const [dispalyLimit, setDispalyLimit] = useState(
        props.chart.display_limit ? props.chart.display_limit : 10
    );

    useEffect(() => {
        if (!props.isExample) {
            if (chartElement === 'nodes') {
                setChartElementValues(store.stats.getWidgetNodeProperties());
            } else {
                setChartElementValues(store.stats.getWidgetEdgeProperties());
            }
        }
    }, [chartElement, props.chart.id, props.isExample, store.stats]);

    useEffect(() => {
        if (!props.isExample) {
            setChartElementSelectedValue(chartElementValues[0].value);

            store.stats.setWidgetProperty(
                props.chart.id,
                'element_values',
                chartElementValues[0].value
            );
        }
    }, [chartElementValues, props.chart.id, props.isExample, store.stats]);

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
                        dispalyLimit,
                        chartNetworkData,
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
                    dispalyLimit,
                    groupBy,
                    chartNetworkData
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
        props.isExpanded,
        dispalyLimit,
        chartNetworkData
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
            <Center height="100%" width="100%">
                <VStack
                    height="100%"
                    width="100%"
                    alignItems="flex-start"
                    spacing={1}
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'blackAlpha.800'
                    }
                    borderRadius="6px"
                    justifyContent="center"
                    padding="10% 20%"
                >
                    <CustomScroll
                        style={{ paddingLeft: '10px', paddingRight: '10px' }}
                    >
                        <VStack height="100%" width="100%">
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Title
                                </Heading>

                                <Editable
                                    size="xs"
                                    width="100%"
                                    value={title}
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.100'
                                            : 'blackAlpha.300'
                                    }
                                    borderRadius="5px"
                                    onChange={val => setTitle(val)}
                                    onSubmit={val => {
                                        if (val.trim()) {
                                            store.stats.setWidgetProperty(
                                                props.chart.id,
                                                'title',
                                                val.trim()
                                            );
                                            setTitle(val.trim());
                                        } else {
                                            setTitle(props.title);
                                        }
                                    }}
                                    onFocus={() =>
                                        store.comment.setCommentTrigger(false)
                                    }
                                    onBlur={() =>
                                        store.comment.setCommentTrigger(true)
                                    }
                                >
                                    <EditablePreview
                                        padding="5px 10px"
                                        fontSize="xs"
                                        color="#FFFFFFBB"
                                        backgroundColor="whiteAlpha.200"
                                        width="100%"
                                        size="xs"
                                    />
                                    <EditableInput
                                        backgroundColor="whiteAlpha.200"
                                        padding="5px 10px"
                                        fontSize="xs"
                                        width="100%"
                                        size="xs"
                                    />
                                </Editable>
                            </HStack>

                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Elements
                                </Heading>
                                <Select
                                    className="nodrag"
                                    margin="0px"
                                    variant="filled"
                                    size="xs"
                                    width="100%"
                                    defaultValue={chartElement}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setChartElement(e.target.value);

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'elements',
                                            e.target.value
                                        );
                                    }}
                                    background="whiteAlpha.200"
                                    opacity="0.8"
                                    _hover={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                    _focus={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="nodes">Nodes</option>
                                    <option value="edges">Edges</option>
                                </Select>
                            </HStack>

                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    X Axis Props
                                </Heading>
                                <Select
                                    className="nodrag"
                                    margin="0px"
                                    variant="filled"
                                    size="xs"
                                    width="100%"
                                    defaultValue={chartElementSelectedValue}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setChartElementSelectedValue(
                                            e.target.value
                                        );

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'element_values',
                                            e.target.value
                                        );
                                    }}
                                    background="whiteAlpha.200"
                                    opacity="0.8"
                                    _hover={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                    _focus={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {chartElementValues.map(entry => (
                                        <option
                                            key={`${
                                                chartElement === 'nodes'
                                                    ? 'Node'
                                                    : 'Edge'
                                            }_property_${entry.value}`}
                                            value={entry.value}
                                        >
                                            {entry.label}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Element Types
                                </Heading>
                                <Select
                                    className="nodrag"
                                    margin="0px"
                                    variant="filled"
                                    size="xs"
                                    width="100%"
                                    defaultValue={chartNetworkData}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setChartNetworkData(e.target.value);

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'network_data',
                                            e.target.value
                                        );
                                    }}
                                    background="whiteAlpha.200"
                                    opacity="0.8"
                                    _hover={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                    _focus={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="visible">Visible</option>
                                    {chartElement !== 'edges' && (
                                        <option value="selected">
                                            Selected
                                        </option>
                                    )}
                                    <option value="all">All</option>
                                </Select>
                            </HStack>
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Display Limit
                                </Heading>
                                <Select
                                    className="nodrag"
                                    margin="0px"
                                    variant="filled"
                                    size="xs"
                                    width="100%"
                                    defaultValue={dispalyLimit}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setDispalyLimit(e.target.value);

                                        console.log(dispalyLimit);
                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'display_limit',
                                            e.target.value
                                        );
                                    }}
                                    background="whiteAlpha.200"
                                    opacity="0.8"
                                    _hover={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                    _focus={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value={10}>First 10</option>
                                    <option value={50}>First 50</option>
                                    <option value={100}>First 100</option>
                                    <option value={-10}>Last 10</option>
                                    <option value={-50}>Last 50</option>
                                    <option value={-100}>Last 100</option>
                                    <option value={0}>All</option>
                                </Select>
                            </HStack>
                        </VStack>
                    </CustomScroll>
                </VStack>
            </Center>
        );
    }

    if (!data || data.labels.length === 0) {
        return <ChartAlertComponent size={props.isExpanded ? 'md' : 'sm'} />;
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
