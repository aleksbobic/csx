import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { Heading, Text, useColorMode, VStack } from '@chakra-ui/react';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { useEffect, useRef, useState } from 'react';
import { Radar } from 'react-chartjs-2';

function RadarChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const { colorMode } = useColorMode();
    const [data, setData] = useState(null);
    const [tooManySelectedElements, setTooManySelectedElements] =
        useState(false);

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
                store.graph.currentGraphData.selectedNodes.length > 8 ||
                store.graph.currentGraphData.selectedComponents.length > 8
            ) {
                setTooManySelectedElements(true);
                setData(null);
                return;
            }

            setTooManySelectedElements(false);

            let data;
            if (props.radarDisplayElement === 'nodes') {
                data = store.stats.getRadarNodes();
            } else {
                data = store.stats.getRadarComponents();
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
        props.radarDisplayElement,
        tooManySelectedElements
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

    if ((!data || data.labels.length === 0) && !tooManySelectedElements) {
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

    if (tooManySelectedElements) {
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
                    TOO MANY DATAPOINTS
                </Heading>
                {props.isExpanded && (
                    <Text
                        textAlign="center"
                        fontSize="sm"
                        fontWeight="bold"
                        opacity="0.5"
                    >
                        Please select fever elements to get useful insights from
                        this chart! 😉
                    </Text>
                )}
            </VStack>
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
                            display: props.isExpanded || props.isExample,
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
    radarDisplayElement: PropTypes.string
};

RadarChart.defaultProps = {
    isExpanded: false,
    isExample: false,
    networkData: 'all',
    elementDisplayLimit: 10
};

export default observer(RadarChart);
