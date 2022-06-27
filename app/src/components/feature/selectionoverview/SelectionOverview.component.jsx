import {
    Box,
    Center,
    Grid,
    GridItem,
    Heading,
    HStack,
    IconButton,
    SkeletonCircle,
    Stat,
    Tag,
    TagLabel,
    Text,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
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
import {
    ArrowsH,
    ArrowsMergeAltH,
    Close,
    MathPlus,
    Remove,
    Ruler,
    ToolbarTop
} from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import { RootStoreContext } from 'stores/RootStore';
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

    const renderChart = (data, title, chart, chartType, options) => {
        if (!data.labels.length) {
            return (
                <Center width="100%" height="100%">
                    <SkeletonCircle size="20px" />
                </Center>
            );
        }
        return (
            <Chart
                type={chartType}
                height="250px"
                redraw={true}
                data={data}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    indexAxis: options && options.indexAxis,
                    scales: {
                        y: {
                            display: chart.labels.y.display,
                            ticks: {
                                diplay: chart.labels.y.display
                            }
                        },
                        x: {
                            display: chart.labels.x.display,
                            ticks: {
                                diplay: chart.labels.x.display
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: title
                        },
                        legend: {
                            display: chart.legend
                        }
                    }
                }}
            />
        );
    };

    const getChartObject = (chart, values, title) => {
        switch (chart.type.toLowerCase()) {
            case 'bar':
                return renderChart(values, title, chart, 'bar', {
                    indexAxis: 'y'
                });
            case 'vertical bar':
            case 'grouped bar':
                return renderChart(values, title, chart, 'bar');
            case 'line':
                return renderChart(values, title, chart, 'line');
            default:
                return renderChart(values, title, chart, 'doughnut');
        }
    };

    const getEdgeChartData = chart => {
        let title;
        let edgeProperty;
        let groupBy;

        if (chart.type.toLowerCase() === 'grouped bar') {
            groupBy = getEdgeGroupByParam(chart.group_by);
        }

        switch (chart.element_values) {
            case 'values':
                edgeProperty = { type: 'advanced', prop: 'label' };
                title = 'edge values';
                break;
            case 'types':
                edgeProperty = { type: 'advanced', prop: 'feature' };
                title = 'edge types';
                break;
            default:
                edgeProperty = { type: 'basic', prop: 'weight' };
                title = 'edge weights';
                break;
        }

        const values = store.stats.getEdgeCounts(
            edgeProperty,
            chart.type,
            chart.display_limit,
            groupBy,
            chart.onlyVisible
        );

        return getChartObject(chart, values, title);
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

    const getNodeChartData = chart => {
        let title;
        let nodeProperty;
        let groupBy;

        if (chart.type.toLowerCase() === 'grouped bar') {
            groupBy = getNodeGroupByParam(chart.group_by);
        }

        switch (chart.element_values) {
            case 'values':
                nodeProperty = { type: 'basic', prop: 'label' };
                title = 'node values';
                break;
            case 'types':
                nodeProperty = { type: 'basic', prop: 'feature' };
                title = 'node types';
                break;
            default:
                nodeProperty = { type: 'advanced', prop: chart.element_values };
                title = `property ${chart.element_values} values`;
                break;
        }

        const values = store.stats.getNodeCounts(
            nodeProperty,
            chart.type,
            chart.display_limit,
            chart.network_data,
            groupBy,
            chart.onlyVisible,
            chart.show_only
        );

        return getChartObject(chart, values, title);
    };

    const renderCharts = () => {
        const chartList = store.stats.getChartListForDataset();

        const gridCharts = chartList
            .filter(
                chart =>
                    props.types.includes(chart.network_data) &&
                    chart.network === store.core.currentGraph
            )
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
                        paddingBottom={chart.colSpan === 2 ? '50px' : '10px'}
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
                                        opacity={0.5}
                                        _hover={{
                                            opacity: 1
                                        }}
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
                                        opacity={0.5}
                                        _hover={{
                                            opacity: 1
                                        }}
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
                                    opacity={0.5}
                                    _hover={{
                                        opacity: 1
                                    }}
                                    onClick={() =>
                                        store.stats.removeChart(chart.id)
                                    }
                                />
                            </Tooltip>
                        </HStack>

                        {chart.colSpan === 2 && (
                            <HStack
                                position="absolute"
                                bottom="6px"
                                right="6px"
                            >
                                <Tooltip label="Toggle legend">
                                    <IconButton
                                        icon={<ToolbarTop />}
                                        size="sm"
                                        variant="ghost"
                                        opacity={0.5}
                                        _hover={{
                                            opacity: 1
                                        }}
                                        onClick={() =>
                                            store.stats.toggleLegend(chart.id)
                                        }
                                    />
                                </Tooltip>

                                <Tooltip label="Toggle axis labels">
                                    <IconButton
                                        icon={<Ruler />}
                                        size="sm"
                                        variant="ghost"
                                        opacity={0.5}
                                        _hover={{
                                            opacity: 1
                                        }}
                                        onClick={() =>
                                            store.stats.toggleAxisLabels(
                                                chart.id
                                            )
                                        }
                                    />
                                </Tooltip>
                            </HStack>
                        )}
                    </GridItem>
                );
            });

        return (
            <Grid
                maxHeight="100%"
                width="100%"
                templateColumns={'repeat(2, 1fr)'}
                gap={5}
                margin="0"
                marginBottom="70px"
                padding="0"
            >
                {props.types.includes('selection') &&
                    store.graph.currentGraphData.selectedNodes.length > 0 && (
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
                    )}
                {props.types.includes('selection') &&
                    store.graph.currentGraphData.selectedComponents.length >
                        0 && (
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
                    )}
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
    types: PropTypes.array
};

SelectionOverview.defaultProps = {
    types: ['selection', 'visible']
};

export default observer(SelectionOverview);
