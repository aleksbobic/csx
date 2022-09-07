import { Center, SkeletonCircle } from '@chakra-ui/react';
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

import { useEffect, useRef } from 'react';
import { Chart as ChartReactCharts, getElementAtEvent } from 'react-chartjs-2';

function Chart(props) {
    const store = useContext(RootStoreContext);
    const chartRef = useRef([]);

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

    return !props.data.labels.length ? (
        <Center width="100%" height="100%">
            <SkeletonCircle size="20px" />
        </Center>
    ) : (
        <ChartReactCharts
            style={{ maxWidth: '100%' }}
            ref={element => (chartRef.current[props.chartIndex] = element)}
            type={getChartType()}
            height="250px"
            redraw={true}
            data={props.data}
            onClick={event => {
                if (!props.isExample) {
                    const { index } = getElementAtEvent(
                        chartRef.current[props.chartIndex],
                        event
                    )[0];

                    if ('nodeProperty' in props.data) {
                        store.graphInstance.filterNodesWithValue(
                            props.data.nodeProperty,
                            props.data.labels[index]
                        );
                    } else {
                        store.graphInstance.filterEdgesWithValue(
                            props.data.edgeProperty,
                            props.data.labels[index]
                        );
                    }
                }
            }}
            options={{
                maintainAspectRatio: false,
                responsive: true,
                indexAxis: props.options && props.options.indexAxis,
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
    data: PropTypes.any,
    title: PropTypes.string,
    chart: PropTypes.object,
    chartIndex: PropTypes.number,
    options: PropTypes.object,
    isExpanded: PropTypes.bool,
    isExample: PropTypes.bool,
    networkData: PropTypes.string
};

Chart.defaultProps = {
    isExpanded: false,
    isExample: false,
    networkData: 'all'
};

export default observer(Chart);
