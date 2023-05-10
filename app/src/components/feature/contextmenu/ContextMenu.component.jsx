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
                    'Graph Area - Context Menu',
                    'Outside',
                    JSON.stringify({
                        type: 'Click',
                        value: 'Close context menu'
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
            'Graph Area - Context Menu',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `${nodeIndex !== -1 ? 'Deselect' : 'Select'} node`
            })
        );

        store.graph.toggleNodeSelection(
            store.contextMenu.originNode.id,
            nodeIndex
        );
        store.contextMenu.hideContextMenu();
    };

    const removeSelection = () => {
        store.track.trackEvent(
            'Graph Area - Context Menu',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `Remove node: ${store.contextMenu.originNode.id}`
            })
        );

        store.graph.removeSelection(store.contextMenu.originNode);
        store.contextMenu.hideContextMenu();
    };

    const expandGraph = () => {
        store.track.trackEvent(
            'Graph Area - Context Menu',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `Expand graph through node ${store.contextMenu.originNode.id}`
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
            'Graph Area - Context Menu',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `${
                    !store.graph.currentGraphData.selectedComponents.includes(
                        componentId
                    )
                        ? 'Deselect'
                        : 'Select'
                } component ${componentId}`
            })
        );

        store.graph.selectComponent(componentId);
        store.contextMenu.hideContextMenu();
    };

    const triggerSelfCentric = () => {
        store.track.trackEvent(
            'Graph Area - Context Menu',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: 'Show direct connections'
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
                    onClick={triggerSelfCentric}
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
            <ButtonGroup variant="ghost" size="xs" width="100%">
                <VStack align="stretch" spacing="15px" width="100%">
                    <VStack position="relative" spacing="0">
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
                    </VStack>
                    <VStack
                        borderTop="1px solid #ffffff33"
                        position="relative"
                        marginTop="10px"
                        spacing="0"
                        paddingTop="10px"
                    >
                        <Text
                            fontSize="12px"
                            fontWeight="bold"
                            position="absolute"
                            color="whiteAlpha.500"
                            top="-10px"
                            left="2px"
                            backgroundColor="black"
                            padding="0 10px"
                        >
                            Remove
                        </Text>
                        <Button
                            justifyContent="left"
                            onClick={removeSelection}
                            width="100%"
                            _hover={{ backgroundColor: 'blue.500' }}
                        >
                            Remove node
                        </Button>
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
                                    'Graph Area - Context Menu',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Remove selection from graph'
                                    })
                                );
                                store.graph.removeSelection();
                                store.contextMenu.hideContextMenu();
                            }}
                        >
                            Remove selected nodes
                        </Button>
                    </VStack>
                </VStack>
            </ButtonGroup>
        </Box>
    );
}

export default observer(ContextMenu);
