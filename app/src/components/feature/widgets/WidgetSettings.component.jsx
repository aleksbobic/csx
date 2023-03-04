import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import {
    Center,
    Checkbox,
    Editable,
    EditableInput,
    EditablePreview,
    Heading,
    HStack,
    Select,
    useColorMode,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { useState } from 'react';
import { capitaliseFirstLetter } from 'general.utils';

function WidgetSettings(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();
    const settingsBackground = useColorModeValue(
        'blackAlpha.200',
        'blackAlpha.800'
    );

    const [title, setTitle] = useState(
        store.stats.getWidgetTitle(props.widgetID)
    );
    const [itemType, setItemType] = useState(
        store.stats.getWidgetItemType(props.widgetID)
    );
    const [itemProperties, setItemProperties] = useState(
        store.stats.getWidgetItemProps(props.widgetID)
    );

    const [selectedItemProp, setSelectedItemProp] = useState(
        store.stats.getWidgetSelectedItemprop(props.widgetID)
    );

    const [secondaryAxisValues] = useState(store.stats.getNodeSortValues());

    const [secondaryAxisValue, setSecondaryAxisValue] = useState(
        store.stats.getWidgetSecondaryAxis(props.widgetID)
    );
    const [itemState, setItemState] = useState(
        store.stats.getWidgetItemState(props.widgetID)
    );
    const [itemCount, setItemCount] = useState(
        store.stats.getWidgetItemCount(props.widgetID)
    );
    const [chartGroupByValues] = useState(
        store.stats.getWidgetNodeProperties(true)
    );
    const [chartGroupBySelectedValue, setChartGroupBySelectedValue] = useState(
        store.stats.getWidgetGroupBy(props.widgetID)
    );

    const [showOnly, setShowOnly] = useState(
        store.stats.getWidgetShowOnly(props.widgetID)
    );

    const [availableNodeProperties, setAvailableNodeProperties] = useState(
        store.stats.getWidgetAvailabelNodeProperties()
    );

    const [visibleNodeProperties, setVisibleNodeProperties] = useState(
        store.stats.getWidgetVisibleNodeProperties(props.widgetID)
    );

    const [maxDistance, setMaxDistance] = useState(
        store.stats.getWidgetMaxDistance(props.widgetID)
    );

    const [visibleDirectConnectionFeature, setVisibleDirectConnectionFeature] =
        useState(
            store.stats.getWdigetVisibleDirectConnectionFeature(props.widgetID)
        );

    const [nodeFilteringProperty, setNodeFilteringProperty] = useState(
        store.stats.getWdigetNodeFilteringFeature(props.widgetID)
    );

    useEffect(() => {
        setAvailableNodeProperties(
            store.stats.getWidgetAvailabelNodeProperties()
        );
    }, [store.stats, store.core.currentGraph, store.graph.currentGraphData]);

    const renderTitle = index => (
        <HStack width="100%" key={`${props.widgetID}_settings_widget_${index}`}>
            <Heading size="xs" opacity="0.5" width="100%">
                Title:
            </Heading>

            <Editable
                size="xs"
                width="100%"
                value={title}
                maxWidth="133px"
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.100' : 'blackAlpha.300'
                }
                borderRadius="5px"
                onChange={val => setTitle(val)}
                onSubmit={val => {
                    if (val.trim()) {
                        store.stats.setWidgetProperty(
                            props.widgetID,
                            'title',
                            val.trim()
                        );
                        setTitle(val.trim());
                    } else {
                        setTitle(store.stats.getWidgetTitle(props.widgetID));
                    }
                }}
                onFocus={() => store.comment.setCommentTrigger(false)}
                onBlur={() => store.comment.setCommentTrigger(true)}
            >
                <EditablePreview
                    padding="5px 10px"
                    fontSize="xs"
                    maxWidth="133px"
                    marginBottom="-6px"
                    color="#FFFFFFBB"
                    backgroundColor="whiteAlpha.200"
                    width="100%"
                    size="xs"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                />
                <EditableInput
                    backgroundColor="whiteAlpha.200"
                    padding="5px 10px"
                    fontSize="xs"
                    maxWidth="133px"
                    width="100%"
                    size="xs"
                />
            </Editable>
        </HStack>
    );

    const renderItemTypeSwitch = index => {
        let availableTypes = [
            { value: 'nodes', label: 'Nodes' },
            { value: 'edges', label: 'Edges' }
        ];

        if (props.customAvailableTypes) {
            availableTypes = props.customAvailableTypes;
        }

        return (
            <HStack
                width="100%"
                key={`${props.widgetID}_settings_widget_${index}`}
            >
                <Heading size="xs" opacity="0.5" width="100%">
                    Item Type:
                </Heading>
                <Select
                    className="nodrag"
                    margin="0px"
                    variant="filled"
                    size="xs"
                    width="100%"
                    defaultValue={itemType}
                    borderRadius="5px"
                    onChange={e => {
                        const newItemType = e.target.value;
                        const newItemProperties =
                            newItemType === 'nodes'
                                ? store.stats.getWidgetNodeProperties()
                                : store.stats.getWidgetEdgeProperties();

                        store.stats.setWidgetProperties(props.widgetID, {
                            elements: newItemType,
                            element_values: newItemProperties[0].value,
                            element_sort_values:
                                newItemType !== 'nodes'
                                    ? 'frequency'
                                    : secondaryAxisValue
                        });

                        if (newItemType !== 'nodes') {
                            setSecondaryAxisValue('frequency');
                        }

                        setItemType(newItemType);
                        setItemProperties(newItemProperties);
                        setSelectedItemProp(newItemProperties[0].value);
                    }}
                    background="whiteAlpha.200"
                    opacity="0.8"
                    _hover={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                    _focus={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                >
                    {availableTypes.map(entry => (
                        <option
                            key={`item_type_${entry.value}`}
                            value={entry.value}
                        >
                            {entry.label}
                        </option>
                    ))}
                </Select>
            </HStack>
        );
    };

    const renderMainAxisItemSwitch = index => (
        <HStack width="100%" key={`${props.widgetID}_settings_widget_${index}`}>
            <Heading size="xs" opacity="0.5" width="100%">
                {props.mainAxis
                    ? `${props.mainAxis} Axis Props`
                    : 'Widget Props'}
            </Heading>
            <Select
                className="nodrag"
                margin="0px"
                variant="filled"
                size="xs"
                width="100%"
                defaultValue={selectedItemProp}
                borderRadius="5px"
                onChange={e => {
                    setSelectedItemProp(e.target.value);

                    if (e.target.value !== 'values') {
                        setSecondaryAxisValue('frequency');
                    }

                    store.stats.setWidgetProperties(props.widgetID, {
                        element_values: e.target.value,
                        element_sort_values: 'frequency'
                    });
                }}
                background="whiteAlpha.200"
                opacity="0.8"
                _hover={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
                _focus={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
            >
                {itemProperties.map(entry => (
                    <option
                        key={`${itemType}_property_${entry.value}`}
                        value={entry.value}
                    >
                        {entry.label}
                    </option>
                ))}
            </Select>
        </HStack>
    );

    const renderSecondaryAxisItemSwitch = index => (
        <HStack width="100%" key={`${props.widgetID}_settings_widget_${index}`}>
            <Heading size="xs" opacity="0.5" width="100%">
                {props.mainAxis === 'X' ? 'Y' : 'X'} Axis Props
            </Heading>
            <Select
                className="nodrag"
                isDisabled={
                    itemType === 'edges' || selectedItemProp !== 'values'
                }
                margin="0px"
                variant="filled"
                size="xs"
                width="100%"
                value={secondaryAxisValue}
                borderRadius="5px"
                onChange={e => {
                    setSecondaryAxisValue(e.target.value);

                    store.stats.setWidgetProperties(props.widgetID, {
                        element_sort_values: e.target.value
                    });
                }}
                background="whiteAlpha.200"
                opacity="0.8"
                _hover={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
                _focus={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
            >
                {secondaryAxisValues.map(entry => (
                    <option
                        key={`${
                            itemType === 'nodes' ? 'Node' : 'Edge'
                        }_sort_property_${entry.value}`}
                        value={entry.value}
                    >
                        {entry.label}
                    </option>
                ))}
            </Select>
        </HStack>
    );

    const renderGroupBySwitch = index => {
        return (
            <HStack
                width="100%"
                key={`${props.widgetID}_settings_widget_${index}`}
            >
                <Heading size="xs" opacity="0.5" width="100%">
                    Group By
                </Heading>
                <Select
                    className="nodrag"
                    margin="0px"
                    variant="filled"
                    size="xs"
                    width="100%"
                    defaultValue={chartGroupBySelectedValue}
                    borderRadius="5px"
                    onChange={e => {
                        setChartGroupBySelectedValue(e.target.value);

                        store.stats.setWidgetProperties(props.widgetID, {
                            group_by: e.target.value
                        });
                    }}
                    background="whiteAlpha.200"
                    opacity="0.8"
                    _hover={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                    _focus={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                >
                    {chartGroupByValues.map(entry => (
                        <option
                            key={`Node_group_by_property_${entry.value}`}
                            value={entry.value}
                        >
                            {entry.label}
                        </option>
                    ))}
                </Select>
            </HStack>
        );
    };

    const renderItemStateSwitch = index => {
        let itemStates;

        if (props.customItemStates) {
            itemStates = props.customItemStates;
        } else {
            itemStates = [
                { value: 'visible', label: 'Visible graph elements' }
            ];
            if (itemType !== 'edges') {
                itemStates.push({
                    value: 'selected',
                    label: 'Selected graph elements'
                });
            }
            itemStates.push({ value: 'all', label: 'All graph elements' });
        }

        return (
            <HStack
                width="100%"
                key={`${props.widgetID}_settings_widget_${index}`}
            >
                <Heading size="xs" opacity="0.5" width="100%">
                    Element Types
                </Heading>
                <Select
                    className="nodrag"
                    margin="0px"
                    variant="filled"
                    size="xs"
                    width="100%"
                    defaultValue={itemState}
                    borderRadius="5px"
                    onChange={e => {
                        setItemState(e.target.value);

                        store.stats.setWidgetProperties(props.widgetID, {
                            network_data: e.target.value
                        });
                    }}
                    background="whiteAlpha.200"
                    opacity="0.8"
                    _hover={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                    _focus={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                >
                    {itemStates.map(state => (
                        <option
                            key={`item_state_${state.value}`}
                            value={state.value}
                        >
                            {state.label}
                        </option>
                    ))}
                </Select>
            </HStack>
        );
    };

    const renderItemCountSwitch = index => {
        return (
            <HStack
                width="100%"
                key={`${props.widgetID}_settings_widget_${index}`}
            >
                <Heading size="xs" opacity="0.5" width="100%">
                    Display Limit
                </Heading>
                <Select
                    className="nodrag"
                    margin="0px"
                    variant="filled"
                    size="xs"
                    width="100%"
                    defaultValue={itemCount}
                    borderRadius="5px"
                    onChange={e => {
                        setItemCount(e.target.value);

                        store.stats.setWidgetProperties(props.widgetID, {
                            display_limit: e.target.value
                        });
                    }}
                    background="whiteAlpha.200"
                    opacity="0.8"
                    _hover={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                    _focus={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                >
                    <option value={10}>First 10</option>
                    <option value={50}>First 50</option>
                    <option value={100}>First 100</option>
                    <option value={-10}>Last 10</option>
                    <option value={-50}>Last 50</option>
                    <option value={-100}>Last 100</option>
                    <option value={0}>All</option>
                </Select>
            </HStack>
        );
    };

    const renderNodeTypesToShowSwitch = index => {
        return (
            <HStack
                width="100%"
                key={`${props.widgetID}_settings_widget_${index}`}
            >
                <Heading size="xs" opacity="0.5" width="100%">
                    Show Only:
                </Heading>
                <Select
                    className="nodrag"
                    margin="0px"
                    variant="filled"
                    size="xs"
                    isDisabled={itemType === 'edges'}
                    width="100%"
                    defaultValue={showOnly}
                    borderRadius="5px"
                    onChange={e => {
                        setShowOnly(e.target.value);

                        store.stats.setWidgetProperties(props.widgetID, {
                            show_only: e.target.value
                        });
                    }}
                    background="whiteAlpha.200"
                    opacity="0.8"
                    _hover={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                    _focus={{
                        opacity: 1,
                        cursor: 'pointer'
                    }}
                >
                    <option value={'all'}>All</option>
                    {[...store.graph.currentGraphData.perspectivesInGraph].map(
                        entry => (
                            <option
                                key={`chart_settings_show_only_${entry}`}
                                value={entry}
                            >
                                {capitaliseFirstLetter(entry)}
                            </option>
                        )
                    )}
                </Select>
            </HStack>
        );
    };

    const renderVisibleNodeProperties = index => {
        return (
            <VStack
                width="100%"
                key={`${props.widgetID}_settings_widget_${index}`}
            >
                <Heading size="xs" opacity="0.5" width="100%">
                    Visible Node Props:
                </Heading>
                <VStack
                    alignItems="flex-start"
                    spacing="5px"
                    width="100%"
                    backgroundColor="whiteAlpha.100"
                    borderRadius="4px"
                    padding="16px"
                >
                    {availableNodeProperties.map(entry => (
                        <Checkbox
                            defaultChecked={visibleNodeProperties.includes(
                                entry
                            )}
                            isDisabled={
                                (visibleNodeProperties.includes(entry) &&
                                    visibleNodeProperties.length === 3) ||
                                itemType === 'components'
                            }
                            size="sm"
                            key={`radar_node_${entry}`}
                            onChange={event => {
                                if (event.target.checked) {
                                    setVisibleNodeProperties([
                                        ...visibleNodeProperties,
                                        entry
                                    ]);

                                    store.stats.setWidgetProperty(
                                        props.widgetID,
                                        'visible_node_properties',
                                        [...visibleNodeProperties, entry]
                                    );
                                } else {
                                    visibleNodeProperties.splice(
                                        visibleNodeProperties.indexOf(entry),
                                        1
                                    );
                                    setVisibleNodeProperties([
                                        ...visibleNodeProperties
                                    ]);
                                    store.stats.setWidgetProperties(
                                        props.widgetID,
                                        'visible_node_properties',
                                        [...visibleNodeProperties]
                                    );
                                }
                            }}
                        >
                            {entry}
                        </Checkbox>
                    ))}
                </VStack>
            </VStack>
        );
    };

    const renderMaxDistanceSwitch = index => (
        <HStack width="100%" key={`${props.widgetID}_settings_widget_${index}`}>
            <Heading size="xs" opacity="0.5" width="100%">
                Max distance:
            </Heading>
            <Select
                className="nodrag"
                margin="0px"
                variant="filled"
                size="xs"
                width="100%"
                defaultValue={maxDistance}
                borderRadius="5px"
                onChange={e => {
                    setMaxDistance(e.target.value);

                    store.stats.setWidgetProperties(props.widgetID, {
                        max_distance: e.target.value
                    });
                }}
                background="whiteAlpha.200"
                opacity="0.8"
                _hover={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
                _focus={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
            >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </Select>
        </HStack>
    );

    const renderDirectConnectionFeatureSwitch = index => (
        <HStack width="100%" key={`${props.widgetID}_settings_widget_${index}`}>
            <Heading size="xs" opacity="0.5" width="100%">
                Visible Features:
            </Heading>
            <Select
                className="nodrag"
                margin="0px"
                variant="filled"
                size="xs"
                width="100%"
                defaultValue={visibleDirectConnectionFeature}
                borderRadius="5px"
                onChange={e => {
                    setVisibleDirectConnectionFeature(e.target.value);

                    store.stats.setWidgetProperties(props.widgetID, {
                        direct_connection_features: e.target.value
                    });
                }}
                background="whiteAlpha.200"
                opacity="0.8"
                _hover={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
                _focus={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
            >
                <option value="all">all</option>
                {store.graph.currentGraphData.perspectivesInGraph.map(
                    feature => (
                        <option
                            key={`connection_feature_${feature}`}
                            value={feature}
                        >
                            {feature}
                        </option>
                    )
                )}
            </Select>
        </HStack>
    );

    const renderNodeFilteringSwitch = index => (
        <HStack width="100%" key={`${props.widgetID}_settings_widget_${index}`}>
            <Heading size="xs" opacity="0.5" width="100%">
                Filtering Feature:
            </Heading>
            <Select
                className="nodrag"
                margin="0px"
                variant="filled"
                size="xs"
                width="100%"
                defaultValue={nodeFilteringProperty}
                borderRadius="5px"
                onChange={e => {
                    setNodeFilteringProperty(e.target.value);

                    store.stats.setWidgetProperties(props.widgetID, {
                        filter_property: e.target.value
                    });
                }}
                background="whiteAlpha.200"
                opacity="0.8"
                _hover={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
                _focus={{
                    opacity: 1,
                    cursor: 'pointer'
                }}
            >
                <option value="degree">Neighbour count</option>
                {Object.keys(store.search.nodeTypes)
                    .map(feature => {
                        return {
                            feature: feature,
                            type: store.search.nodeTypes[feature]
                        };
                    })
                    .filter(
                        entry =>
                            ['integer', 'float'].includes(entry['type']) &&
                            store.core.isOverview &&
                            store.graph.currentGraphData.meta.anchorProperties
                                .map(entry => entry['property'])
                                .includes(entry['feature'])
                    )
                    .map(entry => (
                        <option
                            key={`filter_prop_${entry['feature']}`}
                            value={entry['feature']}
                        >
                            {entry['feature']}
                        </option>
                    ))}
            </Select>
        </HStack>
    );

    const renderSwitches = () => {
        return ['title', ...props.settings].map((value, index) => {
            switch (value) {
                case 'item type':
                    return renderItemTypeSwitch(index);
                case 'main axis':
                    return renderMainAxisItemSwitch(index);
                case 'second axis':
                    return renderSecondaryAxisItemSwitch(index);
                case 'group':
                    return renderGroupBySwitch(index);
                case 'item state':
                    return renderItemStateSwitch(index);
                case 'item count':
                    return renderItemCountSwitch(index);
                case 'visible types':
                    return renderNodeTypesToShowSwitch(index);
                case 'visible node props':
                    return renderVisibleNodeProperties(index);
                case 'max distance':
                    return renderMaxDistanceSwitch(index);
                case 'direct connection feature':
                    return renderDirectConnectionFeatureSwitch(index);
                case 'node filtering':
                    return renderNodeFilteringSwitch(index);
                default:
                    return renderTitle(index);
            }
        });
    };

    return (
        <Center height="100%" width="100%">
            <VStack
                height="100%"
                width="100%"
                alignItems="flex-start"
                spacing={1}
                backgroundColor={settingsBackground}
                borderRadius="6px"
                justifyContent="center"
                padding="10% 20%"
            >
                <CustomScroll
                    style={{ paddingLeft: '10px', paddingRight: '10px' }}
                >
                    <VStack height="100%" width="100%" paddingTop="10px">
                        {renderSwitches()}
                    </VStack>
                </CustomScroll>
            </VStack>
        </Center>
    );
}
WidgetSettings.propTypes = {
    title: PropTypes.string,
    widgetID: PropTypes.string,
    settings: PropTypes.array,
    mainAxis: PropTypes.string,
    customAvailableTypes: PropTypes.array,
    customItemStates: PropTypes.array
};

export default observer(WidgetSettings);
