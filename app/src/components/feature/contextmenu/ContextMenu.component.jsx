import { Button, ButtonGroup } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import { useOutsideClick } from '@chakra-ui/hooks';
import { Box, VStack } from '@chakra-ui/layout';
import { Text } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import { useContext, useRef } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function ContextMenu() {
    const contextMenuRef = useRef();

    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

    useOutsideClick({
        ref: contextMenuRef,
        handler: () => {
            if (store.contextMenu.isVisible) {
                store.track.trackEvent(
                    JSON.stringify({
                        area: 'Graph area',
                        sub_area: 'Context menu'
                    }),
                    JSON.stringify({
                        item_type: 'Outside'
                    }),
                    JSON.stringify({
                        event_type: 'Click',
                        event_action: 'Close context menu'
                    })
                );

                store.contextMenu.hideContextMenu();
            }
        }
    });

    const selectNode = () => {
        const nodeIndex = store.graph.currentGraphData.selectedNodes.findIndex(
            node => node.id === store.contextMenu.originNode.id
        );

        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area',
                sub_area: 'Node context menu'
            }),
            JSON.stringify({
                item_type: 'Button'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: `${nodeIndex !== -1 ? 'Deselect' : 'Select'} node`
            })
        );

        store.graph.toggleNodeSelection(
            store.contextMenu.originNode.id,
            nodeIndex
        );
        store.contextMenu.hideContextMenu();
    };

    const deselectAllNodes = () => {
        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area',
                sub_area: 'Canvas context menu'
            }),
            JSON.stringify({
                item_type: 'Button'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Deselect all nodes'
            })
        );

        const selectedNodes = [...store.graph.currentGraphData.selectedNodes];

        selectedNodes.forEach(node => {
            const index = store.graph.currentGraphData.selectedNodes.findIndex(
                n => n.id === node.id
            );

            store.graph.toggleNodeSelection(node.id, index);
        });

        store.contextMenu.hideContextMenu();
    };

    const expandGraph = () => {
        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area',
                sub_area: 'Node context menu'
            }),
            JSON.stringify({
                item_type: 'Button'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Expand graph'
            })
        );

        const node = store.graph.currentGraphData.nodes.filter(
            node => node.id === store.contextMenu.originNode.id
        )[0];

        store.graph.expandNetwork([node]);
        store.contextMenu.hideContextMenu();
    };

    const selectComponent = () => {
        const componentId = store.contextMenu.originNode.component;

        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area',
                sub_area: 'Node context menu'
            }),
            JSON.stringify({
                item_type: 'Button'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: `${
                    !store.graph.currentGraphData.selectedComponents.includes(
                        componentId
                    )
                        ? 'Deselect'
                        : 'Select'
                } component`
            })
        );

        store.graph.selectComponent(componentId);
        store.contextMenu.hideContextMenu();
    };

    const showDirectConnections = () => {
        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area',
                sub_area: 'Node context menu'
            }),
            JSON.stringify({
                item_type: 'Button'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Show direct connections'
            })
        );

        store.graphInstance.triggerSelfCentric();
    };

    const renderAdvcancedButtons = () => {
        const buttons = [];

        if (store.graph.currentGraphData.links.length) {
            buttons.push(
                <Button
                    justifyContent="left"
                    onClick={showDirectConnections}
                    key="selfCentricButton"
                    _hover={{ backgroundColor: 'blue.500' }}
                    width="100%"
                >
                    Show direct connections
                </Button>
            );
        }

        return buttons;
    };

    const renderMenus = () => {
        return (
            <ButtonGroup variant="ghost" size="xs" width="100%">
                {store.contextMenu.contextType === 'node' && (
                    <VStack align="stretch" spacing="0" width="100%">
                        <Button
                            justifyContent="left"
                            onClick={selectNode}
                            _hover={{ backgroundColor: 'blue.500' }}
                            width="100%"
                        >
                            {store.contextMenu.originNode?.selected
                                ? 'Deselect node'
                                : 'Select node'}
                        </Button>
                        {!store.graphInstance.isSelfCentric && (
                            <Button
                                justifyContent="left"
                                onClick={selectComponent}
                                _hover={{ backgroundColor: 'blue.500' }}
                                width="100%"
                            >
                                {store.graph.currentGraphData.selectedComponents.includes(
                                    store.contextMenu.originNode?.component
                                )
                                    ? 'Deselect component'
                                    : 'Select component'}
                            </Button>
                        )}
                        {!store.graphInstance.isSelfCentric &&
                            renderAdvcancedButtons()}
                        <Button
                            justifyContent="left"
                            onClick={expandGraph}
                            _hover={{ backgroundColor: 'blue.500' }}
                            width="100%"
                        >
                            Expand graph through node
                        </Button>
                        <Button
                            justifyContent="left"
                            onClick={() => {
                                store.track.trackEvent(
                                    JSON.stringify({
                                        area: 'Graph area',
                                        sub_area: 'Node context menu'
                                    }),
                                    JSON.stringify({
                                        item_type: 'Button'
                                    }),
                                    JSON.stringify({
                                        event_type: 'Click',
                                        event_action: 'Remove node'
                                    })
                                );

                                store.graph.removeSelection(
                                    store.contextMenu.originNode
                                );
                                store.contextMenu.hideContextMenu();
                            }}
                            width="100%"
                            _hover={{ backgroundColor: 'blue.500' }}
                        >
                            Remove node
                        </Button>
                    </VStack>
                )}

                {store.contextMenu.contextType === 'canvas' && (
                    <VStack align="stretch" spacing="15px" width="100%">
                        <VStack align="stretch" spacing="0" width="100%">
                            <Button
                                disabled={
                                    store.graph.currentGraphData.selectedNodes
                                        .length < 1
                                }
                                justifyContent="left"
                                _hover={{ backgroundColor: 'blue.500' }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                    _hover: {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                                onClick={deselectAllNodes}
                                width="100%"
                            >
                                Deselect all
                            </Button>
                            <Button
                                justifyContent="left"
                                disabled={
                                    !store.graphInstance.isFiltered &&
                                    !store.graphInstance.isSelfCentric
                                }
                                _hover={{ backgroundColor: 'blue.500' }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                    _hover: {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Graph area',
                                            sub_area: 'Canvas context menu'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Show all nodes'
                                        })
                                    );

                                    store.graphInstance.toggleVisibleComponents(
                                        -1
                                    );
                                    store.graphInstance.setIsFiltered(false);
                                    store.graphInstance.resetSelfCentric();
                                    store.contextMenu.hideContextMenu();
                                }}
                                width="100%"
                            >
                                View all
                            </Button>
                        </VStack>
                        <VStack
                            borderTop="1px solid #ffffff33"
                            position="relative"
                            marginTop="10px"
                            spacing="0"
                            paddingTop="15px"
                        >
                            <Text
                                fontSize="12px"
                                fontWeight="bold"
                                position="absolute"
                                color="whiteAlpha.500"
                                top="-10px"
                                left="2px"
                                backgroundColor="black"
                                padding="0 5px"
                            >
                                Canvas
                            </Text>
                            <Button
                                justifyContent="left"
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Graph area',
                                            sub_area: 'Node context menu'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Fit graph to view'
                                        })
                                    );

                                    store.graphInstance.zoomToFit();
                                    store.contextMenu.hideContextMenu();
                                }}
                                _hover={{ backgroundColor: 'blue.500' }}
                                width="100%"
                            >
                                Fit graph to view
                            </Button>
                            <Button
                                justifyContent="left"
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Graph area',
                                            sub_area: 'Node context menu'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Take screenshot'
                                        })
                                    );

                                    store.graphInstance.takeScreenshot();
                                    store.contextMenu.hideContextMenu();
                                }}
                                _hover={{ backgroundColor: 'blue.500' }}
                                width="100%"
                            >
                                Take screenshot
                            </Button>
                        </VStack>
                        <VStack
                            borderTop="1px solid #ffffff33"
                            position="relative"
                            marginTop="10px"
                            spacing="0"
                            paddingTop="15px"
                        >
                            <Text
                                fontSize="12px"
                                fontWeight="bold"
                                position="absolute"
                                color="whiteAlpha.500"
                                top="-10px"
                                left="2px"
                                backgroundColor="black"
                                padding="0 5px"
                            >
                                Remove
                            </Text>
                            <Button
                                justifyContent="left"
                                disabled={
                                    !store.graph.currentGraphData.selectedNodes
                                        .length
                                }
                                width="100%"
                                _hover={{ backgroundColor: 'blue.500' }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                    _hover: {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Graph area',
                                            sub_area: 'Canvas context menu'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action:
                                                'Remove selected nodes'
                                        })
                                    );

                                    store.graph.removeSelection();
                                    store.contextMenu.hideContextMenu();
                                }}
                            >
                                Remove selected
                            </Button>
                            <Button
                                justifyContent="left"
                                disabled={
                                    !store.graphInstance.isSelfCentric &&
                                    !store.graphInstance.isFiltered
                                }
                                width="100%"
                                _hover={{ backgroundColor: 'blue.500' }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                    _hover: {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Graph area',
                                            sub_area: 'Canvas context menu'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Remove invisible'
                                        })
                                    );
                                    store.graph.trimNetwork();
                                    store.contextMenu.hideContextMenu();
                                }}
                            >
                                Remove invisible
                            </Button>
                        </VStack>
                        <VStack
                            borderTop="1px solid #ffffff33"
                            position="relative"
                            marginTop="10px"
                            spacing="0"
                            paddingTop="15px"
                        >
                            <Text
                                fontSize="12px"
                                fontWeight="bold"
                                position="absolute"
                                color="whiteAlpha.500"
                                top="-10px"
                                left="2px"
                                backgroundColor="black"
                                padding="0 5px"
                            >
                                Expand
                            </Text>
                            <Button
                                justifyContent="left"
                                disabled={
                                    store.graph.currentGraphData.selectedNodes
                                        .length < 2
                                }
                                width="100%"
                                _hover={{ backgroundColor: 'blue.500' }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                    _hover: {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Graph area',
                                            sub_area: 'Canvas context menu'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Broad expand',
                                            event_value:
                                                store.graph.currentGraphData.selectedNodes.map(
                                                    node => {
                                                        return {
                                                            label: node.label,
                                                            feature:
                                                                node.feature
                                                        };
                                                    }
                                                )
                                        })
                                    );

                                    store.graph.expandNetwork(
                                        store.graph.currentGraphData
                                            .selectedNodes,
                                        'or'
                                    );
                                    store.contextMenu.hideContextMenu();
                                }}
                            >
                                Broad expand
                            </Button>
                            <Button
                                justifyContent="left"
                                disabled={
                                    store.graph.currentGraphData.selectedNodes
                                        .length < 2
                                }
                                width="100%"
                                _hover={{ backgroundColor: 'blue.500' }}
                                _disabled={{
                                    opacity: 0.5,
                                    cursor: 'not-allowed',
                                    _hover: {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Graph area',
                                            sub_area: 'Canvas context menu'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Narrow expand',
                                            event_value:
                                                store.graph.currentGraphData.selectedNodes.map(
                                                    node => {
                                                        return {
                                                            label: node.label,
                                                            feature:
                                                                node.feature
                                                        };
                                                    }
                                                )
                                        })
                                    );

                                    store.graph.expandNetwork(
                                        store.graph.currentGraphData
                                            .selectedNodes,
                                        'and'
                                    );
                                    store.contextMenu.hideContextMenu();
                                }}
                            >
                                Narrow expand
                            </Button>
                        </VStack>
                    </VStack>
                )}
            </ButtonGroup>
        );
    };

    const renderNodeDetails = () => {
        if (!store.contextMenu.originNode) {
            return <></>;
        }

        return (
            <VStack
                width="100%"
                padding="10px"
                maxHeight="200px"
                overflowY="scroll"
            >
                <Text fontSize="xs" width="100%">
                    <Text as="span" fontWeight="black">
                        Label:{' '}
                    </Text>
                    {store.contextMenu.originNode.label}
                </Text>
                <Text fontSize="xs" width="100%">
                    <Text as="span" fontWeight="black">
                        Feature:{' '}
                    </Text>
                    {store.contextMenu.originNode.feature}
                </Text>
                <Text fontSize="xs" width="100%">
                    <Text as="span" fontWeight="black">
                        Neighbour count:{' '}
                    </Text>
                    {store.contextMenu.originNode.neighbours.size}
                </Text>
            </VStack>
        );
    };

    return (
        <Box
            ref={contextMenuRef}
            position="absolute"
            zIndex="999"
            top={store.contextMenu.y}
            left={store.contextMenu.x}
            display={store.contextMenu.isVisible ? 'block' : 'none'}
            backgroundColor={colorMode === 'light' ? 'white' : 'black'}
            padding="4px 5px 5px"
            borderRadius="10px"
            width="200px"
            border="1px solid"
            borderColor={
                colorMode === 'light' ? 'blackAlpha.200' : 'transparent'
            }
        >
            {['canvas', 'node'].includes(store.contextMenu.contextType) &&
                renderMenus()}
            {store.contextMenu.contextType === 'node_details' &&
                renderNodeDetails()}
        </Box>
    );
}

export default observer(ContextMenu);
