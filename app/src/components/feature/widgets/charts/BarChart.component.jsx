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
import { Chart as ChartReactCharts, getElementAtEvent } from 'react-chartjs-2';
import ChartAlertComponent from '../WidgetAlert.component';

function BarChart(props) {
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

    const [chartElementSortValues, setChartElementSortValues] = useState(
        store.stats.getNodeSortValues()
    );
    const [chartElementSortValue, setChartElementSortValue] = useState(
        props?.chart?.element_sort_values
            ? props?.chart?.element_sort_values
            : 'frequency'
    );
    const [chartNetworkData, setChartNetworkData] = useState(
        props.chart.network_data
    );
    const [dispalyLimit, setDispalyLimit] = useState(
        props.chart.display_limit ? props.chart.display_limit : 10
    );
    const [chartGroupByValues, setChartGroupByValues] = useState(
        store.stats.getWidgetNodeProperties(true)
    );
    const [chartGroupBySelectedValue, setChartGroupBySelectedValue] = useState(
        props.chart.group_by
    );

    useEffect(() => {
        if (!props.isExample) {
            if (chartElement === 'nodes') {
                setChartElementValues(store.stats.getWidgetNodeProperties());
                setChartElementSortValues(store.stats.getNodeSortValues());
                setChartGroupByValues(
                    store.stats.getWidgetNodeProperties(true)
                );
            } else {
                setChartElementValues(store.stats.getWidgetEdgeProperties());
            }
        }
    }, [
        chartElement,
        props.chart.id,
        props.isExample,
        store.stats,
        props.settingsMode
    ]);

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
        if (!props.isExample) {
            if (
                !props?.chart?.element_sort_values ||
                !chartElementSortValues.find(
                    entry => entry.value === props?.chart?.element_sort_values
                )
            ) {
                setChartElementSortValue(chartElementSortValues[0].value);

                store.stats.setWidgetProperty(
                    props.chart.id,
                    'element_sort_values',
                    chartElementSortValues[0].value
                );
            }
        }
    }, [
        chartElementSortValues,
        props.chart?.element_sort_values,
        props.chart.id,
        props.isExample,
        store.stats,
        props.isExpanded
    ]);

    useEffect(() => {
        if (store.comment.chartToAttach === props.chart.id) {
            store.comment.attachChart(
                chartRef.current.toBase64Image('image/octet-stream', 1.0)
            );
            store.comment.setChartToAttach(null);
        }
    }, [props.chart.id, store.comment, store.comment.chartToAttach]);

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
                        case 'degree':
                            groupBy = { type: 'basic', prop: 'degree' };
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
                    setData(
                        store.stats.getNodeCounts(
                            elementProperty,
                            props.chart.type,
                            dispalyLimit,
                            chartNetworkData,
                            groupBy,
                            props.chart.show_only,
                            chartElementSortValue
                        )
                    );
                }
            } else {
                setData(
                    store.stats.getEdgeCounts(
                        elementProperty,
                        props.chart.type,
                        dispalyLimit,
                        groupBy,
                        chartNetworkData
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
        store.overviewSchema.anchorProperties,
        dispalyLimit,
        chartNetworkData,
        chartElementSortValue
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
                    return `${chartElementSortValue}: ${tooltipItem.formattedValue}`;
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
                            {props.chart.type.toLowerCase() !==
                                'grouped bar' && (
                                <HStack width="100%">
                                    <Heading
                                        size="xs"
                                        opacity="0.5"
                                        width="100%"
                                    >
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

                                            setChartElementSortValue(
                                                'frequency'
                                            );

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
                            )}
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    {props.chart.type.toLowerCase() === 'bar'
                                        ? 'Y'
                                        : 'X'}{' '}
                                    Axis Props
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
                            {props.chart.type.toLowerCase() !==
                                'grouped bar' && (
                                <HStack width="100%">
                                    <Heading
                                        size="xs"
                                        opacity="0.5"
                                        width="100%"
                                    >
                                        {props.chart.type.toLowerCase() ===
                                        'bar'
                                            ? 'X'
                                            : 'Y'}{' '}
                                        Axis Props
                                    </Heading>
                                    <Select
                                        className="nodrag"
                                        isDisabled={chartElement === 'edges'}
                                        margin="0px"
                                        variant="filled"
                                        size="xs"
                                        width="100%"
                                        defaultValue={chartElementSortValue}
                                        borderRadius="5px"
                                        onChange={e => {
                                            setChartElementSortValue(
                                                e.target.value
                                            );

                                            store.stats.setWidgetProperty(
                                                props.chart.id,
                                                'element_sort_values',
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
                                        {chartElementSortValues.map(entry => (
                                            <option
                                                key={`${
                                                    chartElement === 'nodes'
                                                        ? 'Node'
                                                        : 'Edge'
                                                }_sort_property_${entry.value}`}
                                                value={entry.value}
                                            >
                                                {entry.label}
                                            </option>
                                        ))}
                                    </Select>
                                </HStack>
                            )}
                            {props.chart.type.toLowerCase() ===
                                'grouped bar' && (
                                <HStack width="100%">
                                    <Heading
                                        size="xs"
                                        opacity="0.5"
                                        width="100%"
                                    >
                                        Group By
                                    </Heading>
                                    <Select
                                        className="nodrag"
                                        margin="0px"
                                        variant="filled"
                                        size="xs"
                                        width="100%"
                                        defaultValue={chartGroupBySelectedValue}
                                        borderRadius="5px"
                                        onChange={e => {
                                            setChartGroupBySelectedValue(
                                                e.target.value
                                            );

                                            store.stats.setWidgetProperty(
                                                props.chart.id,
                                                'group_by',
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
                                        {chartGroupByValues.map(entry => (
                                            <option
                                                key={`Node_group_by_property_${entry.value}`}
                                                value={entry.value}
                                            >
                                                {entry.label}
                                            </option>
                                        ))}
                                    </Select>
                                </HStack>
                            )}
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
                                ? chartElementSortValue
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
                                ? chartElementSortValue
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
