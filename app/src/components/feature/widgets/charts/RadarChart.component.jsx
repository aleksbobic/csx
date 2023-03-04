import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { schemeTableau10 } from 'd3-scale-chromatic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function RadarChart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);
    const [data, setData] = useState(null);
    const [chartConfig, setChartConfig] = useState(
        store.stats.activeWidgets.find(
            widget => widget.id === props.chart.id
        ) || {}
    );

    const [tooManySelectedElements, setTooManySelectedElements] =
        useState(false);

    useEffect(() => {
        if (store.comment.chartToAttach === props.chart.id) {
            store.comment.attachChart(
                chartRef.current.toBase64Image('image/octet-stream', 1.0)
            );
            store.comment.setChartToAttach(null);
        }
    }, [props.chart.id, store.comment, store.comment.chartToAttach]);

    const getChartData = useCallback(
        chart => {
            if (!chart) {
                return null;
            }

            if (
                (chart.elements === 'nodes' &&
                    store.graph.currentGraphData.selectedNodes.length > 8) ||
                (chart.elements === 'components' &&
                    store.graph.currentGraphData.selectedComponents.length > 8)
            ) {
                setTooManySelectedElements(true);
                return null;
            }

            setTooManySelectedElements(false);

            let data;

            if (chart.elements === 'nodes') {
                if (store.core.isDetail) {
                    const nodeProperties =
                        store.stats.getRadarDetailVisibleNodeProperties(
                            props.chart.id
                        );

                    data = store.stats.getRadarDetailNodes(nodeProperties);
                } else {
                    const nodeProperties =
                        store.stats.getRadarOverviewVisibleNodeProperties(
                            props.chart.id
                        );
                    data = store.stats.getRadarOverviewNodes(nodeProperties);
                }
            } else {
                if (store.core.isDetail) {
                    data = store.stats.getRadarDetailComponents();
                } else {
                    data = store.stats.getRadarOverviewComponents();
                }
            }

            if (!data) {
                return null;
            }

            return {
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
            };
        },
        [
            props.chart.id,
            store.core.isDetail,
            store.graph.currentGraphData.selectedComponents.length,
            store.graph.currentGraphData.selectedNodes.length,
            store.stats
        ]
    );

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
            const chart = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );

            setChartConfig(chart);
            setData(getChartData(chart));
        }
    }, [
        getChartData,
        props.chart.id,
        props.demoData,
        props.isExpanded,
        store.core.isOverview,
        store.overviewSchema.anchorProperties,
        store.stats,
        store.core.currentGraph,
        store.stats.activeWidgets,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents
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

        if (chartConfig.groupHoverLabel) {
            pluginOptions.tooltip.callbacks.title = tooltipItems => {
                return `${chartConfig.hoverLabel}: ${tooltipItems[0].label}`;
            };
        }

        return pluginOptions;
    };

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={['item type', 'visible node props']}
                customAvailableTypes={[
                    { value: 'nodes', label: 'Nodes' },
                    { value: 'components', label: 'Components' }
                ]}
            />
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
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool,
    settingsMode: PropTypes.bool
};

RadarChart.defaultProps = {
    isExpanded: false,
    isExample: false,
    settingsMode: false
};

export default observer(RadarChart);
