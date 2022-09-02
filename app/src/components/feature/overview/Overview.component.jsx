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

    const getChartObject = (chart, data, title, index) => {
        const options =
            chart.type.toLowerCase() === 'bar' ? { indexAxis: 'y' } : {};

        switch (chart.type.toLowerCase()) {
            case 'bar':
            case 'vertical bar':
            case 'grouped bar':
            case 'line':
            case 'doughnut':
                return (
                    <ChartComponent
                        data={data}
                        title={title}
                        chart={chart}
                        chartIndex={index}
                        options={options}
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

    const getEdgeChartTitle = chart => {
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

        switch (chart.element_values) {
            case 'values':
                return chart.title ? chart.title : 'edge values';
            case 'types':
                return chart.title ? chart.title : 'edge types';
            default:
                return chart.title ? chart.title : 'edge weights';
        }
    };

    const getEdgeChartData = (chart, index, title) => {
        let edgeProperty;
        let groupBy;

        if (chart.type.toLowerCase() === 'grouped bar') {
            groupBy = getEdgeGroupByParam(chart.group_by);
        }

        switch (chart.element_values) {
            case 'values':
                edgeProperty = { type: 'advanced', prop: 'label' };
                break;
            case 'types':
                edgeProperty = { type: 'advanced', prop: 'feature' };
                break;
            default:
                edgeProperty = { type: 'basic', prop: 'weight' };
                break;
        }

        const data = store.stats.getEdgeCounts(
            edgeProperty,
            chart.type,
            chart.display_limit,
            groupBy,
            chart.onlyVisible
        );

        return getChartObject(chart, data, title, index);
    };

    const getNodeGroupByParam = groupBy => {
        switch (groupBy) {
            case 'values':
                return { type: 'basic', prop: 'label' };
            case 'types':
                return { type: 'basic', prop: 'feature' };
            default:
                return { type: 'advanced', prop: groupBy };
        }
    };

    const getEdgeGroupByParam = groupBy => {
        switch (groupBy) {
            case 'values':
                return { type: 'advanced', prop: 'label' };
            case 'types':
                return { type: 'advanced', prop: 'feature' };
            default:
                return { type: 'basic', prop: groupBy };
        }
    };

    const getNodeChartTitle = chart => {
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

        switch (chart.element_values) {
            case 'values':
                return chart.title ? chart.title : 'node values';
            case 'types':
                return chart.title ? chart.title : 'node types';
            default:
                return chart.title
                    ? chart.title
                    : `property ${chart.element_values} values`;
        }
    };

    const getNodeChartData = (chart, index, title) => {
        let nodeProperty;
        let groupBy;

        if (chart.type.toLowerCase() === 'grouped bar') {
            groupBy = getNodeGroupByParam(chart.group_by);
        }

        switch (chart.element_values) {
            case 'values':
                nodeProperty = { type: 'basic', prop: 'label' };
                break;
            case 'types':
                nodeProperty = { type: 'basic', prop: 'feature' };
                break;
            default:
                nodeProperty = { type: 'advanced', prop: chart.element_values };
                break;
        }

        const data = store.stats.getNodeCounts(
            nodeProperty,
            chart.type,
            chart.display_limit,
            chart.network_data,
            groupBy,
            chart.onlyVisible,
            chart.show_only
        );

        return getChartObject(chart, data, title, index);
    };

    const renderCharts = () => {
        const chartList = store.stats.getChartListForDataset();

        const gridCharts = chartList
            .filter(chart => chart.network === store.core.currentGraph)
            .map((chart, index) => {
                let chartObject;
                let title;

                if (chart.elements === 'nodes') {
                    title = title ? title : getNodeChartTitle(chart);
                    chartObject = getNodeChartData(chart, index, title);
                } else {
                    title = title ? title : getEdgeChartTitle(chart);
                    chartObject = getEdgeChartData(chart, index, title);
                }

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
            <Grid
                maxHeight="100%"
                width="100%"
                templateColumns={'repeat(2, minmax(0, 1fr))'}
                gap={5}
                margin="0"
                marginBottom="70px"
                padding="0"
            >
                {gridCharts}
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
            </Grid>
        );
    };

    return (
        <VStack spacing="10px" marginTop="50px">
            {renderCharts()}
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
