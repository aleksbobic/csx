import {
    Box,
    Heading,
    HStack,
    IconButton,
    Stat,
    Tag,
    TagLabel,
    Text,
    Tooltip,
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function SelectedNodeList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (props.demoData.length) {
            setData(props.demoData);
        } else {
            let data =
                props.networkData === 'all'
                    ? store.graph.currentGraphData.nodes
                    : store.graph.currentGraphData.selectedNodes;

            data = data.slice().sort((node1, node2) => {
                if (node1.neighbours.size > node2.neighbours.size) {
                    return -1;
                }

                if (node1.neighbours.size < node2.neighbours.size) {
                    return 1;
                }

                return 0;
            });

            if (props.networkData !== 'all') {
                setData(data);
            } else if (props.elementDisplayLimit > 0) {
                setData(data.slice(0, props.elementDisplayLimit));
            } else {
                setData(data.slice(props.elementDisplayLimit, data.length));
            }
        }
    }, [
        props.demoData,
        props.elementDisplayLimit,
        props.networkData,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length
    ]);

    const renderNodeDetails = node => {
        return (
            <HStack>
                {store.core.isDetail && (
                    <Tag
                        size="md"
                        borderRadius="4px"
                        variant="solid"
                        backgroundColor="whiteAlpha.200"
                    >
                        <TagLabel>Type: {node.feature}</TagLabel>
                    </Tag>
                )}

                <Tag
                    size="md"
                    borderRadius="4px"
                    variant="solid"
                    backgroundColor="whiteAlpha.200"
                >
                    <TagLabel>
                        {`${node.neighbours.size} ${
                            node.neighbours.size === 1
                                ? 'neighbour'
                                : 'neighbours'
                        }`}
                    </TagLabel>
                </Tag>
            </HStack>
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
                {props.networkData !== 'all' && props.isExpanded && (
                    <Text
                        textAlign="center"
                        fontSize="sm"
                        fontWeight="bold"
                        opacity="0.5"
                    >
                        Select some nodes to see details here! 😉
                    </Text>
                )}
            </VStack>
        );
    }

    return (
        <VStack overflowY="scroll" height="100%" width="100%" spacing={1}>
            {data.map(node => {
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
                            marginBottom={props.isExpanded ? '8px' : '0'}
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

                        {props.isExpanded && renderNodeDetails(node)}

                        {props.networkData !== 'all' && (
                            <Box position="absolute" top="4px" right="8px">
                                <Tooltip label="Deselect node">
                                    <IconButton
                                        size="xs"
                                        border="none"
                                        variant="ghost"
                                        aria-label="Remove from list"
                                        icon={
                                            <Remove
                                                style={{ '--ggs': '0.8' }}
                                            />
                                        }
                                        onClick={() => {
                                            if (!props.demoData.length) {
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
                                            }
                                        }}
                                    />
                                </Tooltip>
                            </Box>
                        )}
                    </Stat>
                );
            })}
        </VStack>
    );
}
SelectedNodeList.propTypes = {
    isExpanded: PropTypes.bool,
    networkData: PropTypes.string,
    demoData: PropTypes.array,
    elementDisplayLimit: PropTypes.number
};

SelectedNodeList.defaultProps = {
    isExpanded: false,
    networkData: 'all',
    demoData: [],
    elementDisplayLimit: 10
};

export default observer(SelectedNodeList);
