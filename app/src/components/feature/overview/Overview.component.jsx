import {
    Box,
    Grid,
    GridItem,
    IconButton,
    Tooltip,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { MathPlus } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import LineChart from '../widgets/charts/LineChart.component';
import Widget from '../widgets/Widget.component';
import SelectedComponentListComponent from '../widgets/component/ComponentStats.component';
import SelectedNodeListComponent from '../widgets/node/NodeStats.component';
import GraphStatsComponent from '../widgets/graph/GraphStats.component';
import ConnectionStatsComponent from '../widgets/node/NodeConnectionStats.component';
import NodeFilterComponent from '../widgets/node/NodeFilter.component';
import { useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useCallback } from 'react';
import DoughnutChart from '../widgets/charts/DoughnutChart.component';
import BarChart from '../widgets/charts/BarChart.component';
import RadarChartComponent from '../widgets/charts/RadarChart.component';

function Overview(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

    const [templateColumn, setTemplateColumn] = useState('repeat(1, 1fr)');
    const [maxColSize, setMaxColSize] = useState(2);

    const onResize = useCallback(width => {
        if (width < 480) {
            setTemplateColumn('repeat(1, minmax(0, 1fr))');
            setMaxColSize(1);
        } else if (width < 720) {
            setTemplateColumn('repeat(2, minmax(0, 1fr))');
            setMaxColSize(2);
        } else {
            setTemplateColumn('repeat(3, minmax(0, 1fr))');
            setMaxColSize(2);
        }
    }, []);

    const { ref } = useResizeDetector({ onResize });

    const [visibleCharts, setVisibleCharts] = useState(
        store.stats
            .getChartListForDataset()
            .filter(chart => chart.network === store.core.currentGraph)
    );

    useEffect(() => {
        setVisibleCharts(
            store.stats
                .getChartListForDataset()
                .filter(chart => chart.network === store.core.currentGraph)
        );
    }, [store.core.currentGraph, store.stats, store.stats.charts]);

    const getChartData = (chart, index) => {
        switch (chart.type.toLowerCase()) {
            case 'bar':
                return <BarChart chart={chart} chartIndex={index} />;
            case 'vertical bar':
                return <BarChart chart={chart} chartIndex={index} />;
            case 'grouped bar':
                return <BarChart chart={chart} chartIndex={index} />;
            case 'line':
                return <LineChart chart={chart} chartIndex={index} />;
            case 'doughnut':
                return <DoughnutChart chart={chart} chartIndex={index} />;
            case 'radar':
                return <RadarChartComponent chart={chart} chartIndex={index} />;
            case 'nodes':
                return <SelectedNodeListComponent chart={chart} />;
            case 'components':
                return <SelectedComponentListComponent chart={chart} />;
            case 'graph stats':
                return <GraphStatsComponent chart={chart} />;
            case 'node filter':
                return <NodeFilterComponent chart={chart} />;
            default:
                return <ConnectionStatsComponent chart={chart} />;
        }
    };

    const renderAddWidgetButton = () => (
        <GridItem
            key={'Chart grid add button'}
            height="200px"
            padding="10px"
            colSpan={1}
            backgroundColor="transparent"
            borderRadius={8}
            position="relative"
        >
            <Box width="100%" height="100%" padding="20px">
                <Tooltip label="Add new widget">
                    <IconButton
                        width="100%"
                        height="100%"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.200'
                        }
                        _hover={{
                            backgroundColor:
                                colorMode === 'light'
                                    ? 'blackAlpha.400'
                                    : 'whiteAlpha.400'
                        }}
                        borderRadius="xl"
                        onClick={() => {
                            store.track.trackEvent(
                                'Details panel',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Add new widget'
                                })
                            );

                            store.stats.toggleStatsModalVisiblity(
                                true,
                                props.types
                            );
                        }}
                        icon={
                            <MathPlus
                                style={{
                                    opacity: 0.5,
                                    '--ggs': '2'
                                }}
                            />
                        }
                    />
                </Tooltip>
            </Box>
        </GridItem>
    );

    const renderWidgets = () =>
        visibleCharts.map((chart, index) => {
            const chartObject = getChartData(chart, index);

            return (
                <Widget
                    key={`Stat_${index}`}
                    chart={chart}
                    index={index}
                    maxColSize={maxColSize}
                >
                    {chartObject}
                </Widget>
            );
        });

    return (
        <VStack spacing="10px" width="100%" ref={ref}>
            <Grid
                maxHeight="100%"
                width="100%"
                templateColumns={templateColumn}
                gap={5}
                margin="0"
                padding="10px 0 0 0"
            >
                {renderWidgets()}
                {renderAddWidgetButton()}
            </Grid>
        </VStack>
    );
}

Overview.propTypes = {
    types: PropTypes.array
};

Overview.defaultProps = {
    types: ['all', 'selection', 'visible']
};

export default observer(Overview);
