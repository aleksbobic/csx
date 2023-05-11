import { Button } from '@chakra-ui/button';
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/layout';
import {
    Checkbox,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Select,
    Tooltip,
    useColorMode,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    SliderMark,
    Accordion,
    AccordionItem,
    AccordionPanel,
    AccordionIcon,
    AccordionButton
} from '@chakra-ui/react';
import { Switch } from '@chakra-ui/switch';
import { ViewfinderCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import { Anchor, Bolt, Undo, MoreVerticalAlt } from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';

import { RootStoreContext } from 'stores/RootStore';

function Settings() {
    const store = useContext(RootStoreContext);
    const [forceRunning, setForceRunning] = useState(false);
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (!store.graphInstance.forceEngine) {
            setForceRunning(false);
        }
    }, [store.graphInstance.forceEngine]);

    const updateColorScheme = value => {
        store.graphInstance.setNodeColorScheme(value);

        store.graph.updateLinkColor(colorMode);
        store.graph.updateNodeColor(colorMode);
    };

    const updateEdgeColorScheme = value => {
        store.graphInstance.setEdgeColorScheme(value);

        store.graph.updateLinkColor(colorMode);
        store.graph.updateNodeColor(colorMode);
    };

    const updateLabelDistance = value => {
        store.graphInstance.changeShowLabelDistance(
            value,
            6 + Math.round((8 * value) / 900)
        );

        store.track.trackEvent(
            'Side panel - View Settings',
            'Select Element - Label Size',
            JSON.stringify({
                type: 'Change Selection',
                value: value
            })
        );
    };

    const renderColorSchemeOptionElements = () => {
        const colorSchemas = [
            { value: 'none', label: 'None', tooltip: 'Nodes are not colored' },
            {
                value: 'component',
                label: 'Node component',
                tooltip: 'Color nodes based on their components'
            },
            {
                value: 'degree',
                label: 'Neighbour count',
                tooltip:
                    'Color nodes based on the number of neighbours they have'
            }
        ];

        if (
            store.core.isDetail &&
            store.graphInstance.nodeColorSchemeColors[[store.core.currentGraph]]
        ) {
            colorSchemas.push({
                value: 'node type',
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
            <option value={entry.value} key={`node_color_schema${entry.value}`}>
                {entry.label}
            </option>
        ));
    };

    const renderColorOptions = () => {
        return (
            <HStack justifyContent="space-between" width="100%" padding="5px">
                <Text fontSize="sm">Node color: </Text>
                <Tooltip label="Select property used for node colors.">
                    <Select
                        size="sm"
                        value={
                            store.graphInstance.nodeColorScheme[
                                store.core.currentGraph
                            ]
                        }
                        onChange={e => {
                            updateColorScheme(e.target.value);

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
                        {renderColorSchemeOptionElements()}
                    </Select>
                </Tooltip>
            </HStack>
        );
    };

    const renderLabelOptions = isDisabled => {
        return (
            <HStack
                justifyContent="space-between"
                width="100%"
                opacity={isDisabled ? 0.3 : 1}
            >
                <Text fontSize="sm">Label size: </Text>
                <Tooltip label="Select node label size.">
                    <Select
                        isDisabled={isDisabled}
                        size="sm"
                        value={store.graphInstance.labels.visibilityDistance}
                        onChange={e => updateLabelDistance(e.target.value)}
                        variant="filled"
                        borderRadius="6px"
                        width="100px"
                    >
                        <option value={600}>Small</option>
                        <option value={1500}>Medium</option>
                        <option value={2400}>Large</option>
                        <option value={3300}>Extra large</option>
                        <option value={4200}>2x large</option>
                    </Select>
                </Tooltip>
            </HStack>
        );
    };

    const renderLabelFeatureSelection = isDisabled => {
        return (
            <HStack
                spacing="1"
                width="100%"
                justifyContent="space-between"
                opacity={isDisabled ? 0.3 : 1}
            >
                <Text fontSize="sm">Show only: </Text>
                <Box>
                    <Menu closeOnSelect={false} zIndex="3">
                        <Tooltip label="Select node types that should have visible labels.">
                            <MenuButton
                                width="100%"
                                isDisabled={isDisabled}
                                size="sm"
                                fontSize="sm"
                                fontWeight="normal"
                                backgroundColor="whiteAlpha.100"
                                as={Button}
                                rightIcon={
                                    <MoreVerticalAlt style={{ '--ggs': 0.7 }} />
                                }
                                onClick={() => {
                                    store.track.trackEvent(
                                        'Side panel - Node Settings',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: 'Open node types with labels menu'
                                        })
                                    );
                                }}
                                zIndex="3"
                            >
                                Types
                            </MenuButton>
                        </Tooltip>
                        <MenuList
                            backgroundColor="#222222"
                            padding="5px"
                            borderRadius="10px"
                            width="200px"
                            minWidth="200px"
                        >
                            {store.core.visibleDimensions[
                                store.core.currentGraph
                            ].map(feature => (
                                <MenuItem
                                    key={`label_feature_checkbox_${feature}`}
                                    fontSize="xs"
                                    fontWeight="bold"
                                    borderRadius="6px"
                                    width="190px"
                                    minWidth="190px"
                                >
                                    <Checkbox
                                        isChecked={store.graphInstance.labels.labelFeatures.includes(
                                            feature
                                        )}
                                        width="190px"
                                        minWidth="190px"
                                        size="sm"
                                        overflow="hidden"
                                        whiteSpace="nowrap"
                                        textOverflow="ellipsis"
                                        onChange={e => {
                                            if (!e.target.checked) {
                                                store.track.trackEvent(
                                                    'Side panel - View Settings',
                                                    'Checkbox',
                                                    JSON.stringify({
                                                        type: 'Check',
                                                        value: `Hide labels for ${feature}`
                                                    })
                                                );
                                                store.graphInstance.removeLabelFeature(
                                                    feature
                                                );
                                            } else {
                                                store.track.trackEvent(
                                                    'Side panel - View Settings',
                                                    'Checkbox',
                                                    JSON.stringify({
                                                        type: 'Check',
                                                        value: `Show labels for ${feature} `
                                                    })
                                                );

                                                store.graphInstance.addLabelFeature(
                                                    feature
                                                );
                                            }
                                        }}
                                    >
                                        {feature}
                                    </Checkbox>
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                </Box>
            </HStack>
        );
    };

    const renderLayoutOptions = () => {
        return (
            <VStack width="100%">
                <HStack width="100%">
                    <Tooltip label="Simulate graph layout (will make nodes move around and make it easier to see patterns)">
                        <Button
                            id="applyforcebutton"
                            size="sm"
                            leftIcon={<Bolt style={{ '--ggs': '0.6' }} />}
                            backgroundColor={
                                forceRunning
                                    ? 'blue.400'
                                    : colorMode === 'light'
                                    ? 'blackAlpha.200'
                                    : 'whiteAlpha.200'
                            }
                            onClick={() => {
                                if (forceRunning) {
                                    store.graphInstance.stopForce();
                                    setForceRunning(false);

                                    store.track.trackEvent(
                                        'Side panel - View Settings',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: 'Run Force'
                                        })
                                    );
                                } else {
                                    store.graphInstance.applyForce();
                                    setForceRunning(true);
                                    store.track.trackEvent(
                                        'Side panel - View Settings',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: 'Stop Force'
                                        })
                                    );
                                }
                            }}
                            width="100%"
                        >
                            {forceRunning ? 'Stop force' : 'Run Force'}
                        </Button>
                    </Tooltip>
                    <Tooltip
                        label={
                            store.graphInstance.forceShouldIgnoreSelected
                                ? 'Turn off layout position simulation for currently selected nodes.'
                                : 'Turn on layout position simulation for currently selected nodes.'
                        }
                    >
                        <IconButton
                            id="resetLayoutButton"
                            size="sm"
                            icon={<Anchor style={{ '--ggs': '0.6' }} />}
                            onClick={() => {
                                store.graphInstance.ignoreSelected(
                                    !store.graphInstance
                                        .forceShouldIgnoreSelected
                                );
                            }}
                            _hover={{
                                backgroundColor: 'blue.500',
                                opacity: 0.76
                            }}
                            backgroundColor={
                                store.graphInstance.forceShouldIgnoreSelected
                                    ? 'blue.500'
                                    : 'auto'
                            }
                            disabled={store.graphInstance.forceEngine}
                        />
                    </Tooltip>
                    <Tooltip label="Reset node positions">
                        <IconButton
                            id="resetLayoutButton"
                            size="sm"
                            icon={<Undo style={{ '--ggs': '0.6' }} />}
                            onClick={() => {
                                store.graph.resetNodesPositions();

                                store.track.trackEvent(
                                    'Side panel - View Settings',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Reset layout'
                                    })
                                );
                            }}
                            disabled={store.graphInstance.forceEngine}
                        />
                    </Tooltip>
                </HStack>
            </VStack>
        );
    };

    const renderEdgeColorSchemeOptionElements = () => {
        const colorSchemas = [
            {
                value: 'auto',
                label: 'Automatic',
                tooltip:
                    'Edges are colored based on the selected node color schema.'
            },
            {
                value: 'weight',
                label: 'Edge weight',
                tooltip: 'Color edges based on their weight'
            }
        ];

        if (store.core.isOverview) {
            colorSchemas.push({
                value: 'feature types',
                label: 'Edge types',
                tooltip:
                    'Color edges based on the number of feature types on them.'
            });
        }

        return colorSchemas.map(entry => (
            <option value={entry.value} key={`edge_color_schema${entry.value}`}>
                {entry.label}
            </option>
        ));
    };

    const renderEdgeColorOptions = () => {
        return (
            <HStack justifyContent="space-between" width="100%" padding="5px">
                <Text fontSize="sm">Edge color: </Text>
                <Tooltip label="Select property used for edge colors.">
                    <Select
                        size="sm"
                        value={
                            store.graphInstance.edgeColorScheme[
                                store.core.currentGraph
                            ]
                        }
                        onChange={e => {
                            updateEdgeColorScheme(e.target.value);
                            store.track.trackEvent(
                                'Side panel - View Settings',
                                'Select Element - Link Color',
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
                        {renderEdgeColorSchemeOptionElements()}
                    </Select>
                </Tooltip>
            </HStack>
        );
    };

    const renderVisibilityOptions = () => {
        return (
            <>
                <Accordion
                    width="100%"
                    backgroundColor="whiteAlpha.200"
                    borderRadius="10px"
                    allowToggle={true}
                    style={{ padding: '5px 10px' }}
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
                                Canvas
                            </Heading>
                            <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel padding="10px 0 0">
                            <VStack>
                                <VStack
                                    backgroundColor="whiteAlpha.50"
                                    width="100%"
                                    padding="10px 10px 15px"
                                    borderRadius="6px"
                                    marginBottom="5px"
                                >
                                    <Tooltip
                                        label={`Panning speed is ${store.graphInstance.panSpeed}`}
                                    >
                                        <VStack
                                            spacing="10px"
                                            style={{
                                                width: '100%',
                                                marginBottom: '20px',
                                                paddingLeft: '10px',
                                                paddingRight: '10px'
                                            }}
                                        >
                                            <Text
                                                fontSize="sm"
                                                width="100%"
                                                marginLeft="-15px"
                                                style={{ paddingBottom: '5px' }}
                                            >
                                                Panning speed
                                            </Text>
                                            <Slider
                                                defaultValue={5}
                                                min={1}
                                                max={9}
                                                colorScheme="blue"
                                                value={
                                                    store.graphInstance.panSpeed
                                                }
                                                onChange={value =>
                                                    store.graphInstance.setPanSpeed(
                                                        value
                                                    )
                                                }
                                            >
                                                <SliderMark
                                                    value={1}
                                                    fontSize="xs"
                                                    marginTop="10px"
                                                    marginLeft="-8px"
                                                >
                                                    Slow
                                                </SliderMark>
                                                <SliderMark
                                                    value={9}
                                                    fontSize="xs"
                                                    marginTop="10px"
                                                    marginLeft="-16px"
                                                >
                                                    Fast
                                                </SliderMark>

                                                <SliderTrack>
                                                    <SliderFilledTrack />
                                                </SliderTrack>
                                                <SliderThumb />
                                            </Slider>
                                        </VStack>
                                    </Tooltip>
                                </VStack>
                                <Button
                                    leftIcon={
                                        <ViewfinderCircleIcon
                                            style={{
                                                width: '16px',
                                                height: '16px'
                                            }}
                                        />
                                    }
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Graph Area - View Controls',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Zoom to fit'
                                            })
                                        );

                                        store.graphInstance.zoomToFit();
                                    }}
                                    size="sm"
                                    width="100%"
                                >
                                    Fit graph to view
                                </Button>
                                <Button
                                    style={{ marginBottom: '5px' }}
                                    leftIcon={
                                        <CameraIcon
                                            style={{
                                                width: '16px',
                                                height: '16px'
                                            }}
                                        />
                                    }
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Graph Area - View Controls',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Take screenshot'
                                            })
                                        );
                                        store.graphInstance.takeScreenshot();
                                    }}
                                    size="sm"
                                    width="100%"
                                >
                                    Take screenshot
                                </Button>
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>

                <Accordion
                    width="100%"
                    backgroundColor="whiteAlpha.200"
                    padding="5px 10px"
                    borderRadius="10px"
                    allowToggle={true}
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
                                Edges
                            </Heading>
                            <AccordionIcon />
                        </AccordionButton>

                        <AccordionPanel padding="10px 0 0">
                            <VStack
                                backgroundColor="whiteAlpha.50"
                                width="100%"
                                padding="10px 10px 15px"
                                borderRadius="6px"
                                style={{ marginBottom: '10px' }}
                            >
                                <Tooltip
                                    label={
                                        store.graphInstance.automaticEdgeOpacity
                                            ? 'Set custom edge opacity'
                                            : 'Use automatic edge opacity'
                                    }
                                >
                                    <HStack
                                        spacing="1"
                                        width="100%"
                                        style={{ paddingBottom: '10px' }}
                                        justifyContent="space-between"
                                    >
                                        <Text fontSize="sm">
                                            Automatic opacity
                                        </Text>
                                        <Switch
                                            id="edges"
                                            size="sm"
                                            marginRight="10px"
                                            isChecked={
                                                store.graphInstance
                                                    .automaticEdgeOpacity
                                            }
                                            value={
                                                store.graphInstance
                                                    .automaticEdgeOpacity
                                            }
                                            onChange={e => {
                                                store.graphInstance.toggleAutomaticEdgeOpacity();

                                                store.track.trackEvent(
                                                    'Side panel - View Settings',
                                                    'Switch',
                                                    JSON.stringify({
                                                        type: 'Toggle',
                                                        value: `${
                                                            store.graphInstance
                                                                .automaticEdgeOpacity
                                                                ? 'Automatic'
                                                                : 'Custom'
                                                        } edge opacity`
                                                    })
                                                );
                                            }}
                                        />
                                    </HStack>
                                </Tooltip>
                                <Tooltip
                                    label={`Edge opacity is ${
                                        store.graphInstance.customEdgeOpacity *
                                        10
                                    }%`}
                                    isDisabled={
                                        store.graphInstance.automaticEdgeOpacity
                                    }
                                >
                                    <VStack
                                        opacity={
                                            store.graphInstance
                                                .automaticEdgeOpacity
                                                ? '0.2'
                                                : '1'
                                        }
                                        spacing="1"
                                        style={{
                                            width: '100%',
                                            marginBottom: '20px',
                                            paddingLeft: '10px',
                                            paddingRight: '10px'
                                        }}
                                    >
                                        <Slider
                                            defaultValue={5}
                                            disabled={
                                                store.graphInstance
                                                    .automaticEdgeOpacity
                                            }
                                            min={0}
                                            max={10}
                                            colorScheme={
                                                store.graphInstance
                                                    .automaticEdgeOpacity
                                                    ? 'gray'
                                                    : 'blue'
                                            }
                                            value={
                                                store.graphInstance
                                                    .customEdgeOpacity
                                            }
                                            onChange={value =>
                                                store.graphInstance.setCustomEdgeOpacity(
                                                    value
                                                )
                                            }
                                        >
                                            <SliderMark
                                                value={1}
                                                fontSize="xs"
                                                marginTop="10px"
                                                marginLeft="-24px"
                                            >
                                                Invisible
                                            </SliderMark>
                                            <SliderMark
                                                value={9}
                                                fontSize="xs"
                                                marginTop="10px"
                                                marginLeft="-16px"
                                            >
                                                Visible
                                            </SliderMark>

                                            <SliderTrack>
                                                <SliderFilledTrack />
                                            </SliderTrack>
                                            <SliderThumb />
                                        </Slider>
                                    </VStack>
                                </Tooltip>
                            </VStack>
                            <VStack
                                backgroundColor="whiteAlpha.50"
                                width="100%"
                                padding="10px 10px 15px"
                                borderRadius="6px"
                                style={{ marginBottom: '10px' }}
                            >
                                <Tooltip
                                    label={
                                        store.graphInstance.useCurvedEdges
                                            ? 'Use straight edges'
                                            : 'Use curved edges'
                                    }
                                >
                                    <HStack
                                        spacing="1"
                                        width="100%"
                                        justifyContent="space-between"
                                        padding="5px"
                                    >
                                        <Text fontSize="sm">
                                            Edge curvature
                                        </Text>
                                        <Switch
                                            id="curvedEdges"
                                            size="sm"
                                            marginRight="10px"
                                            isChecked={
                                                store.graphInstance
                                                    .useCurvedEdges
                                            }
                                            value={
                                                store.graphInstance
                                                    .useCurvedEdges
                                            }
                                            onChange={() => {
                                                store.graphInstance.toggleUseCurvedEdges();

                                                store.track.trackEvent(
                                                    'Side panel - View Settings',
                                                    'Switch',
                                                    JSON.stringify({
                                                        type: 'Toggle',
                                                        value: `${
                                                            store.graphInstance
                                                                .useCurvedEdges
                                                                ? 'Use curved links'
                                                                : 'Use straight links'
                                                        }`
                                                    })
                                                );
                                            }}
                                        />
                                    </HStack>
                                </Tooltip>
                                <Tooltip
                                    label={`Edge curvature is ${parseInt(
                                        store.graphInstance
                                            .customEdgeCurvature * 10
                                    )}`}
                                    isDisabled={
                                        !store.graphInstance.useCurvedEdges
                                    }
                                >
                                    <VStack
                                        opacity={
                                            store.graphInstance.useCurvedEdges
                                                ? '1'
                                                : '0.2'
                                        }
                                        spacing="1"
                                        style={{
                                            width: '100%',
                                            marginBottom: '20px',
                                            paddingLeft: '10px',
                                            paddingRight: '10px'
                                        }}
                                    >
                                        <Slider
                                            defaultValue={5}
                                            disabled={
                                                !store.graphInstance
                                                    .useCurvedEdges
                                            }
                                            min={1}
                                            max={10}
                                            colorScheme={
                                                store.graphInstance
                                                    .useCurvedEdges
                                                    ? 'blue'
                                                    : 'gray'
                                            }
                                            value={
                                                store.graphInstance
                                                    .customEdgeCurvature * 10
                                            }
                                            onChange={value =>
                                                store.graphInstance.setCustomEdgeCurvature(
                                                    value * 0.1
                                                )
                                            }
                                        >
                                            <SliderMark
                                                value={1}
                                                fontSize="xs"
                                                marginTop="10px"
                                                marginLeft="-4px"
                                            >
                                                Slightly
                                            </SliderMark>
                                            <SliderMark
                                                value={10}
                                                fontSize="xs"
                                                marginTop="10px"
                                                marginLeft="-26px"
                                            >
                                                Very
                                            </SliderMark>

                                            <SliderTrack>
                                                <SliderFilledTrack />
                                            </SliderTrack>
                                            <SliderThumb />
                                        </Slider>
                                    </VStack>
                                </Tooltip>
                            </VStack>

                            {store.core.isDetail && (
                                <Tooltip
                                    label={
                                        store.graphInstance
                                            .edgeDirectionVisiblity
                                            ? 'Use undirected edges'
                                            : 'Use directed edges'
                                    }
                                >
                                    <HStack
                                        spacing="1"
                                        width="100%"
                                        justifyContent="space-between"
                                        padding="5px"
                                    >
                                        <Text fontSize="sm">
                                            Directed edges
                                        </Text>
                                        <Switch
                                            id="curvedEdges"
                                            size="sm"
                                            marginRight="10px"
                                            isChecked={
                                                store.graphInstance
                                                    .edgeDirectionVisiblity
                                            }
                                            value={
                                                store.graphInstance
                                                    .edgeDirectionVisiblity
                                            }
                                            onChange={() => {
                                                store.graphInstance.toggleEdgeDirectionVisiblity();

                                                store.track.trackEvent(
                                                    'Side panel - View Settings',
                                                    'Switch',
                                                    JSON.stringify({
                                                        type: 'Toggle',
                                                        value: `${
                                                            store.graphInstance
                                                                .edgeDirectionVisiblity
                                                                ? 'Use directed links'
                                                                : 'Use undirected links'
                                                        }`
                                                    })
                                                );
                                            }}
                                        />
                                    </HStack>
                                </Tooltip>
                            )}
                            {renderEdgeColorOptions()}
                        </AccordionPanel>
                    </AccordionItem>
                </Accordion>
                <Accordion
                    width="100%"
                    backgroundColor="whiteAlpha.200"
                    padding="5px 10px"
                    borderRadius="10px"
                    allowToggle={true}
                    style={{ marginTop: '15px' }}
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
                                Nodes
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
                                <Tooltip
                                    label={
                                        store.graphInstance.labels.isVisible
                                            ? 'Hide node labels'
                                            : 'Show node labels'
                                    }
                                >
                                    <HStack
                                        spacing="1"
                                        width="100%"
                                        justifyContent="space-between"
                                    >
                                        <Text fontSize="sm">Node labels</Text>
                                        <Switch
                                            id="nodelabels"
                                            size="sm"
                                            marginRight="10px"
                                            isChecked={
                                                store.graphInstance.labels
                                                    .isVisible
                                            }
                                            value={
                                                store.graphInstance.labels
                                                    .isVisible
                                            }
                                            onChange={() => {
                                                store.graphInstance.toggleLabelVisibility();

                                                store.track.trackEvent(
                                                    'Side panel - View Settings',
                                                    'Switch',
                                                    JSON.stringify({
                                                        type: 'Toggle',
                                                        value: `${
                                                            store.graphInstance
                                                                .labels
                                                                .isVisible
                                                                ? 'Show'
                                                                : 'Hide'
                                                        } labels`
                                                    })
                                                );
                                            }}
                                        />
                                    </HStack>
                                </Tooltip>
                                {store.core.currentGraph === 'detail' &&
                                    renderLabelFeatureSelection(
                                        !store.graphInstance.labels.isVisible
                                    )}
                                {renderLabelOptions(
                                    !store.graphInstance.labels.isVisible
                                )}
                            </VStack>

                            <Tooltip
                                label={
                                    store.graphInstance.orphanNodeVisibility
                                        ? 'Hide isolated nodes'
                                        : 'Show isolated nodes'
                                }
                            >
                                <HStack
                                    spacing="1"
                                    width="100%"
                                    justifyContent="space-between"
                                    padding="5px"
                                >
                                    <Text fontSize="sm">Isolated nodes</Text>
                                    <Switch
                                        id="nodelabels"
                                        size="sm"
                                        marginRight="10px"
                                        isChecked={
                                            store.graphInstance
                                                .orphanNodeVisibility
                                        }
                                        value={
                                            store.graphInstance
                                                .orphanNodeVisibility
                                        }
                                        onChange={() => {
                                            store.graphInstance.toggleOrphanNodeVisibility();

                                            store.track.trackEvent(
                                                'Side panel - View Settings',
                                                'Switch',
                                                JSON.stringify({
                                                    type: 'Toggle',
                                                    value: `${
                                                        store.graphInstance
                                                            .orphanNodeVisibility
                                                            ? 'Show'
                                                            : 'Hide'
                                                    } isolated nodes`
                                                })
                                            );
                                        }}
                                    />
                                </HStack>
                            </Tooltip>
                            {renderColorOptions()}
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
            <VStack
                width="100%"
                backgroundColor="whiteAlpha.200"
                padding="10px"
                borderRadius="10px"
                style={{ marginTop: '15px' }}
            >
                <Heading
                    size="sm"
                    style={{ marginBottom: '10px' }}
                    width="100%"
                >
                    Layout
                </Heading>
                {renderLayoutOptions()}
            </VStack>
        </VStack>
    );
}

export default observer(Settings);
