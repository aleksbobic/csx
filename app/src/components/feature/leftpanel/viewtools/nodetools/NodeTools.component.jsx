import {
    Checkbox,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Select,
    Tooltip,
    useColorMode,
    Accordion,
    AccordionItem,
    AccordionPanel,
    AccordionIcon,
    AccordionButton,
    Button,
    Box,
    Heading,
    HStack,
    Text,
    VStack,
    Switch
} from '@chakra-ui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import { RootStoreContext } from 'stores/RootStore';

function ViewTools() {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

    const updateColorScheme = value => {
        store.graphInstance.setNodeColorScheme(value);

        store.graph.updateLinkColor(colorMode);
        store.graph.updateNodeColor(colorMode);
    };

    const updateLabelDistance = value => {
        store.graphInstance.changeShowLabelDistance(
            value,
            6 + Math.round((8 * value) / 900)
        );

        store.track.trackEvent(
            JSON.stringify({
                area: 'Left panel',
                sub_area: 'VIew tools'
            }),
            JSON.stringify({
                item_type: 'Select element'
            }),
            JSON.stringify({
                event_type: 'Change selection',
                event_action: 'Change label size',
                event_value: value
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
                                JSON.stringify({
                                    area: 'Left panel',
                                    sub_area: 'VIew tools'
                                }),
                                JSON.stringify({
                                    item_type: 'Select element'
                                }),
                                JSON.stringify({
                                    event_type: 'Change selection',
                                    event_action: 'Change node color',
                                    event_value: e.target.value
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
                                    <EllipsisVerticalIcon
                                        style={{
                                            width: '16px',
                                            height: '16px'
                                        }}
                                    />
                                }
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Left panel',
                                            sub_area: 'VIew tools'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action:
                                                'Open node types with labels menu'
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
                                                    JSON.stringify({
                                                        area: 'Left panel',
                                                        sub_area: 'VIew tools'
                                                    }),
                                                    JSON.stringify({
                                                        item_type: 'Checkbox'
                                                    }),
                                                    JSON.stringify({
                                                        event_type: 'Check',
                                                        event_action:
                                                            'Hide labels',
                                                        event_value: feature
                                                    })
                                                );
                                                store.graphInstance.removeLabelFeature(
                                                    feature
                                                );
                                            } else {
                                                store.track.trackEvent(
                                                    JSON.stringify({
                                                        area: 'Left panel',
                                                        sub_area: 'VIew tools'
                                                    }),
                                                    JSON.stringify({
                                                        item_type: 'Checkbox'
                                                    }),
                                                    JSON.stringify({
                                                        event_type: 'Check',
                                                        event_action:
                                                            'Show labels',
                                                        event_value: feature
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

    return (
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
                                        store.graphInstance.labels.isVisible
                                    }
                                    value={store.graphInstance.labels.isVisible}
                                    onChange={() => {
                                        store.graphInstance.toggleLabelVisibility();

                                        store.track.trackEvent(
                                            JSON.stringify({
                                                area: 'Left panel',
                                                sub_area: 'VIew tools'
                                            }),
                                            JSON.stringify({
                                                item_type: 'Switch'
                                            }),
                                            JSON.stringify({
                                                event_type: 'Toggle',
                                                event_action: `${
                                                    store.graphInstance.labels
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
                                    store.graphInstance.orphanNodeVisibility
                                }
                                value={store.graphInstance.orphanNodeVisibility}
                                onChange={() => {
                                    store.graphInstance.toggleOrphanNodeVisibility();

                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Left panel',
                                            sub_area: 'VIew tools'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Switch'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Toggle',
                                            event_action: `${
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
    );
}

export default observer(ViewTools);
