import { Button } from '@chakra-ui/button';
import { Checkbox } from '@chakra-ui/checkbox';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import {
    Box,
    Divider,
    Heading,
    HStack,
    Stack,
    Text,
    VStack
} from '@chakra-ui/layout';
import { Radio, RadioGroup } from '@chakra-ui/radio';
import {
    IconButton,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    RangeSlider,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    RangeSliderTrack,
    Tag,
    useColorModeValue,
    Wrap
} from '@chakra-ui/react';
import {
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack
} from '@chakra-ui/slider';
import { Switch } from '@chakra-ui/switch';
import { Tooltip } from '@chakra-ui/tooltip';
import { Bolt, Undo } from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';

function Settings() {
    const location = useLocation();
    const store = useContext(RootStoreContext);

    const [sliderMinTooltipValue, setSliderMinTooltipValue] = useState(0);
    const [sliderMaxTooltipValue, setSliderMaxTooltipValue] = useState(
        store.graph.currentGraphData.meta.maxDegree
    );

    const [sliderMaxValue, setSliderMaxValue] = useState(
        store.graph.currentGraphData.meta.maxDegree
    );

    useEffect(() => {
        setSliderMaxValue(store.graph.currentGraphData.meta.maxDegree);
        setSliderMaxTooltipValue(store.graph.currentGraphData.meta.maxDegree);
    }, [store.graph.currentGraphData.meta.maxDegree]);

    const graphDimensionBackground = useColorModeValue(
        'blackAlpha.400',
        'whiteAlpha.300'
    );

    const graphDimensionHoverBackground = useColorModeValue(
        'blue.500',
        'blue.700'
    );

    const updateColorScheme = value => {
        store.graphInstance.setNodeColorScheme(value);

        store.graph.updateLinkColor();
        store.graph.updateNodeColor();

        store.track.trackEvent(
            'view settings',
            'select value',
            `color scheme: ${value.toLowerCase()}`
        );
    };

    const updateLabelDistance = value => {
        store.graphInstance.changeShowLabelDistance(value);
        store.track.trackEvent(
            'view settings',
            'select value',
            `show label distance: ${value}`
        );
    };

    const renderColorSchemeSelectionElements = () => {
        const colorSchemas = [
            { value: 'none', label: 'None', tooltip: 'Nodes are not colored' },
            {
                value: 'component',
                label: 'Node component',
                tooltip: 'Color nodes based on their components'
            }
        ];

        if (
            store.core.isDetail &&
            store.graphInstance.nodeColorSchemeColors[[store.core.currentGraph]]
        ) {
            colorSchemas.push({
                value: 'type',
                label: 'Node type',
                tooltip: 'Color nodes based on their type'
            });
        }

        if (
            store.core.isOverview &&
            store.graph.currentGraphData.meta.anchorProperties?.length
        ) {
            store.graph.currentGraphData.meta.anchorProperties.map(entry =>
                colorSchemas.push({
                    value: entry.property,
                    label: entry.property,
                    tooltip: `Color nodes based on node property ${entry.property}`
                })
            );
        }

        return colorSchemas.map(entry => (
            <Radio
                value={entry.value}
                key={`node_cololr_schema${entry.value}`}
                width="100%"
            >
                <Tooltip label={entry.tooltip}>
                    <Text
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        width="170px"
                    >
                        {entry.label}
                    </Text>
                </Tooltip>
            </Radio>
        ));
    };

    const renderColorOptions = () => {
        return (
            <FormLabel htmlFor="customColors" width="100%">
                <Heading size="sm" marginTop="10px" marginBottom="5px">
                    Color scheme:
                </Heading>
                <RadioGroup
                    id="colorschemeselector"
                    value={
                        store.graphInstance.nodeColorScheme[
                            store.core.currentGraph
                        ]
                    }
                    onChange={updateColorScheme}
                >
                    <Stack direction="column" spacing="1px" width="100%">
                        {renderColorSchemeSelectionElements()}
                    </Stack>
                </RadioGroup>
            </FormLabel>
        );
    };

    const renderLabelOptions = () => {
        return (
            <>
                <Text>
                    Label size:{' '}
                    <Text
                        as="span"
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        display="inline"
                    >
                        {
                            store.graphInstance.labels.labelDistances[
                                store.graphInstance.labels.visibilityDistance
                            ]
                        }
                    </Text>
                </Text>
                <Box width="100%" paddingLeft="10px" paddingRight="10px">
                    <Slider
                        value={store.graphInstance.labels.visibilityDistance}
                        min={600}
                        max={4200}
                        step={900}
                        onChange={updateLabelDistance}
                    >
                        <SliderTrack bg="blue.500">
                            <Box position="relative" right={10} />
                            <SliderFilledTrack bg="blue.300" />
                        </SliderTrack>
                        <SliderThumb boxSize={3} />
                    </Slider>
                </Box>
            </>
        );
    };

    const renderLayoutOptions = () => {
        return (
            <VStack width="100%">
                <HStack width="100%">
                    <Tooltip label="Apply force to graph">
                        <Button
                            id="applyforcebutton"
                            size="sm"
                            leftIcon={<Bolt style={{ '--ggs': '0.6' }} />}
                            onClick={() => {
                                store.graphInstance.applyForce();
                                store.track.trackEvent(
                                    'view settings',
                                    'button click',
                                    'apply force'
                                );
                            }}
                            disabled={store.graphInstance.forceEngine}
                            width="100%"
                        >
                            Apply force
                        </Button>
                    </Tooltip>
                    <Tooltip label="Reset node positions">
                        <IconButton
                            id="resetLayoutButton"
                            size="sm"
                            icon={<Undo style={{ '--ggs': '0.6' }} />}
                            onClick={() => {
                                store.graph.resetNodesPositions();
                                store.track.trackEvent(
                                    'view settings',
                                    'button click',
                                    'reset graph layout'
                                );
                            }}
                            disabled={store.graphInstance.forceEngine}
                        />
                    </Tooltip>
                </HStack>
                <Checkbox
                    size="sm"
                    colorScheme="blue"
                    onChange={store.graphInstance.ignoreSelected}
                >
                    Ignore selected
                </Checkbox>
            </VStack>
        );
    };

    const renderVisibilityOptions = () => {
        return (
            <>
                <FormLabel htmlFor="edges" style={{ marginBottom: 0 }}>
                    <Switch
                        id="edges"
                        size="sm"
                        marginRight="10px"
                        isChecked={store.graphInstance.linkVisibility}
                        value={store.graphInstance.linkVisibility}
                        onChange={() => {
                            store.graphInstance.toggleLinkVisibility();
                            store.track.trackEvent(
                                'view settings',
                                'toggle click',
                                `${
                                    store.graphInstance.linkVisibility
                                        ? 'show'
                                        : 'hide'
                                } links`
                            );
                        }}
                    />
                    Edges
                </FormLabel>

                <FormLabel htmlFor="nodelabels">
                    <Switch
                        id="nodelabels"
                        size="sm"
                        marginRight="10px"
                        isChecked={store.graphInstance.labels.isVisible}
                        value={store.graphInstance.labels.isVisible}
                        onChange={() => {
                            store.graphInstance.toggleLabelVisibility();
                            store.track.trackEvent(
                                'view settings',
                                'toggle click',
                                `${
                                    store.graphInstance.labels.isVisible
                                        ? 'show'
                                        : 'hide'
                                } labels`
                            );
                        }}
                    />
                    Node labels
                </FormLabel>
                <FormLabel htmlFor="nodelabels">
                    <Switch
                        id="nodelabels"
                        size="sm"
                        marginRight="10px"
                        isChecked={store.graphInstance.orphanNodeVisibility}
                        value={store.graphInstance.orphanNodeVisibility}
                        onChange={
                            store.graphInstance.toggleOrphanNodeVisibility
                        }
                    />
                    Orphan nodes
                </FormLabel>

                <FormLabel paddingBottom="10px" paddingTop="10px">
                    Filter by connection:
                </FormLabel>
                <HStack
                    style={{ justifyContent: 'space-between', width: '100%' }}
                >
                    <Text size="xs" fontWeight="bold">
                        min
                    </Text>
                    <Text size="xs" fontWeight="bold">
                        max
                    </Text>
                </HStack>
                <HStack spacing={10} style={{ marginBottom: '10px' }}>
                    <NumberInput
                        size="xs"
                        value={sliderMinTooltipValue}
                        onChange={val => {
                            setSliderMinTooltipValue(val);
                            store.graphInstance.filterNodesByDegree(
                                val,
                                sliderMaxTooltipValue
                            );
                        }}
                        min={0}
                        max={sliderMaxTooltipValue}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>

                    <NumberInput
                        size="xs"
                        value={sliderMaxTooltipValue}
                        onChange={val => {
                            setSliderMaxTooltipValue(val);
                            store.graphInstance.filterNodesByDegree(
                                sliderMinTooltipValue,
                                val
                            );
                        }}
                        min={sliderMinTooltipValue}
                        max={sliderMaxValue}
                    >
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </HStack>
                <RangeSlider
                    isDisabled={sliderMaxValue === 0}
                    value={[sliderMinTooltipValue, sliderMaxTooltipValue]}
                    min={0}
                    max={sliderMaxValue}
                    step={1}
                    onChange={val => {
                        setSliderMinTooltipValue(val[0]);
                        setSliderMaxTooltipValue(val[1]);
                    }}
                    onChangeEnd={val =>
                        store.graphInstance.filterNodesByDegree(val[0], val[1])
                    }
                >
                    <RangeSliderTrack bg="blue.100">
                        <RangeSliderFilledTrack bg="blue.500" />
                    </RangeSliderTrack>

                    <RangeSliderThumb boxSize={3} index={0} />
                    <RangeSliderThumb boxSize={3} index={1} />
                </RangeSlider>
            </>
        );
    };

    const renderDimensionsToggle = () => {
        const tags = [
            ...Object.keys(store.search.nodeTypes),
            ...Object.keys(store.search.newNodeTypes)
        ].map((property, index) => (
            <Tag
                key={index}
                size="sm"
                borderRadius="full"
                variant="solid"
                backgroundColor={
                    store.core.visibleDimensions[
                        store.core.currentGraph
                    ].includes(property)
                        ? 'blue.600'
                        : graphDimensionBackground
                }
                transition="all 0.1s ease-in-out"
                _hover={{
                    backgroundColor: graphDimensionHoverBackground,
                    cursor: 'pointer'
                }}
                onClick={() => store.core.toggleVisibleDimension(property)}
            >
                <Tooltip label={property}>
                    <Text
                        size="sm"
                        whiteSpace="nowrap"
                        letterSpacing="0.5px"
                        fontWeight="semibold"
                        maxWidth="140px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {property}
                    </Text>
                </Tooltip>
            </Tag>
        ));

        return (
            <Stack>
                <Heading size="sm" marginTop="10px" marginBottom="5px">
                    Graph dimensions:
                </Heading>
                <Wrap>{tags}</Wrap>
            </Stack>
        );
    };

    return (
        <Stack
            align="center"
            direction="column"
            paddingLeft="0"
            paddingRight="10px"
            id="viewsettingscomponent"
        >
            <FormControl display="flex" alignItems="center" flexDir="column">
                <VStack spacing="2px" align="start" width="100%">
                    <Heading size="md" marginBottom="10px">
                        View Settings
                    </Heading>
                    {renderVisibilityOptions()}
                    <Divider style={{ marginTop: '10px' }} />
                    {renderColorOptions()}
                </VStack>
                <Divider style={{ marginTop: '10px' }} />
                <VStack spacing="10px" align="start" mt="10px" width="100%">
                    {renderLabelOptions()}
                    <Divider />
                    {renderLayoutOptions()}
                    {location.pathname.startsWith('/graph/detail') && (
                        <Divider />
                    )}
                    {location.pathname.startsWith('/graph/detail') &&
                        renderDimensionsToggle()}
                </VStack>
            </FormControl>
        </Stack>
    );
}

export default observer(Settings);
