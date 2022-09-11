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
    Tooltip as ChartJSTooltip
} from 'chart.js';

import { Heading, Text, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Chart as ChartReactCharts, getElementAtEvent } from 'react-chartjs-2';

function Chart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
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
            LineElement
        );
    });

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

            setData(
                props.chart.elements === 'nodes'
                    ? store.stats.getNodeCounts(
                          elementProperty,
                          props.chart.type,
                          props.elementDisplayLimit,
                          props.networkData,
                          groupBy,
                          props.chart.show_only
                      )
                    : store.stats.getEdgeCounts(
                          elementProperty,
                          props.chart.type,
                          props.elementDisplayLimit,
                          groupBy,
                          props.networkData
                      )
            );
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
        store.graphInstance.visibleComponent,
        props.elementDisplayLimit,
        props.networkData,
        props.chart.group_by
    ]);

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
                        return `Frequnecy: ${tooltipItem.formattedValue}`;
                    }
                }
            };
        } else {
            pluginOptions.tooltip = {
                callbacks: {
                    label: tooltipItem => tooltipItem.label,
                    afterLabel: tooltipItem => {
                        return `Frequnecy: ${tooltipItem.formattedValue}`;
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
                return 'bar';
            default:
                return props.chart.type.toLowerCase();
        }
    };

    if (!data || data.labels.length === 0) {
        return (
            <VStack
                overflowY="scroll"
                height="100%"
                width="100%"
                spacing={1}
                backgroundColor="blackAlpha.800"
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
                    const { index } = getElementAtEvent(
                        chartRef.current,
                        event
                    )[0];

                    let visibleNodeIds;

                    if ('nodeProperty' in data) {
                        visibleNodeIds =
                            store.graphInstance.filterNodesWithValue(
                                data.nodeProperty,
                                data.labels[index]
                            );
                    } else {
                        visibleNodeIds =
                            store.graphInstance.filterEdgesWithValue(
                                data.edgeProperty,
                                data.labels[index]
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
                indexAxis: props.chart.type.toLowerCase() === 'bar' && 'y',
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
                        }
                    },
                    x: {
                        display: props.chart.labels.x.display,
                        ticks: {
                            diplay: props.chart.labels.x.display
                        }
                    }
                },
                plugins: {
                    title: {
                        display: props.isExpanded,
                        text: props.title
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
