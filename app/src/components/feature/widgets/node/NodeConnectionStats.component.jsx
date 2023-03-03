import {
    Box,
    Center,
    Divider,
    Editable,
    EditableInput,
    EditablePreview,
    Heading,
    HStack,
    Select,
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
import 'overlayscrollbars/styles/overlayscrollbars.css';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import ChartAlertComponent from '../WidgetAlert.component';

function ConnectionStats(props) {
    const store = useContext(RootStoreContext);
    const [visiblity, setVisiblity] = useState(false);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();
    const [title, setTitle] = useState(props.title);
    const [maxDistance, setMaxDistance] = useState(
        props?.chart?.max_distance ? props?.chart?.max_distance : 2
    );
    const [directConnectionFeatures, setDirectConnectionFeatures] = useState(
        props?.chart?.direct_connection_features
            ? props?.chart?.direct_connection_features
            : 'all'
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
            setData(store.graph.currentGraphData.selectedNodes);
        } else {
            setData([]);
        }
    }, [props.demoData, store.graph.currentGraphData.selectedNodes, visiblity]);

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
                    directConnectionFeatures === 'all' ||
                    feature === directConnectionFeatures
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
                                        `Details Panel - Widget - ${props.chart.id}`,
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: `Set max degree level to ${level}`
                                        })
                                    );

                                    store.graphInstance.filterNodesById(
                                        origin,
                                        neighbours,
                                        level,
                                        directConnectionFeatures
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

        for (let degreeLevel = 2; degreeLevel <= maxDistance; degreeLevel++) {
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
            <Center height="100%" width="100%">
                <VStack
                    height="100%"
                    width="100%"
                    alignItems="flex-start"
                    spacing={1}
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'blackAlpha.800'
                    }
                    borderRadius="6px"
                    justifyContent="center"
                    padding="10% 20%"
                >
                    <CustomScroll
                        style={{ paddingLeft: '10px', paddingRight: '10px' }}
                    >
                        <VStack height="100%" width="100%">
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Title
                                </Heading>

                                <Editable
                                    size="xs"
                                    width="100%"
                                    value={title}
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.100'
                                            : 'blackAlpha.300'
                                    }
                                    borderRadius="5px"
                                    onChange={val => setTitle(val)}
                                    onSubmit={val => {
                                        if (val.trim()) {
                                            store.stats.setWidgetProperty(
                                                props.chart.id,
                                                'title',
                                                val.trim()
                                            );
                                            setTitle(val.trim());
                                        } else {
                                            setTitle(props.title);
                                        }
                                    }}
                                    onFocus={() =>
                                        store.comment.setCommentTrigger(false)
                                    }
                                    onBlur={() =>
                                        store.comment.setCommentTrigger(true)
                                    }
                                >
                                    <EditablePreview
                                        padding="5px 10px"
                                        fontSize="xs"
                                        color="#FFFFFFBB"
                                        backgroundColor="whiteAlpha.200"
                                        width="100%"
                                        size="xs"
                                    />
                                    <EditableInput
                                        backgroundColor="whiteAlpha.200"
                                        padding="5px 10px"
                                        fontSize="xs"
                                        width="100%"
                                        size="xs"
                                    />
                                </Editable>
                            </HStack>
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Max Distance
                                </Heading>
                                <Select
                                    className="nodrag"
                                    margin="0px"
                                    variant="filled"
                                    size="xs"
                                    width="100%"
                                    defaultValue={maxDistance}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setMaxDistance(e.target.value);

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'max_distance',
                                            e.target.value
                                        );
                                    }}
                                    background="whiteAlpha.200"
                                    opacity="0.8"
                                    _hover={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                    _focus={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </Select>
                            </HStack>
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Visible Features
                                </Heading>
                                <Select
                                    className="nodrag"
                                    margin="0px"
                                    variant="filled"
                                    size="xs"
                                    width="100%"
                                    defaultValue={directConnectionFeatures}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setDirectConnectionFeatures(
                                            e.target.value
                                        );

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'direct_connection_features',
                                            e.target.value
                                        );
                                    }}
                                    background="whiteAlpha.200"
                                    opacity="0.8"
                                    _hover={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                    _focus={{
                                        opacity: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="all">all</option>
                                    {store.graph.currentGraphData.perspectivesInGraph.map(
                                        feature => (
                                            <option
                                                key={`connection_feature_${feature}`}
                                                value={feature}
                                            >
                                                {feature}
                                            </option>
                                        )
                                    )}
                                </Select>
                            </HStack>
                        </VStack>
                    </CustomScroll>
                </VStack>
            </Center>
        );
    }

    if (data.length === 0) {
        return (
            <ChartAlertComponent
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
                                                    `Details Panel - Widget - ${props.chart.id}`,
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: `Navigate to ${node.id} - ${node.label}`
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
