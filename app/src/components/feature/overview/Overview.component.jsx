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
import ChartComponent from '../stats/chart/Chart.component';
import WidgetContainer from '../stats/widgetcontainer/WidgetContainer';
import SelectedComponentListComponent from '../stats/component/ComponentStats.component';
import SelectedNodeListComponent from '../stats/node/NodeStats.component';
import GraphStatsComponent from '../stats/graph/GraphStats.component';
import ConnectionStatsComponent from '../stats/connections/ConnectionStats.component';
import NodeFilterComponent from '../stats/nodefilter/NodeFilter.component';
import { useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useCallback } from 'react';
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

    const getChartTitle = chart => {
        if (chart.title) {
            return chart.title;
        }

        if (chart.type.toLowerCase() === 'nodes') {
            return 'Graph nodes';
        }

        if (chart.type.toLowerCase() === 'components') {
            return 'Graph components';
        }

        if (chart.type.toLowerCase() === 'graph stats') {
            return 'Graph properties';
        }

        if (chart.type.toLowerCase() === 'node filter') {
            return 'Node property filters';
        }

        if (chart.type.toLowerCase() === 'connections') {
            return 'Node connections';
        }

        switch (chart.element_values) {
            case 'values':
                return chart.elements === 'nodes'
                    ? 'node values'
                    : 'edge values';
            case 'types':
                return chart.elements === 'nodes' ? 'node types' : 'edge types';
            default:
                return chart.elements === 'nodes'
                    ? `property ${chart.element_values} values`
                    : 'edge weights';
        }
    };

    const getChartData = (chart, index, title) => {
        switch (chart.type.toLowerCase()) {
            case 'bar':
            case 'vertical bar':
            case 'grouped bar':
            case 'line':
            case 'doughnut':
                return (
                    <ChartComponent
                        title={title}
                        chart={chart}
                        chartIndex={index}
                    />
                );
            case 'nodes':
                return <SelectedNodeListComponent />;
            case 'components':
                return <SelectedComponentListComponent />;
            case 'graph stats':
                return <GraphStatsComponent />;
            case 'node filter':
                return <NodeFilterComponent />;
            default:
                return <ConnectionStatsComponent />;
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
                        onClick={() =>
                            store.stats.toggleStatsModalVisiblity(
                                true,
                                props.types
                            )
                        }
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
            const title = getChartTitle(chart);
            const chartObject = getChartData(chart, index, title);

            return (
                <WidgetContainer
                    key={`Stat_${index}`}
                    chart={chart}
                    index={index}
                    title={title}
                    maxColSize={maxColSize}
                >
                    {chartObject}
                </WidgetContainer>
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
                padding="0"
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
