import {
    AspectRatio,
    Box,
    Heading,
    Text,
    Tooltip,
    useColorMode,
    VStack,
    Wrap
} from '@chakra-ui/react';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { observer } from 'mobx-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function GraphStats(props) {
    const store = useContext(RootStoreContext);
    const [graphData, setGraphData] = useState([]);
    const [nodeData, setNodeData] = useState([]);
    const { colorMode } = useColorMode();
    const [widgetConfig, setWidgetConfig] = useState(
        store.stats.activeWidgets.find(
            widget => widget.id === props.chart?.id
        ) || {}
    );

    const getGraphData = useCallback(
        widget => {
            switch (widget?.network_data) {
                case 'visible':
                    return Object.entries(store.graph.graphVisibleObjectCount);
                case 'selected':
                    return Object.entries(store.graph.graphSelectedObjectCount);
                default:
                    return Object.entries(store.graph.graphObjectCount);
            }
        },
        [
            store.graph.graphObjectCount,
            store.graph.graphSelectedObjectCount,
            store.graph.graphVisibleObjectCount
        ]
    );

    useEffect(() => {
        if (props.demoData) {
            setGraphData(Object.entries(props.demoData.graphData));
        } else {
            const widget = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );
            setWidgetConfig(widget);

            if (!widget) {
                setGraphData(null);
            }

            setGraphData(getGraphData(widget));
        }
    }, [
        props.chart?.id,
        props.demoData,
        store.graph.currentGraphData.components,
        store.graph.currentGraphData.selectedComponents,
        store.stats.activeWidgets,
        store.core.currentGraph,
        store.core.isOverview,
        store.overviewSchema.anchorProperties,
        store.stats,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents,
        store.graph.graphVisibleObjectCount,
        store.graph.graphSelectedObjectCount,
        store.graph.graphObjectCount,
        getGraphData
    ]);

    const getNodeData = useCallback(
        widget => {
            let node_counts;

            switch (widget?.network_data) {
                case 'visible':
                    node_counts = store.graph.currentGraphData.nodes
                        .filter(node => node.visible)
                        .reduce((counts, node) => {
                            if (Object.keys(counts).includes(node.feature)) {
                                counts[node.feature] += 1;
                            } else {
                                counts[node.feature] = 1;
                            }

                            return counts;
                        }, {});

                    return Object.entries(node_counts).map(entry => [
                        entry[0],
                        { count: entry[1], label: entry[0] }
                    ]);

                case 'selected':
                    node_counts =
                        store.graph.currentGraphData.selectedNodes.reduce(
                            (counts, node) => {
                                if (
                                    Object.keys(counts).includes(node.feature)
                                ) {
                                    counts[node.feature] += 1;
                                } else {
                                    counts[node.feature] = 1;
                                }

                                return counts;
                            },
                            {}
                        );

                    return Object.entries(node_counts).map(entry => [
                        entry[0],
                        { count: entry[1], label: entry[0] }
                    ]);

                default:
                    return Object.entries(
                        store.graph.currentGraphData.types
                    ).map(entry => [
                        entry[0],
                        { count: entry[1].count, label: entry[0] }
                    ]);
            }
        },
        [
            store.graph.currentGraphData.nodes,
            store.graph.currentGraphData.selectedNodes,
            store.graph.currentGraphData.types
        ]
    );

    useEffect(() => {
        if (props.demoData) {
            setNodeData(
                Object.entries(props.demoData.nodeData).map(entry => [
                    entry[0],
                    { count: entry[1].count, label: entry[0] }
                ])
            );
        } else {
            const widget = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );
            setWidgetConfig(widget);

            if (!widget) {
                setNodeData(null);
            }

            setNodeData(getNodeData(widget));
        }
    }, [
        props.chart?.id,
        props.demoData,
        store.graph.currentGraphData.components,
        store.graph.currentGraphData.selectedComponents,
        store.stats.activeWidgets,
        store.core.currentGraph,
        store.core.isOverview,
        store.overviewSchema.anchorProperties,
        store.stats,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents,
        store.graph.currentGraphData.types,
        getNodeData
    ]);

    const renderGraphStats = (title, data) =>
        data.map((entry, index) => (
            <Box
                padding="2px"
                backgroundColor="transparent"
                borderRadius={8}
                key={`${title}_${index}_${entry[1].count}_${entry[1].label}`}
                width="93px"
            >
                <AspectRatio ratio={1} key={index} height="100%">
                    <Box
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.300'
                                : 'whiteAlpha.100'
                        }
                        borderRadius="10px"
                        width="100%"
                        height="100%"
                    >
                        <VStack
                            width="100%"
                            height="100%"
                            justifyContent="center"
                        >
                            <Text
                                color={
                                    colorMode === 'light'
                                        ? 'blackAlpha.900'
                                        : 'whiteAlpha.900'
                                }
                                fontSize="xl"
                                fontWeight="bold"
                            >
                                {entry[1].count}
                            </Text>
                            <Tooltip label={entry[1].label}>
                                <Text
                                    color={
                                        colorMode === 'light'
                                            ? 'blackAlpha.600'
                                            : 'whiteAlpha.600'
                                    }
                                    textTransform="capitalize"
                                    opacity="0.75"
                                    textAlign="center"
                                    fontSize="xs"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    width="100%"
                                    paddingLeft="10px"
                                    paddingRight="10px"
                                    style={{ margin: '0px' }}
                                >
                                    {entry[1].label}
                                </Text>
                            </Tooltip>
                        </VStack>
                    </Box>
                </AspectRatio>
            </Box>
        ));

    const renderStatsGroup = (data, title) => (
        <VStack width="100%">
            <Heading
                textAlign="left"
                width="100%"
                paddingLeft="4px"
                size="xs"
                color={
                    colorMode === 'light' ? 'blackAlpha.500' : 'whiteAlpha.300'
                }
                marginBottom="4px"
            >
                {title}
            </Heading>

            <Wrap width="100%" spacing="0">
                {renderGraphStats(title, data)}
            </Wrap>
        </VStack>
    );

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={['item state']}
            />
        );
    }

    if (
        nodeData.length === 0 &&
        widgetConfig &&
        widgetConfig.network_data !== 'all'
    ) {
        return <WidgetAlert size={props.isExpanded ? 'md' : 'sm'} />;
    }

    return (
        <CustomScroll style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <VStack maxHeight="100%" width="100%">
                {renderStatsGroup(graphData, 'Graph Stats')}
                {renderStatsGroup(nodeData, 'Node Stats')}
            </VStack>
        </CustomScroll>
    );
}
GraphStats.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.object
};

export default observer(GraphStats);
