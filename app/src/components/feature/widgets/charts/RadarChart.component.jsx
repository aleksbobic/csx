import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import {
    Center,
    Checkbox,
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
import { schemeTableau10 } from 'd3-scale-chromatic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import WidgetAlert from '../WidgetAlert.component';

function RadarChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const { colorMode } = useColorMode();
    const [chartElement, setChartElement] = useState(props.chart.elements);
    const [data, setData] = useState(null);
    const [title, setTitle] = useState(props.title);
    const [tooManySelectedElements, setTooManySelectedElements] =
        useState(false);
    const [properties, setProperties] = useState([]);
    const [categoricalProperties, setCategoricalProperties] = useState({});

    const [visibleNodeProperties, setVisibleNodeProperties] = useState(
        props.chart.visible_node_properties
            ? props.chart.visible_node_properties
            : ['Neighbours', 'Documents', 'Links']
    );

    useEffect(() => {
        if (store.core.isDetail) {
            setCategoricalProperties(
                store.stats.getRadarDetailNodeProperties()
            );
        } else {
            setCategoricalProperties(
                store.stats.getRadarOverviewNodeProperties()
            );
        }
    }, [store.core.isDetail, store.stats, store.graph.currentGraphData]);

    useEffect(() => {
        setProperties(
            Object.keys(categoricalProperties)
                .map(key => categoricalProperties[key])
                .flat()
        );
    }, [categoricalProperties]);

    useEffect(() => {
        if (store.comment.chartToAttach === props.chart.id) {
            store.comment.attachChart(
                chartRef.current.toBase64Image('image/octet-stream', 1.0)
            );
            store.comment.setChartToAttach(null);
        }
    }, [props.chart.id, store.comment, store.comment.chartToAttach]);

    const getVisibleCategoricalProperties = useCallback(() => {
        const visibleCategoricalProperties = {};

        Object.keys(categoricalProperties).forEach(key => {
            visibleCategoricalProperties[key] = categoricalProperties[
                key
            ].filter(property => visibleNodeProperties.includes(property));
        });

        return visibleCategoricalProperties;
    }, [categoricalProperties, visibleNodeProperties]);

    useEffect(() => {
        if (props.demoData) {
            setData({
                ...props.demoData,
                datasets: props.demoData.datasets.map((dataset, index) => {
                    return {
                        ...dataset,
                        fill: true,
                        backgroundColor: () => {
                            return `${schemeTableau10[index]}22`;
                        },
                        borderColor: schemeTableau10[index],
                        borderWidth: 1,
                        pointBackgroundColor: () => {
                            return schemeTableau10[index];
                        },
                        pointRadius: 2
                    };
                })
            });
        } else {
            if (
                (chartElement === 'nodes' &&
                    store.graph.currentGraphData.selectedNodes.length > 8) ||
                (chartElement === 'components' &&
                    store.graph.currentGraphData.selectedComponents.length > 8)
            ) {
                setTooManySelectedElements(true);
                setData(null);
                return;
            }

            setTooManySelectedElements(false);

            let data;
            const visibleProperties = getVisibleCategoricalProperties();

            if (chartElement === 'nodes') {
                if (store.core.isDetail) {
                    data = store.stats.getRadarDetailNodes(visibleProperties);
                } else {
                    data = store.stats.getRadarOverviewNodes(visibleProperties);
                }
            } else {
                if (store.core.isDetail) {
                    data = store.stats.getRadarDetailComponents();
                } else {
                    data = store.stats.getRadarOverviewComponents();
                }
            }

            if (!data) {
                setData(null);
            } else {
                setData({
                    ...data,
                    datasets: data.datasets.map((dataset, index) => {
                        return {
                            ...dataset,
                            fill: true,
                            backgroundColor: () => {
                                return `${schemeTableau10[index]}22`;
                            },
                            borderColor: schemeTableau10[index],
                            borderWidth: 1,
                            pointBackgroundColor: () => {
                                return schemeTableau10[index];
                            },
                            pointRadius: 2
                        };
                    })
                });
            }
        }
    }, [
        chartElement,
        getVisibleCategoricalProperties,
        props.demoData,
        store.core.isDetail,
        store.graph.currentGraphData.selectedComponents.length,
        store.graph.currentGraphData.selectedNodes.length,
        store.stats
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
                                    <option value="components">
                                        Components
                                    </option>
                                </Select>
                            </HStack>
                            <Heading
                                size="xs"
                                opacity="0.5"
                                width="100%"
                                style={{ marginTop: '10px' }}
                            >
                                Visible Node Properties
                            </Heading>

                            <VStack
                                alignItems="flex-start"
                                spacing="5px"
                                width="100%"
                                backgroundColor="whiteAlpha.100"
                                borderRadius="4px"
                                padding="16px"
                            >
                                {properties.map(entry => (
                                    <Checkbox
                                        defaultChecked={visibleNodeProperties.includes(
                                            entry
                                        )}
                                        isDisabled={
                                            (visibleNodeProperties.includes(
                                                entry
                                            ) &&
                                                visibleNodeProperties.length ===
                                                    3) ||
                                            chartElement === 'components'
                                        }
                                        size="sm"
                                        key={`radar_node_${entry}`}
                                        onChange={event => {
                                            if (event.target.checked) {
                                                setVisibleNodeProperties([
                                                    ...visibleNodeProperties,
                                                    entry
                                                ]);
                                                store.stats.setWidgetProperty(
                                                    props.chart.id,
                                                    'visible_node_properties',
                                                    [
                                                        ...visibleNodeProperties,
                                                        entry
                                                    ]
                                                );
                                            } else {
                                                visibleNodeProperties.splice(
                                                    visibleNodeProperties.indexOf(
                                                        entry
                                                    ),
                                                    1
                                                );
                                                setVisibleNodeProperties([
                                                    ...visibleNodeProperties
                                                ]);
                                                store.stats.setWidgetProperty(
                                                    props.chart.id,
                                                    'visible_node_properties',
                                                    [...visibleNodeProperties]
                                                );
                                            }
                                        }}
                                    >
                                        {entry}
                                    </Checkbox>
                                ))}
                            </VStack>
                        </VStack>
                    </CustomScroll>
                </VStack>
            </Center>
        );
    }

    if ((!data || data.labels.length === 0) && !tooManySelectedElements) {
        return <WidgetAlert size={props.isExpanded ? 'md' : 'sm'} />;
    }

    if (tooManySelectedElements) {
        return (
            <WidgetAlert
                title="TOO MANY DATAPOINTS"
                message="Please select fever elements to get useful insights from this chart! 😉"
                size={props.isExpanded ? 'md' : 'sm'}
            />
        );
    }

    return (
        <Radar
            style={{ maxWidth: '100%' }}
            ref={chartRef}
            data={{ ...data }}
            height="250px"
            key={`chart_instance_${props.chartIndex}_${Math.random()}`}
            redraw
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
                    event.native.target.style.cursor = 'default';
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            display: props.isExpanded || props.isExample,
                            color: '#FFFFFF85',
                            backdropColor: 'transparent'
                        },
                        pointLabels: {
                            display: props.isExpanded || props.isExample,
                            color: 'white'
                        },
                        angleLines: {
                            display: props.isExpanded || props.isExample,
                            color: '#FFFFFF33'
                        },
                        grid: {
                            display: true,
                            color: '#FFFFFF33',
                            circular: true
                        }
                    },
                    y: {
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: props.isExpanded || props.isExample,
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
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

RadarChart.propTypes = {
    demoData: PropTypes.any,
    title: PropTypes.string,
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    options: PropTypes.object,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool,
    networkData: PropTypes.string,
    elementDisplayLimit: PropTypes.number,
    settingsMode: PropTypes.bool
};

RadarChart.defaultProps = {
    isExpanded: false,
    isExample: false,
    networkData: 'all',
    elementDisplayLimit: 10,
    settingsMode: false
};

export default observer(RadarChart);
