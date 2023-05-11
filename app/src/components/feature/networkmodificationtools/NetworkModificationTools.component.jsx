import { Heading, Text, VStack, HStack } from '@chakra-ui/layout';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    IconButton,
    Tooltip
} from '@chakra-ui/react';
import {
    FormatSeparator,
    LivePhoto,
    PathIntersect,
    RadioChecked
} from 'css.gg';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { RootStoreContext } from 'stores/RootStore';

function NetworkModificationTools() {
    const store = useContext(RootStoreContext);

    const renderVisibilityOptions = () => {
        return (
            <>
                <Accordion
                    width="100%"
                    backgroundColor="whiteAlpha.200"
                    padding="5px 10px 0"
                    borderRadius="10px"
                    allowToggle={true}
                    defaultIndex={0}
                >
                    <AccordionItem>
                        <AccordionButton
                            style={{
                                paddingLeft: 0,
                                paddingRight: 0,
                                textAlign: 'left',
                                borderRadius: '10px',
                                outline: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            <Heading size="sm" width="100%">
                                Remove
                            </Heading>
                            <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel padding="10px 0 0">
                            <VStack
                                backgroundColor="whiteAlpha.50"
                                width="100%"
                                padding="10px"
                                borderRadius="6px"
                                style={{ marginBottom: '10px' }}
                            >
                                <Text fontSize="sm" width="100%">
                                    Selected nodes
                                </Text>

                                <HStack width="100%">
                                    <Tooltip label="Show selected nodes">
                                        <IconButton
                                            borderRadius="6px"
                                            id="selectednodes"
                                            isDisabled={
                                                !store.graph.currentGraphData
                                                    .selectedNodes.length
                                            }
                                            size="sm"
                                            icon={
                                                <RadioChecked
                                                    style={{ '--ggs': '0.6' }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );
                                                store.graphInstance.triggerSelectedNodes();
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Show direct connections">
                                        <IconButton
                                            borderRadius="6px"
                                            id="alldirectconnections"
                                            isDisabled={
                                                store.graph.currentGraphData
                                                    .selectedNodes.length < 1
                                            }
                                            size="sm"
                                            icon={
                                                <LivePhoto
                                                    style={{ '--ggs': '0.8' }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show direct connections of selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );

                                                store.graphInstance.triggerMultiSelfCentric();
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Show mutual connections">
                                        <IconButton
                                            borderRadius="6px"
                                            id="mutualconnectionsbutton"
                                            isDisabled={
                                                store.graph.currentGraphData
                                                    .selectedNodes.length < 2
                                            }
                                            size="sm"
                                            icon={
                                                <PathIntersect
                                                    style={{ '--ggs': '0.8' }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show mutual connections of selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );
                                                store.graphInstance.triggerMultiSelfCentric(
                                                    true
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Show nodes in same search results">
                                        <IconButton
                                            borderRadius="6px"
                                            id="mutualentriesoriginbutton"
                                            isDisabled={
                                                store.graph.currentGraphData
                                                    .selectedNodes.length < 1
                                            }
                                            size="sm"
                                            style={{}}
                                            icon={
                                                <FormatSeparator
                                                    style={{
                                                        '--ggs': '0.7',
                                                        marginTop: '5px'
                                                    }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show nodes with same entries as all selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );
                                                store.graphInstance.triggerSameEntry(
                                                    true
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                </HStack>
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
                <Accordion
                    width="100%"
                    backgroundColor="whiteAlpha.200"
                    padding="5px 10px 0"
                    borderRadius="10px"
                    allowToggle={true}
                    defaultIndex={0}
                    style={{ marginTop: '15px' }}
                >
                    <AccordionItem>
                        <AccordionButton
                            style={{
                                paddingLeft: 0,
                                paddingRight: 0,
                                textAlign: 'left',
                                borderRadius: '10px',
                                outline: 'none',
                                boxShadow: 'none'
                            }}
                        >
                            <Heading size="sm" width="100%">
                                Expand
                            </Heading>
                            <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel padding="10px 0 0">
                            <VStack
                                backgroundColor="whiteAlpha.50"
                                width="100%"
                                padding="10px"
                                borderRadius="6px"
                                style={{ marginBottom: '10px' }}
                            >
                                <Text fontSize="sm" width="100%">
                                    Selected nodes
                                </Text>

                                <HStack width="100%">
                                    <Tooltip label="Show selected nodes">
                                        <IconButton
                                            borderRadius="6px"
                                            id="selectednodes"
                                            isDisabled={
                                                !store.graph.currentGraphData
                                                    .selectedNodes.length
                                            }
                                            size="sm"
                                            icon={
                                                <RadioChecked
                                                    style={{ '--ggs': '0.6' }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );
                                                store.graphInstance.triggerSelectedNodes();
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Show direct connections">
                                        <IconButton
                                            borderRadius="6px"
                                            id="alldirectconnections"
                                            isDisabled={
                                                store.graph.currentGraphData
                                                    .selectedNodes.length < 1
                                            }
                                            size="sm"
                                            icon={
                                                <LivePhoto
                                                    style={{ '--ggs': '0.8' }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show direct connections of selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );

                                                store.graphInstance.triggerMultiSelfCentric();
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Show mutual connections">
                                        <IconButton
                                            borderRadius="6px"
                                            id="mutualconnectionsbutton"
                                            isDisabled={
                                                store.graph.currentGraphData
                                                    .selectedNodes.length < 2
                                            }
                                            size="sm"
                                            icon={
                                                <PathIntersect
                                                    style={{ '--ggs': '0.8' }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show mutual connections of selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );
                                                store.graphInstance.triggerMultiSelfCentric(
                                                    true
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Show nodes in same search results">
                                        <IconButton
                                            borderRadius="6px"
                                            id="mutualentriesoriginbutton"
                                            isDisabled={
                                                store.graph.currentGraphData
                                                    .selectedNodes.length < 1
                                            }
                                            size="sm"
                                            style={{}}
                                            icon={
                                                <FormatSeparator
                                                    style={{
                                                        '--ggs': '0.7',
                                                        marginTop: '5px'
                                                    }}
                                                />
                                            }
                                            onClick={() => {
                                                store.track.trackEvent(
                                                    'Side Panel - Direct Connections',
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: 'Show nodes with same entries as all selected nodes',
                                                        nodes: store.graph.currentGraphData.selectedNodes.map(
                                                            node => {
                                                                return {
                                                                    id: node.id,
                                                                    label: node.label
                                                                };
                                                            }
                                                        )
                                                    })
                                                );
                                                store.graphInstance.triggerSameEntry(
                                                    true
                                                );
                                            }}
                                        />
                                    </Tooltip>
                                </HStack>
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
            </>
        );
    };

    return (
        <VStack
            align="center"
            direction="column"
            paddingLeft="0"
            paddingRight="0"
            id="viewsettingscomponent"
            width="100%"
        >
            <VStack spacing="2px" align="start" width="100%">
                {renderVisibilityOptions()}
            </VStack>
        </VStack>
    );
}

export default observer(NetworkModificationTools);
