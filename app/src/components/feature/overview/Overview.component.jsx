import {
    Box,
    Grid,
    GridItem,
    IconButton,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { MathPlus } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import ChartComponent from '../stats/chart/Chart.component';
import StatContainerComponent from '../stats/statcontainer/StatContainer';
import SelectedComponentListComponent from '../stats/component/ComponentStats.component';
import SelectedNodeListComponent from '../stats/node/NodeStats.component';
import GraphStatsComponent from '../stats/graph/GraphStats.component';
import ConnectionStatsComponent from '../stats/connections/ConnectionStats.component';
function Overview(props) {
    const store = useContext(RootStoreContext);

    const getChartTitle = chart => {
        if (chart.type.toLowerCase() === 'nodes') {
            return 'Graph nodes';
        }

        if (chart.type.toLowerCase() === 'components') {
            return 'Graph components';
        }

        if (chart.type.toLowerCase() === 'graph stats') {
            return 'Graph properties';
        }

        if (chart.type.toLowerCase() === 'connections') {
            return 'Node connections';
        }

        if (chart.title) {
            return chart.title;
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
            default:
                return <ConnectionStatsComponent />;
        }
    };

    const renderAddStatButton = () => (
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
                <Tooltip label="Add new statistic">
                    <IconButton
                        width="100%"
                        height="100%"
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

    const renderCharts = () =>
        store.stats
            .getChartListForDataset()
            .filter(chart => chart.network === store.core.currentGraph)
            .map((chart, index) => {
                const title = getChartTitle(chart);
                const chartObject = getChartData(chart, index, title);

                return (
                    <StatContainerComponent
                        key={`Stat_${index}`}
                        chart={chart}
                        index={index}
                        title={title}
                    >
                        {chartObject}
                    </StatContainerComponent>
                );
            });

    return (
        <VStack spacing="10px" marginTop="50px">
            <Grid
                maxHeight="100%"
                width="100%"
                templateColumns={'repeat(2, minmax(0, 1fr))'}
                gap={5}
                margin="0"
                marginBottom="70px"
                padding="0"
            >
                {renderCharts()}
                {renderAddStatButton()}
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
