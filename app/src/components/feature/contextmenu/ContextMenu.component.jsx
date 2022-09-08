import { Button, ButtonGroup } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import { useOutsideClick } from '@chakra-ui/hooks';
import { Box, VStack } from '@chakra-ui/layout';
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
                store.track.trackEvent('graph', 'click', 'hide context menu');
                store.contextMenu.hideContextMenu();
            }
        }
    });

    const selectNode = () => {
        const nodeIndex = store.graph.currentGraphData.selectedNodes.findIndex(
            node => node.id === store.contextMenu.originNode.id
        );

        store.track.trackEvent(
            'context menu',
            'button click',
            `${nodeIndex !== -1 ? 'deselect' : 'select'} node: {label: ${
                store.contextMenu.originNode.label
            }, id: ${store.contextMenu.originNode.id}}`
        );

        store.graph.toggleNodeSelection(
            store.contextMenu.originNode.id,
            nodeIndex
        );
        store.contextMenu.hideContextMenu();
    };

    const selectComponent = () => {
        const componentId = store.contextMenu.originNode.component;
        store.graph.selectComponent(componentId);
        store.contextMenu.hideContextMenu();
    };

    const selfCentric = () => {
        store.track.trackEvent(
            'context menu',
            'button click',
            `view direct connections of node: {label: ${store.contextMenu.originNode.label}, id: ${store.contextMenu.originNode.id}}`
        );
        store.graphInstance.triggerSelfCentric();
    };

    const renderAdvcancedButtons = () => {
        const buttons = [];

        if (store.graph.currentGraphData.links.length) {
            buttons.push(
                <Button
                    justifyContent="left"
                    onClick={selfCentric}
                    key="selfCentricButton"
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
            padding="5px"
            borderRadius="10px"
            width="200px"
        >
            <ButtonGroup variant="ghost" size="xs" width="100%">
                <VStack align="stretch" spacing="0" width="100%">
                    <Button justifyContent="left" onClick={selectNode}>
                        {store.contextMenu.originNode?.selected
                            ? 'Deselect node'
                            : 'Select node'}
                    </Button>
                    {!store.graphInstance.isSelfCentric && (
                        <Button justifyContent="left" onClick={selectComponent}>
                            {store.graph.currentGraphData.selectedComponents.includes(
                                store.contextMenu.originNode?.component
                            )
                                ? 'Deselect component'
                                : 'Select component'}
                        </Button>
                    )}
                    {!store.graphInstance.isSelfCentric &&
                        renderAdvcancedButtons()}
                </VStack>
            </ButtonGroup>
        </Box>
    );
}

export default observer(ContextMenu);
