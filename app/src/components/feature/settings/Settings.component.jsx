import { Skeleton } from '@chakra-ui/skeleton';
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
    Tag,
    TagLabel,
    useColorModeValue,
    Wrap,
    RangeSlider,
    RangeSliderTrack,
    RangeSliderFilledTrack,
    RangeSliderThumb,
    IconButton
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
import { RootStoreContext } from 'stores/RootStore';
import { useLocation } from 'react-router-dom';

function Settings() {
    const location = useLocation();
    const store = useContext(RootStoreContext);

    const [sliderMinTooltipValue, setSliderMinTooltipValue] = useState(0);
    const [sliderMaxTooltipValue, setSliderMaxTooltipValue] = useState(
        store.graph.currentGraphData.meta.maxDegree
    );

    const [showMinTooltip, setShowMinTooltip] = useState(false);
    const [showMaxTooltip, setShowMaxTooltip] = useState(false);

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
                    <Tooltip
                        hasArrow
                        bg="blue.500"
                        color="white"
                        placement="top"
                        isOpen={showMaxTooltip}
                        label={`${sliderMinTooltipValue}`}
                    >
                        <RangeSliderThumb
                            boxSize={3}
                            index={0}
                            onMouseEnter={() => setShowMaxTooltip(true)}
                            onMouseLeave={() => setShowMaxTooltip(false)}
                        />
                    </Tooltip>
                    <Tooltip
                        hasArrow
                        bg="blue.500"
                        color="white"
                        placement="top"
                        isOpen={showMinTooltip}
                        label={`${sliderMaxTooltipValue}`}
                    >
                        <RangeSliderThumb
                            boxSize={3}
                            index={1}
                            onMouseEnter={() => setShowMinTooltip(true)}
                            onMouseLeave={() => setShowMinTooltip(false)}
                        />
                    </Tooltip>
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
                <Text
                    size="sm"
                    whiteSpace="nowrap"
                    letterSpacing="0.5px"
                    fontWeight="semibold"
                >
                    {property}
                </Text>
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

    const getLargestNodes = nodes => {
        if (nodes && nodes.length === 0) {
            return;
        }

        return (
            <Wrap width="100%" spacing="1">
                {nodes.map(node => (
                    <Tag
                        size="sm"
                        variant="solid"
                        borderRadius="full"
                        margin="2px"
                        background={
                            store.graphInstance.nodeColorSchemeColors[
                                [store.core.currentGraph]
                            ][node.feature]
                        }
                        key={node.id}
                    >
                        <Tooltip label={node.label}>
                            <TagLabel
                                width="100%"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                            >
                                {node.label}
                            </TagLabel>
                        </Tooltip>
                    </Tag>
                ))}
            </Wrap>
        );
    };

    const getLargestConnections = (connections, component_id) => {
        if (!connections || (connections && connections.length === 0)) {
            return;
        }

        return (
            <Wrap width="100%" spacing="1">
                {connections.map((connection, id) => (
                    <Tag
                        size="sm"
                        variant="solid"
                        borderRadius="full"
                        margin="2px"
                        background="blue.500"
                        key={`${component_id}_largest_connection_${id}`}
                    >
                        <Tooltip
                            label={
                                <Text fontWeight="normal">
                                    Common connection{' '}
                                    <Tag
                                        fontWeight="bold"
                                        colorScheme="blackAlpha"
                                        variant="solid"
                                        size="sm"
                                    >
                                        {connection.label}
                                    </Tag>{' '}
                                    appearing{' '}
                                    <Tag
                                        fontWeight="bold"
                                        colorScheme="blackAlpha"
                                        variant="solid"
                                        size="sm"
                                    >
                                        {connection.count}{' '}
                                        {connection.count > 1
                                            ? 'times'
                                            : 'time'}
                                    </Tag>
                                    .
                                </Text>
                            }
                        >
                            <TagLabel
                                width="100%"
                                overflow="hidden"
                                whiteSpace="nowrap"
                                textOverflow="ellipsis"
                            >
                                {connection.label}: {connection.count}
                            </TagLabel>
                        </Tooltip>
                    </Tag>
                ))}
            </Wrap>
        );
    };

    const renderComponentToggle = componentData => {
        const components = [
            {
                id: -1,
                node_count: 'All',
                largest_nodes: [],
                largest_connections: []
            },
            ...componentData
        ].map(component => (
            <Tag
                key={component.id}
                size="sm"
                borderRadius="10px"
                variant="solid"
                padding="10px"
                width={
                    (store.core.isOverview &&
                        component.largest_connections &&
                        component.largest_connections.length > 0) ||
                    (store.core.isDetail &&
                        component.largest_nodes &&
                        component.largest_nodes.length > 0) ||
                    component.id === -1
                        ? '100%'
                        : '46%'
                }
                backgroundColor={graphDimensionBackground}
                transition="all 0.1s ease-in-out"
                _hover={{
                    opacity: 0.8,
                    cursor: 'pointer'
                }}
                onClick={() =>
                    store.graphInstance.toggleVisibleComponents(component.id)
                }
            >
                <VStack width="100%">
                    <HStack width="100%" justify="space-between">
                        <Text
                            size="sm"
                            whiteSpace="nowrap"
                            letterSpacing="0.5px"
                            fontWeight="semibold"
                        >
                            {component.node_count} nodes{' '}
                        </Text>
                        <Box
                            height="10px"
                            width="10px"
                            backgroundColor={
                                store.graphInstance.visibleComponent ===
                                component.id
                                    ? 'blue.600'
                                    : graphDimensionBackground
                            }
                            borderRadius="full"
                        ></Box>
                    </HStack>
                    {store.core.isOverview
                        ? getLargestConnections(
                              component.largest_connections,
                              component.id
                          )
                        : getLargestNodes(component.largest_nodes)}
                </VStack>
            </Tag>
        ));

        return (
            <Stack width="100%">
                <Heading size="sm" marginTop="10px" marginBottom="5px">
                    Graph components:
                </Heading>
                <Wrap maxHeight="300px" overflowY="scroll">
                    {componentData && componentData.length ? (
                        components
                    ) : (
                        <Stack width="100%">
                            <Skeleton
                                height="30px"
                                borderRadius="10px"
                            ></Skeleton>
                            <Skeleton
                                height="30px"
                                borderRadius="10px"
                            ></Skeleton>
                            <Skeleton
                                height="30px"
                                borderRadius="10px"
                            ></Skeleton>
                        </Stack>
                    )}
                </Wrap>
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
                    <Divider />
                    {location.pathname.startsWith('/graph/detail') &&
                        renderDimensionsToggle()}
                    {location.pathname.startsWith('/graph/detail') && (
                        <Divider />
                    )}
                    {renderComponentToggle(
                        store.graph.currentGraphData.components
                    )}
                </VStack>
            </FormControl>
        </Stack>
    );
}

export default observer(Settings);
