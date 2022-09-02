import {
    Box,
    Heading,
    HStack,
    IconButton,
    Stat,
    Tag,
    TagLabel,
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function SelectedNodeList(props) {
    const store = useContext(RootStoreContext);

    const getData = () => {
        if (props.demoData.length) {
            return props.demoData;
        }

        return props.networkData === 'all'
            ? store.graph.currentGraphData.nodes
            : store.graph.currentGraphData.selectedNodes;
    };

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

    return (
        <VStack overflowY="scroll" height="100%" width="100%" spacing={1}>
            {getData()
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

                            {props.networkData!=='all' && <Box position="absolute" top="4px" right="8px">
                                <IconButton
                                    size="xs"
                                    border="none"
                                    variant="ghost"
                                    aria-label="Remove from list"
                                    icon={<Remove style={{ '--ggs': '0.8' }} />}
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
                            </Box>}
                        </Stat>
                    );
                })}
        </VStack>
    );
}
SelectedNodeList.propTypes = {
    isExpanded: PropTypes.bool,
    networkData: PropTypes.string,
    demoData: PropTypes.array
};

SelectedNodeList.defaultProps = {
    isExpanded: false,
    networkData: 'all',
    demoData: []
};

export default observer(SelectedNodeList);
