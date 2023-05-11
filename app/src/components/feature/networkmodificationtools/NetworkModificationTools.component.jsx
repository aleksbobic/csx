import { Heading, Text, VStack, HStack } from '@chakra-ui/layout';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    IconButton,
    Tooltip,
    Button
} from '@chakra-ui/react';
import {
    ScissorsIcon,
    Squares2X2Icon,
    StopIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
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
                                width="100%"
                                spacing="10px"
                                paddingBottom="10px"
                            >
                                <Button
                                    leftIcon={
                                        <TrashIcon width="16px" height="16px" />
                                    }
                                    width="100%"
                                    size="sm"
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
                                    }}
                                >
                                    Remove selected
                                </Button>
                                <Button
                                    leftIcon={
                                        <ScissorsIcon
                                            width="16px"
                                            height="16px"
                                        />
                                    }
                                    width="100%"
                                    size="sm"
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Side Panel - Network Modification',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Trim network'
                                            })
                                        );
                                        store.graph.trimNetwork();
                                    }}
                                >
                                    Remove Invisible
                                </Button>
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
                                width="100%"
                                spacing="10px"
                                paddingBottom="10px"
                            >
                                <Button
                                    leftIcon={
                                        <Squares2X2Icon
                                            width="16px"
                                            height="16px"
                                        />
                                    }
                                    width="100%"
                                    size="sm"
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Side Panel - Network Modification',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Wide expand network',
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

                                        store.graph.expandNetwork(
                                            store.graph.currentGraphData
                                                .selectedNodes,
                                            'or'
                                        );
                                    }}
                                >
                                    Broad Expand
                                </Button>
                                <Button
                                    leftIcon={
                                        <StopIcon
                                            width="12px"
                                            height="12px"
                                            strokeWidth="2px"
                                        />
                                    }
                                    width="100%"
                                    size="sm"
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Side Panel - Network Modification',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Narrow expand network',
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

                                        store.graph.expandNetwork(
                                            store.graph.currentGraphData
                                                .selectedNodes,
                                            'and'
                                        );
                                    }}
                                >
                                    Narrow expand
                                </Button>
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
