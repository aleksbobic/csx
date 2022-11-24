import { Button } from '@chakra-ui/button';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import {
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
    Select,
    Tag,
    useColorMode,
    useColorModeValue,
    Wrap
} from '@chakra-ui/react';
import { Switch } from '@chakra-ui/switch';
import { Tooltip } from '@chakra-ui/tooltip';
import { Anchor, Bolt, Undo } from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useState } from 'react';

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

    const updateColorScheme = value => {
        store.graphInstance.setNodeColorScheme(value);

        store.graph.updateLinkColor(colorMode);
        store.graph.updateNodeColor(colorMode);

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
            <HStack justifyContent="space-between" width="100%">
                <Text>Label size: </Text>
                <Select
                    size="sm"
                    value={store.graphInstance.labels.visibilityDistance}
                    onChange={e => updateLabelDistance(e.target.value)}
                    variant="filled"
                    borderRadius="6px"
                    width="115px"
                >
                    <option value={600}>small</option>
                    <option value={1500}>medium</option>
                    <option value={2400}>large</option>
                    <option value={3300}>extra large</option>
                    <option value={4200}>2x large</option>
                </Select>
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
                            backgroundColor={forceRunning && 'blue.400'}
                            onClick={() => {
                                if (forceRunning) {
                                    store.graphInstance.stopForce();
                                    setForceRunning(false);
                                    store.track.trackEvent(
                                        'view settings',
                                        'button click',
                                        'run force'
                                    );
                                } else {
                                    store.graphInstance.applyForce();
                                    setForceRunning(true);
                                    store.track.trackEvent(
                                        'view settings',
                                        'button click',
                                        'stop force'
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
                                    'view settings',
                                    'button click',
                                    'reset graph layout'
                                );
                            }}
                            disabled={store.graphInstance.forceEngine}
                        />
                    </Tooltip>
                </HStack>
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

        return (
            <Stack>
                <Heading size="xs" marginTop="10px" marginBottom="5px">
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

                    {store.core.currentGraph === 'detail' && <Divider />}
                    {store.core.currentGraph === 'detail' &&
                        renderDimensionsToggle()}
                </VStack>
            </FormControl>
        </Stack>
    );
}

export default observer(Settings);
