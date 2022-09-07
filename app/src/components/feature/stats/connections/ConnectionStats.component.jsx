import {
    Heading,
    Stat,
    Tag,
    Text,
    Tooltip,
    VStack,
    Wrap
} from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function ConnectionStats(props) {
    const store = useContext(RootStoreContext);
    const [visiblity, setVisiblity] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (store.graphInstance.selfCentricType) {
            setVisiblity(true);
        } else {
            setVisiblity(false);
        }
    }, [store.graphInstance.selfCentricType]);

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
            node.neighbourObjects.forEach(neighbour => {
                if (!visited_node_ids.includes(neighbour.id)) {
                    neighbours.push(neighbour);
                }
            })
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

        return Object.keys(neighbour_counts).map((feature, index) => (
            <Tag
                borderRadius="6px"
                key={`1st_level_connection_${feature}_${index}}`}
            >
                <Text color="whiteAlpha.900" fontSize="xs" fontWeight="bold">
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

    const renderDetailLevel = (title, neighbours) => {
        return (
            <VStack width="100%" padding="0px" marginTop="8px">
                {props.isExpanded && (
                    <Heading
                        textAlign="left"
                        width="100%"
                        paddingLeft="4px"
                        size="xs"
                        color="whiteAlpha.500"
                        marginBottom="4px"
                    >
                        {title}
                    </Heading>
                )}

                <Wrap width="100%">
                    <Tag borderRadius="6px">
                        <Text
                            color="whiteAlpha.900"
                            fontSize="xs"
                            fontWeight="bold"
                        >
                            {neighbours.length}
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
                    {renderNeighbours(neighbours)}
                </Wrap>
            </VStack>
        );
    };

    const renderNodeDetails = node => {
        const visited_node_ids = [node.id];
        const first_neighbours = getNeighbours([node], visited_node_ids);

        first_neighbours.forEach(node => visited_node_ids.push(node.id));
        let second_neighbours = getNeighbours(
            first_neighbours,
            visited_node_ids
        );

        second_neighbours = second_neighbours.filter(
            (value, index, self) =>
                index === self.findIndex(t => t.id === value.id)
        );

        second_neighbours.forEach(node => visited_node_ids.push(node.id));

        let third_neighbours = getNeighbours(
            second_neighbours,
            visited_node_ids
        );

        third_neighbours = third_neighbours.filter(
            (value, index, self) =>
                index === self.findIndex(t => t.id === value.id)
        );

        return (
            <>
                {renderDetailLevel('1st degree neighbours', first_neighbours)}
                {props.isExpanded &&
                    second_neighbours.length > 0 &&
                    renderDetailLevel(
                        '2nd degree neighbours',
                        second_neighbours
                    )}
                {props.isExpanded &&
                    third_neighbours.length > 0 &&
                    renderDetailLevel(
                        '3rd degree neighbours',
                        third_neighbours
                    )}
            </>
        );
    };

    if (data.length === 0) {
        return (
            <VStack
                overflowY="scroll"
                height="100%"
                width="100%"
                spacing={1}
                backgroundColor="blackAlpha.800"
                borderRadius="6px"
                justifyContent="center"
                padding="20%"
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
                        Explore direct connections of nodes to see details here!
                        😉
                    </Text>
                )}
            </VStack>
        );
    }

    return (
        <VStack overflowY="scroll" height="100%" width="100%" spacing={1}>
            {data
                .slice()
                .sort((node1, node2) => {
                    if (node1.neighbours.size > node2.neighbours.size) {
                        return -1;
                    } else if (node1.neighbours.size < node2.neighbours.size) {
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
                            backgroundColor="blackAlpha.800"
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
                                        store.graphInstance.zoomToFitByNodeId(
                                            node.id
                                        );
                                    }
                                }}
                            >
                                {node.label}
                            </Heading>
                            {renderNodeDetails(node)}
                        </Stat>
                    );
                })}
        </VStack>
    );
}
ConnectionStats.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.array
};

ConnectionStats.defaultProps = {
    isExpanded: false,
    demoData: []
};

export default observer(ConnectionStats);
