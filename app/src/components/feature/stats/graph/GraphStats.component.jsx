import {
    AspectRatio,
    Box,
    Grid,
    GridItem,
    Heading,
    Text,
    Tooltip,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function GraphStats(props) {
    const store = useContext(RootStoreContext);
    const [graphData, setGraphData] = useState([]);
    const [nodeData, setNodeData] = useState([]);
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (props.demoData) {
            setGraphData(Object.entries(props.demoData.graphData));
        } else {
            switch (props.networkData) {
                case 'visible':
                    setGraphData(
                        Object.entries(store.graph.graphVisibleObjectCount)
                    );
                    break;
                case 'selected':
                    setGraphData(
                        Object.entries(store.graph.graphSelectedObjectCount)
                    );
                    break;
                default:
                    setGraphData(Object.entries(store.graph.graphObjectCount));
                    break;
            }
        }
    }, [
        props.demoData,
        props.networkData,
        store.graph.graphObjectCount,
        store.graph.graphSelectedObjectCount,
        store.graph.graphVisibleObjectCount
    ]);

    useEffect(() => {
        if (props.demoData) {
            setNodeData(
                Object.entries(props.demoData.nodeData).map(entry => [
                    entry[0],
                    { count: entry[1].count, label: entry[0] }
                ])
            );
        } else {
            let node_counts;

            switch (props.networkData) {
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

                    setNodeData(
                        Object.entries(node_counts).map(entry => [
                            entry[0],
                            { count: entry[1], label: entry[0] }
                        ])
                    );
                    break;
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

                    setNodeData(
                        Object.entries(node_counts).map(entry => [
                            entry[0],
                            { count: entry[1], label: entry[0] }
                        ])
                    );
                    break;
                default:
                    setNodeData(
                        Object.entries(store.graph.currentGraphData.types).map(
                            entry => [
                                entry[0],
                                { count: entry[1].count, label: entry[0] }
                            ]
                        )
                    );
                    break;
            }
        }
    }, [
        props.demoData,
        props.networkData,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graph.currentGraphData.types,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents
    ]);

    const renderGraphStats = (title, data) =>
        data.map((entry, index) => (
            <GridItem
                padding="2px"
                colSpan={1}
                backgroundColor="transparent"
                borderRadius={8}
                key={`${title}_${index}_${entry[1].count}_${entry[1].label}`}
            >
                <AspectRatio ratio={1} key={index} height="100%">
                    <Box
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.300'
                                : 'blackAlpha.900'
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
            </GridItem>
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
            <Grid
                width="100%"
                templateColumns={
                    props.isExpanded
                        ? 'repeat(6, minmax(0, 1fr))'
                        : 'repeat(3, minmax(0, 1fr))'
                }
                gap={1}
                margin="0"
                padding="0"
            >
                {renderGraphStats(title, data)}
            </Grid>
        </VStack>
    );

    if (nodeData.length === 0 && props.networkData !== 'all') {
        return (
            <Box
                overflowY="scroll"
                height="100%"
                width="100%"
                spacing={1}
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.200' : 'blackAlpha.800'
                }
                borderRadius="6px"
                display="flex"
                justifyContent="center"
                alignItems="center"
            >
                <Heading size="md" opacity="0.5">
                    NO DATA
                </Heading>
                {props.isExpanded && (
                    <Text
                        textAlign="center"
                        fontSize="sm"
                        fontWeight="bold"
                        opacity="0.5"
                    >
                        Select some nodes to see details here! 😉
                    </Text>
                )}
            </Box>
        );
    }

    return (
        <VStack overflowY="scroll" maxHeight="100%" width="100%">
            {renderStatsGroup(graphData, 'Graph Stats')}
            {renderStatsGroup(nodeData, 'Node Stats')}
        </VStack>
    );
}
GraphStats.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.object,
    networkData: PropTypes.string
};

GraphStats.defaultProps = { networkData: 'all' };

export default observer(GraphStats);
