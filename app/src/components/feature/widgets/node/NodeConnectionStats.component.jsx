import {
    Box,
    Divider,
    Heading,
    HStack,
    Stat,
    Tag,
    Text,
    Tooltip,
    useColorMode,
    VStack,
    Wrap
} from '@chakra-ui/react';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { observer } from 'mobx-react';
import 'overlayscrollbars/overlayscrollbars.css';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function ConnectionStats(props) {
    const store = useContext(RootStoreContext);
    const [visiblity, setVisiblity] = useState(false);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();
    const [widgetConfig, setWidgetConfig] = useState(
        store.stats?.activeWidgets?.find(
            widget => widget.id === props.chart?.id
        ) || {}
    );

    useEffect(() => {
        if (store.graphInstance.selfCentricType) {
            setVisiblity(true);
            store.graphInstance.setVisibleComponents([]);
        } else {
            setVisiblity(false);
        }
    }, [store.graphInstance, store.graphInstance.selfCentricType]);

    useEffect(() => {
        if (props.demoData.length) {
            setData(props.demoData);
        } else if (visiblity) {
            const widget = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );

            setWidgetConfig(widget);

            setData(store.graph.currentGraphData.selectedNodes);
        } else {
            const widget = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );

            setWidgetConfig(widget);
            setData([]);
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
        visiblity
    ]);

    const getNeighbours = (node_list, visited_node_ids) => {
        const neighbours = [];
        node_list.forEach(node =>
            node.neighbourObjects
                ? node.neighbourObjects.forEach(neighbour => {
                      if (!visited_node_ids.includes(neighbour.id)) {
                          neighbours.push(neighbour);
                      }
                  })
                : []
        );

        return neighbours;
    };

    const renderNeighbours = neighbours => {
        const neighbour_counts = neighbours.reduce((counts, neighbour) => {
            if (Object.keys(counts).includes(neighbour.feature)) {
                counts[neighbour.feature] += 1;
            } else {
                counts[neighbour.feature] = 1;
            }
            return counts;
        }, {});

        return Object.keys(neighbour_counts)
            .filter(
                feature =>
                    widgetConfig.direct_connection_features === 'all' ||
                    feature === widgetConfig.direct_connection_features
            )
            .map((feature, index) => (
                <Tag
                    borderRadius="6px"
                    key={`1st_level_connection_${feature}_${index}}`}
                    background={
                        props.demoData.length === 0 &&
                        store.core.currentGraph === 'detail'
                            ? store.graphInstance.nodeColorSchemeColors[
                                  [store.core.currentGraph]
                              ]['node type'][feature]
                            : 'blue.600'
                    }
                >
                    <Text
                        color="whiteAlpha.900"
                        fontSize="xs"
                        fontWeight="bold"
                    >
                        {neighbour_counts[feature]}
                    </Text>
                    <Tooltip label={feature}>
                        <Text
                            color="whiteAlpha.900"
                            textTransform="capitalize"
                            textAlign="center"
                            fontSize="xs"
                            fontWeight="bold"
                            overflow="hidden"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                            width="100%"
                            paddingLeft="10px"
                            paddingRight="10px"
                            style={{ margin: '0px' }}
                        >
                            {feature}
                        </Text>
                    </Tooltip>
                </Tag>
            ));
    };

    const renderDetailLevel = (origin, neighbours, level) => {
        return (
            <VStack
                width="100%"
                padding="0px"
                marginTop="8px"
                key={neighbours[level].title}
            >
                {props.isExpanded && (
                    <HStack width="100%">
                        <Divider style={{ opacity: 0.2 }} />
                        <Tooltip
                            label={`Show all nodes with selected feature ${
                                level + 1
                            } ${
                                level === 0 ? 'connection' : 'connections'
                            } away from the origin node.`}
                        >
                            <Heading
                                textAlign="center"
                                paddingLeft="4px"
                                size="xs"
                                color="whiteAlpha.500"
                                opacity="0.5"
                                marginBottom="4px"
                                minWidth="210px"
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Widget',
                                            area_id: props.chart.id
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action:
                                                'Set max degree level',
                                            event_value: level
                                        })
                                    );

                                    store.graphInstance.filterNodesById(
                                        origin,
                                        neighbours,
                                        level,
                                        widgetConfig.direct_connection_features
                                    );
                                }}
                                _hover={{ cursor: 'pointer', opacity: 1 }}
                            >
                                {neighbours[level].title}
                            </Heading>
                        </Tooltip>
                        <Divider style={{ opacity: 0.5 }} />
                    </HStack>
                )}

                <Wrap width="100%">
                    <Tag
                        borderRadius="6px"
                        backgroundColor={
                            colorMode === 'light' && 'blackAlpha.300'
                        }
                    >
                        <Text
                            color="whiteAlpha.900"
                            fontSize="xs"
                            fontWeight="bold"
                        >
                            {neighbours[level].neighbours.length}
                        </Text>
                        <Tooltip label="All neighbours">
                            <Text
                                color="whiteAlpha.900"
                                textTransform="capitalize"
                                textAlign="center"
                                fontSize="xs"
                                fontWeight="bold"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                                width="100%"
                                paddingLeft="10px"
                                paddingRight="10px"
                                style={{ margin: '0px' }}
                            >
                                Neighbours
                            </Text>
                        </Tooltip>
                    </Tag>
                    {renderNeighbours(neighbours[level].neighbours)}
                </Wrap>
            </VStack>
        );
    };

    const getNextNeighborArray = (existingNeighbors, visitedNodeIds) => {
        existingNeighbors.forEach(node => visitedNodeIds.push(node.id));
        let newNeighbors = getNeighbours(existingNeighbors, visitedNodeIds);

        newNeighbors = newNeighbors.filter(
            (value, index, self) =>
                index === self.findIndex(t => t.id === value.id)
        );

        return { newNeighbors, visitedNodeIds };
    };

    const renderNodeDetails = node => {
        let visited_node_ids = [node.id];
        let neighbours = getNeighbours([node], visited_node_ids);

        const neighborDegreeLevels = [
            {
                title: '1st degree neighbours',
                neighbours: neighbours
            },
            {
                title: '2nd degree neighbours',
                neighbours: null
            },
            {
                title: '3rd degree neighbours',
                neighbours: null
            },
            {
                title: '4th degree neighbours',
                neighbours: null
            },
            {
                title: '5th degree neighbours',
                neighbours: null
            }
        ];

        for (
            let degreeLevel = 2;
            degreeLevel <= widgetConfig.max_distance;
            degreeLevel++
        ) {
            const results = getNextNeighborArray(
                neighborDegreeLevels[degreeLevel - 2].neighbours,
                visited_node_ids
            );
            neighborDegreeLevels[degreeLevel - 1].neighbours =
                results.newNeighbors;
            visited_node_ids = results.visitedNodeIds;
        }

        return (
            <>
                {neighborDegreeLevels
                    .filter(level => level.neighbours !== null)
                    .map((level, index) => {
                        if (
                            index === 0 ||
                            (props.isExpanded && level.neighbours.length > 0)
                        ) {
                            return renderDetailLevel(
                                node,
                                neighborDegreeLevels,
                                index
                            );
                        }
                        return null;
                    })}
            </>
        );
    };

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={['max distance', 'direct connection feature']}
            />
        );
    }

    if (!data || data.length === 0) {
        return (
            <WidgetAlert
                size={props.isExpanded ? 'md' : 'sm'}
                message="Explore direct connections of nodes to see details here! 😉"
            />
        );
    }

    return (
        <Box height="100%" width="100%" position="relative">
            <CustomScroll
                style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    position: 'absolute'
                }}
            >
                <VStack height="100%" width="100%" spacing={1}>
                    {data
                        .slice()
                        .sort((node1, node2) => {
                            if (node1.neighbours.size > node2.neighbours.size) {
                                return -1;
                            } else if (
                                node1.neighbours.size < node2.neighbours.size
                            ) {
                                return 1;
                            } else {
                                return 0;
                            }
                        })
                        .map(node => {
                            return (
                                <Stat
                                    key={node.id}
                                    borderRadius="10px"
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.200'
                                            : 'whiteAlpha.100'
                                    }
                                    padding="10px"
                                    width="100%"
                                    flex="0 1 0%"
                                >
                                    <Heading
                                        size="xs"
                                        marginBottom="8px"
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        width="100%"
                                        paddingRight="30px"
                                        _hover={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            if (!props.demoData.length) {
                                                store.track.trackEvent(
                                                    JSON.stringify({
                                                        area: 'Widget',
                                                        area_id: props.chart.id
                                                    }),
                                                    JSON.stringify({
                                                        item_type: 'Button',
                                                        item_id: node.id,
                                                        item_label: node.label,
                                                        item_feature:
                                                            node.feature
                                                    }),
                                                    JSON.stringify({
                                                        event_type: 'Click',
                                                        event_action:
                                                            'Navigate to node'
                                                    })
                                                );

                                                store.graphInstance.zoomToFitByNodeId(
                                                    node.id
                                                );
                                            }
                                        }}
                                    >
                                        Node: {node.label}
                                    </Heading>
                                    {renderNodeDetails(node)}
                                </Stat>
                            );
                        })}
                </VStack>
            </CustomScroll>
        </Box>
    );
}
ConnectionStats.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.array,
    connectionFeature: PropTypes.string,
    maxConnectionDegree: PropTypes.number
};

ConnectionStats.defaultProps = {
    isExpanded: false,
    demoData: [],
    connectionFeature: 'all',
    maxConnectionDegree: 2
};

export default observer(ConnectionStats);
