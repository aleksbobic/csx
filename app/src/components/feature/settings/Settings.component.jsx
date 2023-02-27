import { Button } from '@chakra-ui/button';
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
    Checkbox,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Select,
    Tag,
    Tooltip,
    useColorMode,
    useColorModeValue,
    Wrap
} from '@chakra-ui/react';
import { Switch } from '@chakra-ui/switch';
import { Anchor, Awards, Bolt, Undo } from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';

import { RootStoreContext } from 'stores/RootStore';

function Settings() {
    const store = useContext(RootStoreContext);
    const [forceRunning, setForceRunning] = useState(false);
    const { colorMode } = useColorMode();

    const graphDimensionBackground = useColorModeValue(
        'blackAlpha.200',
        'whiteAlpha.300'
    );

    const graphDimensionHoverBackground = useColorModeValue(
        'blue.500',
        'blue.700'
    );

    useEffect(() => {
        if (!store.graphInstance.forceEngine) {
            setForceRunning(false);
        }
    }, [store.graphInstance.forceEngine]);

    const updateColorScheme = value => {
        store.graphInstance.setNodeColorScheme(value);

        store.graph.updateLinkColor(colorMode);
        store.graph.updateNodeColor(colorMode);

        store.track.trackEvent(
            'Side panel - View Settings',
            'Radio Element - Color Schema',
            JSON.stringify({
                type: 'Change Selection',
                value: value.toLowerCase()
            })
        );
    };

    const updateEdgeColorScheme = value => {
        store.graphInstance.setEdgeColorScheme(value);

        store.graph.updateLinkColor(colorMode);

        store.track.trackEvent(
            'Side panel - View Settings',
            'Radio Element - Edge Color Schema',
            JSON.stringify({
                type: 'Change Selection',
                value: value.toLowerCase()
            })
        );
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
            <HStack justifyContent="space-between" width="100%">
                <Text fontSize="sm">Color: </Text>
                <Tooltip label="Select property used for node colors.">
                    <Select
                        size="sm"
                        value={
                            store.graphInstance.nodeColorScheme[
                                store.core.currentGraph
                            ]
                        }
                        onChange={e => updateColorScheme(e.target.value)}
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

    const renderLabelOptions = () => {
        return (
            <HStack justifyContent="space-between" width="100%">
                <Text fontSize="sm">Label size: </Text>
                <Tooltip label="Select node label size.">
                    <Select
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

    const renderLabelFeatureSelection = () => {
        return (
            <Box>
                <Menu closeOnSelect={false} zIndex="3">
                    <Tooltip label="Select node types that should have visible labels.">
                        <MenuButton
                            width="100%"
                            size="sm"
                            as={IconButton}
                            icon={<Awards style={{ '--ggs': 0.7 }} />}
                            onClick={() => {
                                store.track.trackEvent(
                                    'Side panel - Node Settings',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: 'Open label types'
                                    })
                                );
                            }}
                            zIndex="3"
                        />
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
                                                'Side panel - Node Settings',
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
                                                'Side panel - Node Settings',
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
            <HStack justifyContent="space-between" width="100%">
                <Text fontSize="sm">Color: </Text>
                <Tooltip label="Select property used for edge colors.">
                    <Select
                        size="sm"
                        value={
                            store.graphInstance.edgeColorScheme[
                                store.core.currentGraph
                            ]
                        }
                        onChange={e => updateEdgeColorScheme(e.target.value)}
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
                <VStack
                    width="100%"
                    backgroundColor="whiteAlpha.100"
                    padding="10px"
                    borderRadius="10px"
                >
                    <Heading
                        size="sm"
                        style={{ marginBottom: '10px' }}
                        width="100%"
                    >
                        Edge settings
                    </Heading>
                    <Tooltip
                        label={
                            store.graphInstance.linkVisibility
                                ? 'Hide edges'
                                : 'Show edges'
                        }
                    >
                        <HStack spacing="1" width="100%">
                            <Switch
                                id="edges"
                                size="sm"
                                marginRight="10px"
                                isChecked={store.graphInstance.linkVisibility}
                                value={store.graphInstance.linkVisibility}
                                onChange={() => {
                                    store.graphInstance.toggleLinkVisibility();

                                    store.track.trackEvent(
                                        'Side panel - View Settings',
                                        'Switch',
                                        JSON.stringify({
                                            type: 'Toggle',
                                            value: `${
                                                store.graphInstance
                                                    .linkVisibility
                                                    ? 'Show'
                                                    : 'Hide'
                                            } links`
                                        })
                                    );
                                }}
                            />
                            <Text fontSize="sm">Edges</Text>
                        </HStack>
                    </Tooltip>
                    <Tooltip
                        label={
                            store.graphInstance.useCurvedEdges
                                ? 'Use straight edges'
                                : 'Use curved edges'
                        }
                    >
                        <HStack spacing="1" width="100%">
                            <Switch
                                id="curvedEdges"
                                size="sm"
                                marginRight="10px"
                                isChecked={store.graphInstance.useCurvedEdges}
                                value={store.graphInstance.useCurvedEdges}
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
                                                    ? 'Use curved edges'
                                                    : 'Use straight edges'
                                            }`
                                        })
                                    );
                                }}
                            />
                            <Text fontSize="sm">Curved edges</Text>
                        </HStack>
                    </Tooltip>
                    {store.core.isDetail && (
                        <Tooltip
                            label={
                                store.graphInstance.edgeDirectionVisiblity
                                    ? 'Use undirected edges'
                                    : 'Use directed edges'
                            }
                        >
                            <HStack spacing="1" width="100%">
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
                                                        ? 'Use directed edges'
                                                        : 'Use undirected edges'
                                                }`
                                            })
                                        );
                                    }}
                                />
                                <Text fontSize="sm">Directed edges</Text>
                            </HStack>
                        </Tooltip>
                    )}
                    {renderEdgeColorOptions()}
                </VStack>
                <VStack
                    width="100%"
                    backgroundColor="whiteAlpha.100"
                    padding="10px"
                    borderRadius="10px"
                    style={{ marginTop: '20px' }}
                >
                    <Heading
                        size="sm"
                        style={{ marginBottom: '10px', width: '100%' }}
                    >
                        Node settings
                    </Heading>
                    <HStack justifyContent="space-between" width="100%">
                        <Tooltip
                            label={
                                store.graphInstance.labels.isVisible
                                    ? 'Hide node labels'
                                    : 'Show node labels'
                            }
                        >
                            <HStack spacing="1" width="100%">
                                <Switch
                                    id="nodelabels"
                                    size="sm"
                                    marginRight="10px"
                                    isChecked={
                                        store.graphInstance.labels.isVisible
                                    }
                                    value={store.graphInstance.labels.isVisible}
                                    onChange={() => {
                                        store.graphInstance.toggleLabelVisibility();

                                        store.track.trackEvent(
                                            'Side panel - View Settings',
                                            'Switch',
                                            JSON.stringify({
                                                type: 'Toggle',
                                                value: `${
                                                    store.graphInstance.labels
                                                        .isVisible
                                                        ? 'Show'
                                                        : 'Hide'
                                                } labels`
                                            })
                                        );
                                    }}
                                />
                                <Text fontSize="sm">Node labels</Text>
                            </HStack>
                        </Tooltip>
                        {store.core.currentGraph === 'detail' &&
                            renderLabelFeatureSelection()}
                    </HStack>
                    <Tooltip
                        label={
                            store.graphInstance.orphanNodeVisibility
                                ? 'Hide orphan nodes'
                                : 'Show orphan nodes'
                        }
                    >
                        <HStack spacing="1" width="100%">
                            <Switch
                                id="nodelabels"
                                size="sm"
                                marginRight="10px"
                                isChecked={
                                    store.graphInstance.orphanNodeVisibility
                                }
                                value={store.graphInstance.orphanNodeVisibility}
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
                                            } orphan nodes`
                                        })
                                    );
                                }}
                            />
                            <Text fontSize="sm">Orphan nodes</Text>
                        </HStack>
                    </Tooltip>
                    {renderColorOptions()}
                    {renderLabelOptions()}
                </VStack>
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
                style={{ padding: 0 }}
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
                    cursor: 'pointer',
                    color: 'white'
                }}
                onClick={() => {
                    store.track.trackEvent(
                        'Side panel - View Settings',
                        `Button - Dimensions - ${property}`,
                        JSON.stringify({
                            type: 'Click',
                            value: `${
                                store.core.visibleDimensions[
                                    store.core.currentGraph
                                ].includes(property)
                                    ? 'Hide'
                                    : 'Show'
                            }`
                        })
                    );

                    store.core.toggleVisibleDimension(property);
                }}
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
                        padding="0 8px"
                        _hover={{ color: 'white' }}
                        color={
                            store.core.visibleDimensions[
                                store.core.currentGraph
                            ].includes(property)
                                ? 'white'
                                : colorMode === 'light'
                                ? 'black'
                                : 'white'
                        }
                    >
                        {property}
                    </Text>
                </Tooltip>
            </Tag>
        ));

        if (tags.length === 0) {
            return <></>;
        }

        return (
            <VStack
                width="100%"
                backgroundColor="whiteAlpha.100"
                padding="10px"
                borderRadius="10px"
                spacing="10px"
                align="start"
                style={{ marginTop: '20px' }}
            >
                <Stack>
                    <Heading
                        size="sm"
                        style={{ marginBottom: '10px', marginTop: '10px' }}
                    >
                        Visible features
                    </Heading>
                    <Wrap>{tags}</Wrap>
                </Stack>
            </VStack>
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
                backgroundColor="whiteAlpha.100"
                padding="10px"
                borderRadius="10px"
                style={{ marginTop: '20px' }}
            >
                <Heading
                    size="sm"
                    style={{ marginBottom: '10px' }}
                    width="100%"
                >
                    Layout settings
                </Heading>
                {renderLayoutOptions()}
            </VStack>

            {store.core.currentGraph === 'detail' && renderDimensionsToggle()}
        </VStack>
    );
}

export default observer(Settings);
