import {
    Box,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    IconButton,
    SimpleGrid,
    Stat,
    Tag,
    TagLabel,
    Text,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { ArrowsH, ArrowsMergeAltH, Close, MathPlus, Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
function SelectionOverview(props) {
    const store = useContext(RootStoreContext);

    const bgColor = useColorModeValue('gray.50', 'gray.800');

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

    const renderSelectedNodes = () => {
        const selectedNodeList = store.graph.currentGraphData.selectedNodes;

        return selectedNodeList.length ? (
            <VStack overflowY="scroll" maxHeight="140px" width="100%">
                {selectedNodeList.map(node => {
                    return (
                        <Stat
                            key={node.id}
                            borderRadius="10px"
                            backgroundColor={bgColor}
                            padding="10px"
                            width="100%"
                        >
                            <Heading
                                size="xs"
                                marginBottom={
                                    store.core.isOverview ? '0px' : '8px'
                                }
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxWidth="300px"
                                paddingRight="30px"
                                _hover={{ cursor: 'pointer' }}
                                onClick={() => {
                                    store.graphInstance.zoomToFitByNodeId(
                                        node.id
                                    );
                                }}
                            >
                                {node.label}
                            </Heading>
                            {store.core.isDetail && (
                                <HStack>
                                    <Tag
                                        size="md"
                                        borderRadius="full"
                                        variant="solid"
                                        colorScheme="blue"
                                    >
                                        <TagLabel>{node.feature}</TagLabel>
                                    </Tag>
                                </HStack>
                            )}
                            <Box position="absolute" top="4px" right="8px">
                                <IconButton
                                    size="xs"
                                    border="none"
                                    variant="ghost"
                                    aria-label="Remove from list"
                                    icon={<Remove style={{ '--ggs': '0.8' }} />}
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'data panel selection tab',
                                            'button click',
                                            `deselect node {id: ${node.id}, label: ${node.label}}`
                                        );

                                        const nodeIndex =
                                            store.graph.currentGraphData.selectedNodes.findIndex(
                                                n => n.id === node.id
                                            );

                                        store.graph.toggleNodeSelection(
                                            node.id,
                                            nodeIndex
                                        );
                                    }}
                                />
                            </Box>
                        </Stat>
                    );
                })}
            </VStack>
        ) : (
            <Text
                fontSize="xs"
                marginTop="50px"
                width="100%"
                textAlign="left"
                color="gray.400"
                fontWeight="bold"
            >
                Select a node to see it&#39;s details here.
            </Text>
        );
    };

    const renderBarChart = (data, title) => (
        <Bar
            data={data}
            width="100%"
            height="250px"
            redraw={true}
            options={{
                maintainAspectRatio: false,
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                }
            }}
        />
    );

    const renderVBarChart = (data, title) => (
        <Bar
            data={data}
            width="100%"
            height="250px"
            redraw={true}
            options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                }
            }}
        />
    );

    const renderDoughnutChart = (data, title) => (
        <Doughnut
            height="250px"
            redraw={true}
            data={data}
            options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    },
                    legend: {
                        display: false
                    }
                }
            }}
        />
    );

    const renderLineChart = (data, title) => (
        <Line
            data={data}
            width="100%"
            height="250px"
            redraw={true}
            options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                }
            }}
        />
    );

    const getEdgeChartData = chart => {
        let values;
        let title;
        let chartObject;

        switch (chart.element_values) {
            case 'values':
                values = store.stats.getEdgeValueCounts(
                    chart.type,
                    chart.display_limit
                );
                title = 'edge values';
                break;
            case 'types':
                values = store.stats.getEdgeFeatureCounts(
                    chart.type,
                    chart.display_limit
                );
                title = 'edge types';
                break;
            default:
                values = store.stats.getEdgeWeightCounts(
                    chart.type,
                    chart.display_limit
                );
                title = 'edge weights';
                break;
        }

        switch (chart.type.toLowerCase()) {
            case 'bar':
                chartObject = renderBarChart(values, title);
                break;
            case 'line':
                chartObject = renderLineChart(values, title);
                break;
            case 'vertical bar':
                chartObject = renderVBarChart(values, title);
                break;
            default:
                chartObject = renderDoughnutChart(values, title);
                break;
        }

        return chartObject;
    };

    const getNodeChartData = chart => {
        let values;
        let title;
        let chartObject;

        switch (chart.element_values) {
            case 'values':
                values = store.stats.getNodeValueCounts(
                    chart.type,
                    chart.display_limit
                );
                title = 'node values';
                break;
            case 'types':
                values = store.stats.getNodeFeatureCounts(
                    chart.type,
                    chart.display_limit
                );
                title = 'node types';
                break;
            default:
                values = store.stats.getNodePropertyCounts(
                    chart.type,
                    chart.element_values,
                    chart.display_limit
                );
                title = `property ${chart.element_values} values`;
                break;
        }

        switch (chart.type.toLowerCase()) {
            case 'bar':
                chartObject = renderBarChart(values, title);
                break;
            case 'line':
                chartObject = renderLineChart(values, title);
                break;
            case 'vertical bar':
                chartObject = renderVBarChart(values, title);
                break;
            default:
                chartObject = renderDoughnutChart(values, title);
                break;
        }

        return chartObject;
    };

    const renderCharts = () => {
        const chartList = store.stats.getChartListForDataset();

        const gridCharts = chartList
            .filter(chart => chart.network_data === 'all')
            .map((chart, index) => {
                let chartObject;

                if (chart.elements === 'nodes') {
                    chartObject = getNodeChartData(chart);
                } else {
                    chartObject = getEdgeChartData(chart);
                }

                return (
                    <GridItem
                        key={`Selection chart ${index}`}
                        height={chart.height}
                        padding="10px"
                        colSpan={chart.colSpan}
                        backgroundColor="whiteAlpha.200"
                        borderRadius={8}
                        position="relative"
                    >
                        {chartObject}
                        <HStack position="absolute" top="6px" right="6px">
                            {chart.colSpan === 1 ? (
                                <Tooltip label="Expand">
                                    <IconButton
                                        icon={<ArrowsH />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            store.stats.expandChart(chart.id)
                                        }
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip label="Shrink">
                                    <IconButton
                                        icon={<ArrowsMergeAltH />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            store.stats.shrinkChart(chart.id)
                                        }
                                    />
                                </Tooltip>
                            )}

                            <Tooltip label="Remove chart">
                                <IconButton
                                    icon={<Close />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                        store.stats.removeChart(chart.id)
                                    }
                                />
                            </Tooltip>
                        </HStack>
                    </GridItem>
                );
            });

        return (
            <Grid
                padding={6}
                maxHeight="100%"
                width="100%"
                templateColumns="repeat(2, 1fr)"
                gap={5}
            >
                <GridItem
                    key={'Selection chart selected nodes'}
                    height="200px"
                    padding="10px"
                    colSpan={1}
                    backgroundColor="whiteAlpha.200"
                    borderRadius={8}
                    position="relative"
                >
                    <Heading
                        size="sm"
                        textAlign="left"
                        width="100%"
                        marginBottom="10px"
                    >
                        Selected nodes
                    </Heading>
                    {renderSelectedNodes()}
                </GridItem>
                <GridItem
                    key={'Selection chart selected components'}
                    height="200px"
                    padding="10px"
                    colSpan={1}
                    backgroundColor="whiteAlpha.200"
                    borderRadius={8}
                    position="relative"
                >
                    <Heading
                        size="sm"
                        textAlign="left"
                        width="100%"
                        marginBottom="10px"
                    >
                        Selected components
                    </Heading>
                    {renderSelectedComponents()}
                </GridItem>
                {gridCharts}
                <GridItem
                    key={'Selection chart add button'}
                    height="200px"
                    padding="10px"
                    colSpan={1}
                    backgroundColor="whiteAlpha.200"
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
                                    store.stats.toggleStatsModalVisiblity(true)
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

    const renderSelectedComponents = () => {
        const selectedComponentIds =
            store.graph.currentGraphData.selectedComponents;
        const components = store.graph.currentGraphData.components;

        const selectedComponents = components.filter(c =>
            selectedComponentIds.includes(c.id)
        );

        return selectedComponents.length ? (
            <VStack maxHeight="140px" width="100%" overflowY="scroll">
                {selectedComponents.map(component => {
                    return (
                        <Stat
                            key={`selected_component_${component.id}`}
                            borderRadius="10px"
                            backgroundColor={bgColor}
                            padding="10px"
                            width="100%"
                        >
                            <Heading
                                size="xs"
                                marginBottom={
                                    store.core.isOverview ? '0px' : '8px'
                                }
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxWidth="300px"
                                paddingRight="30px"
                            >
                                Component {component.id}
                            </Heading>
                            <Box position="absolute" top="4px" right="8px">
                                <IconButton
                                    size="xs"
                                    border="none"
                                    variant="ghost"
                                    aria-label="Remove from list"
                                    icon={<Remove style={{ '--ggs': '0.8' }} />}
                                    onClick={() => {
                                        store.graph.selectComponent(
                                            component.id
                                        );
                                    }}
                                />
                            </Box>
                        </Stat>
                    );
                })}
            </VStack>
        ) : (
            <Text
                fontSize="xs"
                marginTop="50px"
                width="100%"
                textAlign="left"
                color="gray.400"
                fontWeight="bold"
            >
                Select a component to see it&#39;s details here.
            </Text>
        );
    };

    return (
        <VStack spacing="10px" marginTop="50px">
            {renderCharts()}
        </VStack>
    );
}

SelectionOverview.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
};

export default observer(SelectionOverview);
