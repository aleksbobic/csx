import {
    AspectRatio,
    Box,
    Grid,
    GridItem,
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
import { useState } from 'react';
import { useContext, useEffect } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function ConnectionStats(props) {
    const store = useContext(RootStoreContext);
    const [visiblity, setVisiblity] = useState(false);

    useEffect(() => {
        if (store.graphInstance.selfCentricType) {
            setVisiblity(true);
        } else {
            setVisiblity(false);
        }
    }, [store.graphInstance.selfCentricType]);

    const getData = () => {
        if (props.demoData.length) {
            return props.demoData;
        }

        return store.graph.currentGraphData.selectedNodes;
    };

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
                borderRadius="full"
                key={`1st_level_connection_${feature}_${index}}`}
            >
                <Text color="whiteAlpha.900" fontSize="sm" fontWeight="bold">
                    {neighbour_counts[feature]}
                </Text>
                <Tooltip label="All neighbours">
                    <Text
                        color="whiteAlpha.900"
                        textTransform="capitalize"
                        textAlign="center"
                        fontSize="sm"
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
    const renderNodeDetails = node => {
        const visited_node_ids = [node.id];
        const first_neighbours = getNeighbours([node], visited_node_ids);

        return (
            <VStack width="100%" padding="0px">
                <Heading
                    textAlign="left"
                    width="100%"
                    paddingLeft="4px"
                    size="xs"
                    color="whiteAlpha.600"
                    marginBottom="4px"
                >
                    1st degree neighbours:
                </Heading>

                <Wrap width="100%">
                    <Tag borderRadius="full">
                        <Text
                            color="whiteAlpha.900"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            {first_neighbours.length}
                        </Text>
                        <Tooltip label="All neighbours">
                            <Text
                                color="whiteAlpha.900"
                                textTransform="capitalize"
                                textAlign="center"
                                fontSize="sm"
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
                    {renderNeighbours(first_neighbours)}
                </Wrap>
            </VStack>
        );
    };

    const renderNodeDetailsSecond = node => {
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

        return (
            <VStack width="100%" padding="0px" marginTop="8px">
                <Heading
                    textAlign="left"
                    width="100%"
                    size="xs"
                    color="whiteAlpha.600"
                    marginBottom="4px"
                >
                    2nd degree neighbours:
                </Heading>

                <Wrap width="100%">
                    <Tag borderRadius="full">
                        <Text
                            color="whiteAlpha.900"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            {second_neighbours.length}
                        </Text>
                        <Tooltip label="All neighbours">
                            <Text
                                color="whiteAlpha.900"
                                textTransform="capitalize"
                                textAlign="center"
                                fontSize="sm"
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
                    {renderNeighbours(second_neighbours)}
                </Wrap>
            </VStack>
        );
    };

    const renderNodeDetailsThird = node => {
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
            <VStack width="100%" padding="0px" marginTop="8px">
                <Heading
                    textAlign="left"
                    width="100%"
                    size="xs"
                    color="whiteAlpha.600"
                    marginBottom="4px"
                >
                    3rd degree neighbours:
                </Heading>

                <Wrap width="100%">
                    <Tag borderRadius="full">
                        <Text
                            color="whiteAlpha.900"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            {third_neighbours.length}
                        </Text>
                        <Tooltip label="All neighbours">
                            <Text
                                color="whiteAlpha.900"
                                textTransform="capitalize"
                                textAlign="center"
                                fontSize="sm"
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
                    {renderNeighbours(third_neighbours)}
                </Wrap>
            </VStack>
        );
    };

    return (
        <VStack overflowY="scroll" height="100%" width="100%" spacing={1}>
            {visiblity &&
                getData()
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
                                {props.isExpanded &&
                                    renderNodeDetailsSecond(node)}
                                {props.isExpanded &&
                                    renderNodeDetailsThird(node)}
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
