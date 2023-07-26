import {
    Box,
    Heading,
    HStack,
    IconButton,
    Stat,
    Tag,
    TagLabel,
    Text,
    Tooltip,
    useColorMode,
    VStack,
    Wrap
} from '@chakra-ui/react';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { Eye, Remove } from 'css.gg';
import { observer } from 'mobx-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function SelectedComponentList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();
    const [widgetConfig, setWidgetConfig] = useState(
        store.stats?.activeWidgets?.find(
            widget => widget.id === props.chart?.id
        ) || {}
    );

    useEffect(() => {
        if (props.demoData.length) {
            setData(props.demoData);
        } else {
            const components = store.graph.currentGraphData.components;
            const widget = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );

            setWidgetConfig(widget);

            if (!widget) {
                setData(null);
            }

            if (widget?.network_data === 'all') {
                setData(components);
            } else {
                setData(
                    components.filter(component =>
                        store.graph.currentGraphData.selectedComponents.includes(
                            component.id
                        )
                    )
                );
            }
        }
    }, [
        props.chart?.id,
        props.demoData,
        store.graph.currentGraphData.components,
        store.graph.currentGraphData.selectedComponents,
        store.stats.activeWidgets,
        store.core.currentGraph,
        store.core.isOverview,
        store.overviewSchema.anchorProperties,
        store.stats,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents
    ]);

    const getLargestNodes = nodes => {
        if (nodes && nodes.length === 0) {
            return;
        }

        return nodes.map(node => (
            <Tag
                size="sm"
                borderRadius="4px"
                variant="solid"
                maxWidth="150px"
                key={`largest_component_node_${node.label}_${node.feature}`}
                background={
                    store.graphInstance.nodeColorSchemeColors[
                        [store.core.currentGraph]
                    ]['node type'][node.feature]
                }
            >
                <Tooltip
                    padding="7px"
                    borderRadius="6px"
                    label={
                        <Text fontWeight="normal">
                            Node{' '}
                            <Tag
                                fontWeight="bold"
                                colorScheme="blackAlpha"
                                variant="solid"
                                size="sm"
                            >
                                {node.label}
                            </Tag>{' '}
                            appearing{' '}
                            <Tag
                                fontWeight="bold"
                                colorScheme="blackAlpha"
                                variant="solid"
                                size="sm"
                            >
                                {node.entries.length}{' '}
                                {node.entries.length > 1 ? 'times' : 'time'}
                            </Tag>
                        </Text>
                    }
                >
                    <TagLabel>{node.label}</TagLabel>
                </Tooltip>
            </Tag>
        ));
    };

    const getLargestConnections = (connections, component_id) => {
        if (!connections || (connections && connections.length === 0)) {
            return;
        }

        return connections.map((connection, id) => (
            <Tag
                size="sm"
                borderRadius="4px"
                maxWidth="150px"
                variant="solid"
                key={`${component_id}_largest_connection_${id}`}
                backgroundColor={`${
                    store.graphInstance.nodeColorSchemeColors[
                        [store.core.currentGraph]
                    ]['component'][component_id]
                }AA`}
            >
                <Tooltip
                    label={
                        <Text fontWeight="normal">
                            Connection{' '}
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
                                {connection.count > 1 ? 'times' : 'time'}
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
        ));
    };

    const renderComponentDetails = component => (
        <Wrap spacing="1" width="100%">
            <Tag
                size="sm"
                borderRadius="4px"
                variant="solid"
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.200' : 'whiteAlpha.200'
                }
            >
                <TagLabel>
                    {component.node_count}{' '}
                    {component.node_count === 1 ? 'node' : 'nodes'}
                </TagLabel>
            </Tag>
            {store.core.isOverview
                ? getLargestConnections(
                      component.largest_connections,
                      component.id
                  )
                : getLargestNodes(component.largest_nodes)}
        </Wrap>
    );

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={['item state', 'item count']}
                customItemStates={[
                    {
                        value: 'selected',
                        label: 'Selected graph elements'
                    },
                    { value: 'all', label: 'All graph elements' }
                ]}
            />
        );
    }

    if (!data || data.length === 0) {
        return (
            <WidgetAlert
                size={props.isExpanded ? 'md' : 'sm'}
                message="Select some components to see details here! 😉"
            />
        );
    }

    return (
        <CustomScroll style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <VStack height="100%" width="100%" spacing={1}>
                {data
                    .slice()
                    .sort((component1, component2) => {
                        if (component1.node_count > component2.node_count) {
                            return -1;
                        }

                        if (component1.node_count < component2.node_count) {
                            return 1;
                        }

                        return 0;
                    })
                    .map(component => {
                        return (
                            <Stat
                                key={`selected_component_${component.id}`}
                                borderRadius="10px"
                                backgroundColor={
                                    colorMode === 'light'
                                        ? 'blackAlpha.200'
                                        : 'whiteAlpha.100'
                                }
                                padding="10px"
                                width="100%"
                                flex="0 1 0%"
                            >
                                <HStack
                                    width="100%"
                                    justifyContent="space-between"
                                    paddingBottom="5px"
                                >
                                    <Heading
                                        size="xs"
                                        marginBottom={
                                            props.isExpanded ? '8px' : '0'
                                        }
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        maxWidth="300px"
                                        paddingRight="30px"
                                    >
                                        Component {component.id}
                                    </Heading>
                                    {widgetConfig.network_data &&
                                        widgetConfig.network_data === 'all' && (
                                            <Tooltip label="Toggle component visibility">
                                                <IconButton
                                                    variant="ghost"
                                                    size="xs"
                                                    opacity={
                                                        store.graphInstance.visibleComponents.includes(
                                                            component.id
                                                        )
                                                            ? '1'
                                                            : '0.3'
                                                    }
                                                    _hover={{ opacity: 1 }}
                                                    onClick={() => {
                                                        store.track.trackEvent(
                                                            JSON.stringify({
                                                                area: 'Widget',
                                                                area_id:
                                                                    props.chart
                                                                        .id
                                                            }),
                                                            JSON.stringify({
                                                                item_type:
                                                                    'Button'
                                                            }),
                                                            JSON.stringify({
                                                                event_type:
                                                                    'Click',
                                                                event_action:
                                                                    store.graphInstance.visibleComponents.includes(
                                                                        component.id
                                                                    )
                                                                        ? 'Hide component'
                                                                        : 'Show component',
                                                                event_value:
                                                                    component.id
                                                            })
                                                        );

                                                        store.graphInstance.toggleVisibleComponents(
                                                            component.id
                                                        );
                                                        store.graphInstance.setIsFiltered(
                                                            true
                                                        );
                                                    }}
                                                    icon={
                                                        <Eye
                                                            style={{
                                                                '--ggs': '0.7'
                                                            }}
                                                        />
                                                    }
                                                />
                                            </Tooltip>
                                        )}
                                </HStack>
                                {widgetConfig.network_data &&
                                    widgetConfig.network_data ===
                                        'selected' && (
                                        <Box
                                            position="absolute"
                                            top="4px"
                                            right="8px"
                                        >
                                            <Tooltip label="Deselect component">
                                                <IconButton
                                                    size="xs"
                                                    border="none"
                                                    variant="ghost"
                                                    aria-label="Remove from list"
                                                    icon={
                                                        <Remove
                                                            style={{
                                                                '--ggs': '0.8'
                                                            }}
                                                        />
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            !props.demoData
                                                                .length
                                                        ) {
                                                            store.track.trackEvent(
                                                                JSON.stringify({
                                                                    area: 'Widget',
                                                                    area_id:
                                                                        props
                                                                            .chart
                                                                            .id
                                                                }),
                                                                JSON.stringify({
                                                                    item_type:
                                                                        'Button'
                                                                }),
                                                                JSON.stringify({
                                                                    event_type:
                                                                        'Click',
                                                                    event_action:
                                                                        'Deselect component',
                                                                    event_value:
                                                                        component.id
                                                                })
                                                            );

                                                            store.graph.selectComponent(
                                                                component.id
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    )}
                                {props.isExpanded &&
                                    renderComponentDetails(component)}
                            </Stat>
                        );
                    })}
            </VStack>
        </CustomScroll>
    );
}
SelectedComponentList.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.array
};

SelectedComponentList.defaultProps = {
    isExpanded: false,
    demoData: []
};

export default observer(SelectedComponentList);
