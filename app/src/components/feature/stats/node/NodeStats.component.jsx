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
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function SelectedNodeList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (props.demoData.length) {
            setData(props.demoData);
        } else {
            let data;

            switch (props.networkData) {
                case 'selected':
                    data = store.graph.currentGraphData.selectedNodes;
                    break;
                case 'visible':
                    data = store.graph.currentGraphData.nodes.filter(
                        node => node.visible
                    );
                    break;
                default:
                    data = store.graph.currentGraphData.nodes;
                    break;
            }

            data = data.slice().sort((node1, node2) => {
                if (node1.neighbours.size > node2.neighbours.size) {
                    return -1;
                }

                if (node1.neighbours.size < node2.neighbours.size) {
                    return 1;
                }

                return 0;
            });

            if (
                props.networkData === 'selected' ||
                props.elementDisplayLimit === 0
            ) {
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
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents
    ]);

    const renderNodeDetails = node => {
        return (
            <HStack>
                {store.core.isDetail && (
                    <Tag
                        size="md"
                        borderRadius="4px"
                        variant="solid"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.200'
                        }
                    >
                        <TagLabel>Type: {node.feature}</TagLabel>
                    </Tag>
                )}

                <Tag
                    size="md"
                    borderRadius="4px"
                    variant="solid"
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'whiteAlpha.200'
                    }
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
                height="100%"
                width="100%"
                spacing={1}
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.200' : 'blackAlpha.800'
                }
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
        <Box height="100%" width="100%" position="relative">
            <OverlayScrollbarsComponent
                style={{
                    width: '100%',
                    height: '100%',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    position: 'absolute'
                }}
                options={{
                    scrollbars: {
                        theme: 'os-theme-dark',
                        autoHide: 'scroll',
                        autoHideDelay: 600,
                        clickScroll: true
                    }
                }}
            >
                <VStack height="100%" width="100%" spacing={1}>
                    {data.map((node, index) => {
                        return (
                            <Stat
                                key={node.id}
                                borderRadius="10px"
                                backgroundColor={
                                    colorMode === 'light'
                                        ? 'blackAlpha.200'
                                        : 'blackAlpha.800'
                                }
                                padding="10px"
                                width="100%"
                                flex="0 1 0%"
                            >
                                <Heading
                                    size="xs"
                                    marginBottom={
                                        props.isExpanded ? '8px' : '0'
                                    }
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    opacity={colorMode === 'light' && 0.8}
                                    width="100%"
                                    paddingRight={
                                        props.networkData === 'selected'
                                            ? '30px'
                                            : '0'
                                    }
                                    _hover={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        if (!props.demoData.length) {
                                            store.graphInstance.zoomToFitByNodeId(
                                                node.id
                                            );
                                        }
                                    }}
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="black"
                                        opacity="0.2"
                                        display="inline"
                                        marginRight="5px"
                                    >
                                        {index} -
                                    </Text>
                                    {node.label}
                                </Heading>

                                {props.isExpanded && renderNodeDetails(node)}

                                {props.networkData === 'selected' && (
                                    <Box
                                        position="absolute"
                                        top="4px"
                                        right="8px"
                                    >
                                        <Tooltip label="Deselect node">
                                            <IconButton
                                                size="xs"
                                                border="none"
                                                variant="ghost"
                                                aria-label="Remove from list"
                                                icon={
                                                    <Remove
                                                        style={{
                                                            '--ggs': '0.8'
                                                        }}
                                                    />
                                                }
                                                onClick={() => {
                                                    if (
                                                        !props.demoData.length
                                                    ) {
                                                        store.track.trackEvent(
                                                            'data panel selection tab',
                                                            'button click',
                                                            `deselect node {id: ${node.id}, label: ${node.label}}`
                                                        );

                                                        const nodeIndex =
                                                            store.graph.currentGraphData.selectedNodes.findIndex(
                                                                n =>
                                                                    n.id ===
                                                                    node.id
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
            </OverlayScrollbarsComponent>
        </Box>
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
