import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import {
    Center,
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

    const renderTitle = () => (
        <HStack width="100%">
            <Heading size="xs" opacity="0.5" width="100%">
                Title:
            </Heading>

            <Editable
                size="xs"
                width="100%"
                value={title}
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
                    color="#FFFFFFBB"
                    backgroundColor="whiteAlpha.200"
                    width="100%"
                    size="xs"
                />
                <EditableInput
                    backgroundColor="whiteAlpha.200"
                    padding="5px 10px"
                    fontSize="xs"
                    width="100%"
                    size="xs"
                />
            </Editable>
        </HStack>
    );

    const renderItemTypeSwitch = () => (
        <HStack width="100%">
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
                <option value="nodes">Nodes</option>
                <option value="edges">Edges</option>
            </Select>
        </HStack>
    );

    const renderMainAxisItemSwitch = () => (
        <HStack width="100%">
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

    const renderSecondaryAxisItemSwitch = () => (
        <HStack width="100%">
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

    const renderGroupBySwitch = () => {
        return (
            <HStack width="100%">
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

    const renderItemStateSwitch = () => {
        return (
            <HStack width="100%">
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
                    <option value="visible">Visible graph elements</option>
                    {itemType !== 'edges' && (
                        <option value="selected">
                            Selected graph elements
                        </option>
                    )}
                    <option value="all">All graph elements</option>
                </Select>
            </HStack>
        );
    };

    const renderItemCountSwitch = () => {
        return (
            <HStack width="100%">
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

    const renderNodeTypesToShowSwitch = () => {
        return (
            <HStack width="100%">
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
                        {renderTitle()}
                        {props.settings.includes('item type') &&
                            renderItemTypeSwitch()}
                        {renderMainAxisItemSwitch()}
                        {props.settings.includes('second axis') &&
                            renderSecondaryAxisItemSwitch()}
                        {props.settings.includes('group') &&
                            renderGroupBySwitch()}
                        {renderItemStateSwitch()}
                        {renderItemCountSwitch()}
                        {store.core.isDetail && renderNodeTypesToShowSwitch()}
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
    mainAxis: PropTypes.string
};

export default observer(WidgetSettings);
