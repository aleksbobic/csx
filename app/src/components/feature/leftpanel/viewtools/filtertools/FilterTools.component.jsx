import { Button } from '@chakra-ui/button';
import { Heading, HStack, Text, VStack } from '@chakra-ui/layout';
import {
    IconButton,
    Select,
    Tooltip,
    Accordion,
    AccordionItem,
    AccordionPanel,
    AccordionIcon,
    AccordionButton,
    RangeSlider,
    RangeSliderMark,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb
} from '@chakra-ui/react';
import {
    FormatSeparator,
    LivePhoto,
    PathIntersect,
    RadioChecked
} from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';

import { RootStoreContext } from 'stores/RootStore';

function FilterTools() {
    const store = useContext(RootStoreContext);

    const [filterSliderMinValue, setFilterSliderMinValue] = useState(0);
    const [filterSliderMaxValue, setFilterSliderMaxValue] = useState(
        store.graph.currentGraphData.meta.maxDegree
    );
    const [filterSliderCurrentMinValue, setFilterSliderCurrentMinValue] =
        useState(0);
    const [filterSliderCurrentMaxValue, setFilterSliderCurrentMaxValue] =
        useState(store.graph.currentGraphData.meta.maxDegree);

    useEffect(() => {
        if (store.graphInstance.filterProperty === 'degree') {
            setFilterSliderMinValue(0);
            setFilterSliderCurrentMinValue(0);
            setFilterSliderMaxValue(
                store.graph.currentGraphData.meta.maxDegree
            );
            setFilterSliderCurrentMaxValue(
                store.graph.currentGraphData.meta.maxDegree
            );
        } else if (store.graphInstance.filterProperty === 'edge_weight') {
            setFilterSliderMinValue(1);
            setFilterSliderCurrentMinValue(1);
            setFilterSliderMaxValue(
                store.graph.currentGraphData.meta.maxEdgeWeight
            );
            setFilterSliderCurrentMaxValue(
                store.graph.currentGraphData.meta.maxEdgeWeight
            );
        } else {
            setFilterSliderMinValue(
                store.search.searchHints[store.graphInstance.filterProperty].min
            );
            setFilterSliderCurrentMinValue(
                store.search.searchHints[store.graphInstance.filterProperty].min
            );
            setFilterSliderMaxValue(
                store.search.searchHints[store.graphInstance.filterProperty].max
            );
            setFilterSliderCurrentMaxValue(
                store.search.searchHints[store.graphInstance.filterProperty].max
            );
        }
    }, [
        store.graphInstance.filterProperty,
        store.core.currentGraph,
        store.graph.currentGraphData.meta.maxDegree,
        store.search.searchHints,
        store.graph.currentGraphData.meta.maxEdgeWeight
    ]);

    const filterElements = values => {
        if (
            values[0] === filterSliderMinValue &&
            values[1] === filterSliderMaxValue
        ) {
            store.graphInstance.resetAllFilters();
        } else if (store.graphInstance.filterProperty === 'edge_weight') {
            store.graphInstance.filterEdgesByMinMaxVal(values[0], values[1]);
        } else {
            store.graphInstance.filterNodesByNumericProp(
                values[0],
                values[1],
                store.graphInstance.filterProperty
            );
        }

        store.graphInstance.setIsFiltered(
            values[0] !== filterSliderMinValue ||
                values[1] !== filterSliderMaxValue
        );
    };

    return (
        <Accordion
            width="100%"
            backgroundColor="whiteAlpha.200"
            padding="5px 10px 0"
            borderRadius="10px"
            allowToggle={true}
            style={{ marginTop: '15px' }}
        >
            <AccordionItem>
                <AccordionButton
                    style={{
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingBottom: '10px',
                        textAlign: 'left',
                        borderRadius: '10px',
                        outline: 'none',
                        boxShadow: 'none'
                    }}
                >
                    <Heading size="sm" width="100%">
                        Filtering
                    </Heading>
                    <AccordionIcon />
                </AccordionButton>
                <AccordionPanel padding="0">
                    <VStack width="100%" padding="10px 0" borderRadius="6px">
                        <Button
                            leftIcon={
                                <RadioChecked style={{ '--ggs': '0.5' }} />
                            }
                            isDisabled={
                                !store.graph.currentGraphData.selectedNodes
                                    .length
                            }
                            size="sm"
                            width="100%"
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
                        >
                            Show selected
                        </Button>
                    </VStack>
                    <VStack
                        backgroundColor="whiteAlpha.50"
                        width="100%"
                        padding="10px"
                        borderRadius="6px"
                        style={{ marginBottom: '10px' }}
                    >
                        <Text fontSize="sm" width="100%">
                            Direct connections
                        </Text>

                        <HStack width="100%">
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
                                        <LivePhoto style={{ '--ggs': '0.8' }} />
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
                    <VStack
                        backgroundColor="whiteAlpha.50"
                        width="100%"
                        padding="10px 10px 15px"
                        borderRadius="6px"
                        style={{ marginBottom: '10px' }}
                    >
                        <Text fontSize="sm" width="100%">
                            Filtering
                        </Text>
                        <HStack
                            justifyContent="space-between"
                            width="100%"
                            paddingBottom="10px"
                        >
                            <Text fontSize="sm">Feature: </Text>
                            <Tooltip label="Select property used for filtering.">
                                <Select
                                    size="sm"
                                    value={store.graphInstance.filterProperty}
                                    onChange={e => {
                                        store.graphInstance.setFilterProperty(
                                            e.target.value
                                        );

                                        store.track.trackEvent(
                                            'Side panel - View Settings',
                                            'Select Element - Node Color',
                                            JSON.stringify({
                                                type: 'Change selection',
                                                value: e.target.value
                                            })
                                        );
                                    }}
                                    variant="filled"
                                    borderRadius="6px"
                                    width="100px"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                >
                                    <option value="degree">
                                        Node neighbour count
                                    </option>

                                    {Object.keys(store.search.nodeTypes)
                                        .map(feature => {
                                            return {
                                                feature: feature,
                                                type: store.search.nodeTypes[
                                                    feature
                                                ]
                                            };
                                        })
                                        .filter(
                                            entry =>
                                                ['integer', 'float'].includes(
                                                    entry['type']
                                                ) &&
                                                store.core.isOverview &&
                                                store.graph.currentGraphData.meta.anchorProperties
                                                    .map(
                                                        entry =>
                                                            entry['property']
                                                    )
                                                    .includes(entry['feature'])
                                        )
                                        .map(entry => (
                                            <option
                                                key={`node_prop_${entry['feature']}`}
                                                value={entry['feature']}
                                            >
                                                Node {entry['feature']}
                                            </option>
                                        ))}
                                    <option value="edge_weight">
                                        Edge weight
                                    </option>
                                </Select>
                            </Tooltip>
                        </HStack>
                        <Tooltip
                            label={`Min: ${filterSliderCurrentMinValue} | Max: ${filterSliderCurrentMaxValue}`}
                        >
                            <VStack
                                spacing="1"
                                style={{
                                    width: '100%',
                                    marginBottom: '20px',
                                    paddingLeft: '10px',
                                    paddingRight: '20px'
                                }}
                            >
                                <RangeSlider
                                    value={[
                                        filterSliderCurrentMinValue,
                                        filterSliderCurrentMaxValue
                                    ]}
                                    min={filterSliderMinValue}
                                    max={filterSliderMaxValue}
                                    step={1}
                                    onChange={value => {
                                        setFilterSliderCurrentMinValue(
                                            value[0]
                                        );
                                        setFilterSliderCurrentMaxValue(
                                            value[1]
                                        );
                                    }}
                                    onChangeEnd={filterElements}
                                >
                                    <RangeSliderMark
                                        value={filterSliderMinValue}
                                        fontSize="xs"
                                        marginTop="10px"
                                    >
                                        {filterSliderMinValue}
                                    </RangeSliderMark>
                                    <RangeSliderMark
                                        value={filterSliderMaxValue}
                                        fontSize="xs"
                                        marginTop="10px"
                                    >
                                        {filterSliderMaxValue}
                                    </RangeSliderMark>

                                    <RangeSliderTrack>
                                        <RangeSliderFilledTrack />
                                    </RangeSliderTrack>
                                    <RangeSliderThumb index={0} />
                                    <RangeSliderThumb index={1} />
                                </RangeSlider>
                            </VStack>
                        </Tooltip>
                    </VStack>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
    );
}

export default observer(FilterTools);
