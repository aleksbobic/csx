import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { useEffect, useRef, useState } from 'react';
import { Chart as ChartReactCharts, getElementAtEvent } from 'react-chartjs-2';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function DoughnutChart({
    isExpanded = false,
    isExample = false,
    demoData,
    chart,
    chartIndex,
    settingsMode
}) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const [data, setData] = useState(null);

    const [chartConfig, setChartConfig] = useState(
        store.stats?.activeWidgets?.find(widget => widget.id === chart.id) || {}
    );

    useEffect(() => {
        if (store.comment.chartToAttach === chart.id) {
            store.comment.attachChart(
                chartRef.current.toBase64Image('image/octet-stream', 1.0)
            );
            store.comment.setChartToAttach(null);
        }
    }, [chart.id, store.comment, store.comment.chartToAttach]);

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

            const elementProperty = getElementProperties(chart);
            const anchor_properties =
                store.core.currentGraph === 'overview'
                    ? store.overviewSchema.anchorProperties
                    : [];

            if (chart.elements === 'edges') {
                return store.stats.getEdgeCounts(
                    elementProperty,
                    chart.type,
                    chart.display_limit,
                    null,
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
                null,
                chart.show_only
            );
        },
        [
            getElementProperties,
            store.core.currentGraph,
            store.overviewSchema.anchorProperties,
            store.stats
        ]
    );

    useEffect(() => {
        if (demoData) {
            setData(demoData);
        } else if (chart) {
            const chartObject = store.stats.activeWidgets.find(
                widget => widget.id === chart.id
            );

            setChartConfig(chartObject);
            setData(getChartData(chartObject));
        }
    }, [
        getChartData,
        chart,
        demoData,
        store.stats.activeWidgets,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents,
        store.core.isOverview
    ]);

    const getPluginOptions = () => {
        const pluginOptions = {};

        let propsInChart = '';

        switch (chartConfig.element_values) {
            case 'values':
                propsInChart =
                    chartConfig.elements === 'nodes'
                        ? chartConfig.show_only !== 'all'
                            ? chartConfig.show_only
                            : 'Node value'
                        : 'Edge value';
                break;
            case 'types':
                propsInChart =
                    chartConfig.elements === 'nodes'
                        ? 'Node feature'
                        : 'Edge feature';
                break;
            default:
                propsInChart =
                    chartConfig.elements === 'nodes'
                        ? chartConfig.element_values
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

        pluginOptions.datalabels = {
            display: isExpanded ? 'auto' : false,
            color: 'white',
            anchor: 'center',
            align: 'end',
            offset: store.core.rightPanelWidth === 600 ? -10 : -46,
            clamp: true,
            font: {
                weight: 'bold'
            },
            formatter: (value, context) => {
                let name = context.chart.data.labels[context.dataIndex];
                if (name?.length > 18) {
                    return `${
                        propsInChart === 'Edge weight' ? 'Edge weight: ' : ''
                    }${name.slice(0, 15)}... \nFrequency: ${value}`;
                } else {
                    return `${
                        propsInChart === 'Edge weight' ? 'Edge weight: ' : ''
                    }${name}\nFrequency: ${value}`;
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

        return pluginOptions;
    };

    if (settingsMode && isExpanded) {
        return (
            <WidgetSettings
                widgetID={chart.id}
                settings={[
                    'item type',
                    'main axis',
                    'item state',
                    'item count',
                    store.core.isDetail && 'visible types'
                ]}
            />
        );
    }

    if (!data || data.labels.length === 0) {
        return <WidgetAlert size={isExpanded ? 'md' : 'sm'} />;
    }

    return (
        <ChartReactCharts
            style={{ maxWidth: '100%' }}
            ref={chartRef}
            type={'doughnut'}
            height="250px"
            key={`chart_instance_${chartIndex}_${Math.random()}`}
            redraw
            data={{ ...data }}
            onClick={event => {
                if (!isExample) {
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
                            JSON.stringify({
                                area: 'Widget',
                                area_id: chart.id
                            }),
                            JSON.stringify({
                                item_type: 'Chart area'
                            }),
                            JSON.stringify({
                                event_type: 'Click',
                                event_action: `Filter by ${data.nodeProperty}`,
                                event_value: data.labels[dataIndex]
                            })
                        );

                        visibleNodeIds =
                            store.graphInstance.filterNodesWithValue(
                                data.nodeProperty,
                                data.labels[dataIndex]
                            );
                    } else {
                        store.track.trackEvent(
                            JSON.stringify({
                                area: 'Widget',
                                area_id: chart.id
                            }),
                            JSON.stringify({
                                item_type: 'Chart area'
                            }),
                            JSON.stringify({
                                event_type: 'Click',
                                event_action: `Filter by ${data.edgeProperty}`,
                                event_value: data.labels[dataIndex]
                            })
                        );

                        visibleNodeIds =
                            store.graphInstance.filterEdgesWithValue(
                                data.edgeProperty,
                                data.labels[dataIndex]
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
                layout: {
                    padding: {
                        right: isExpanded ? 30 : 0,
                        top: isExpanded ? 30 : 0,
                        bottom: isExpanded ? 30 : 0,
                        left: isExpanded ? 30 : 0
                    }
                },
                devicePixelRatio: 2,
                onHover: (event, elements) => {
                    if (elements.length) {
                        event.native.target.style.cursor = 'pointer';
                    } else {
                        event.native.target.style.cursor = 'default';
                    }
                },
                scales: {
                    y: {
                        display: false,
                        ticks: {
                            diplay: false
                        },
                        gridLines: {
                            display: false
                        }
                    },
                    x: {
                        display: false,
                        ticks: {
                            diplay: false
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
                        display: false
                    },
                    ...getPluginOptions()
                }
            }}
        />
    );
}
DoughnutChart.propTypes = {
    demoData: PropTypes.any,
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool
};

export default observer(DoughnutChart);
