import {
    Box,
    Center,
    Editable,
    EditableInput,
    EditablePreview,
    Heading,
    HStack,
    IconButton,
    Select,
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

function SelectedComponentList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();
    const [title, setTitle] = useState(props.title);
    const [chartNetworkData, setChartNetworkData] = useState(
        props?.chart?.network_data ? props.chart.network_data : 'all'
    );

    useEffect(() => {
        const components = store.graph.currentGraphData.components;

        if (props.demoData.length) {
            setData(props.demoData);
        } else if (chartNetworkData === 'all') {
            setData(components);
        } else {
            setData(
                components.filter(c =>
                    store.graph.currentGraphData.selectedComponents.includes(
                        c.id
                    )
                )
            );
        }
    }, [
        chartNetworkData,
        props.demoData,
        props.networkData,
        store.graph.currentGraphData.components,
        store.graph.currentGraphData.selectedComponents,
        store.graph.currentGraphData.selectedNodes.length
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
            <Center height="100%" width="100%">
                <VStack
                    height="100%"
                    width="100%"
                    alignItems="flex-start"
                    spacing={1}
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'blackAlpha.800'
                    }
                    borderRadius="6px"
                    justifyContent="center"
                    padding="10% 20%"
                >
                    <CustomScroll
                        style={{ paddingLeft: '10px', paddingRight: '10px' }}
                    >
                        <VStack height="100%" width="100%">
                            <HStack width="100%">
                                <Heading size="xs" opacity="0.5" width="100%">
                                    Title
                                </Heading>

                                <Editable
                                    size="xs"
                                    width="100%"
                                    value={title}
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.100'
                                            : 'blackAlpha.300'
                                    }
                                    borderRadius="5px"
                                    onChange={val => setTitle(val)}
                                    onSubmit={val => {
                                        if (val.trim()) {
                                            store.stats.setWidgetProperty(
                                                props.chart.id,
                                                'title',
                                                val.trim()
                                            );
                                            setTitle(val.trim());
                                        } else {
                                            setTitle(props.title);
                                        }
                                    }}
                                    onFocus={() =>
                                        store.comment.setCommentTrigger(false)
                                    }
                                    onBlur={() =>
                                        store.comment.setCommentTrigger(true)
                                    }
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
                                    defaultValue={chartNetworkData}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setChartNetworkData(e.target.value);

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'network_data',
                                            e.target.value
                                        );
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
                                    <option value="selected">Selected</option>
                                    <option value="all">All</option>
                                </Select>
                            </HStack>
                        </VStack>
                    </CustomScroll>
                </VStack>
            </Center>
        );
    }

    if (data.length === 0) {
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
                        } else if (
                            component1.node_count < component2.node_count
                        ) {
                            return 1;
                        } else {
                            return 0;
                        }
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
                                                    `Details Panel - Widget - ${props.chart.id}`,
                                                    'Button',
                                                    JSON.stringify({
                                                        type: 'Click',
                                                        value: `${
                                                            store.graphInstance.visibleComponents.includes(
                                                                component.id
                                                            )
                                                                ? 'Hide'
                                                                : 'Show'
                                                        } ${component.id}`
                                                    })
                                                );

                                                store.graphInstance.toggleVisibleComponents(
                                                    component.id
                                                );
                                            }}
                                            icon={
                                                <Eye
                                                    style={{ '--ggs': '0.7' }}
                                                />
                                            }
                                        />
                                    </Tooltip>
                                </HStack>
                                {props.networkData !== 'all' && (
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
                                                        !props.demoData.length
                                                    ) {
                                                        store.track.trackEvent(
                                                            `Details Panel - Widget - ${props.chart.id}`,
                                                            'Button',
                                                            JSON.stringify({
                                                                type: 'Click',
                                                                value: `Deselect ${component.id}`
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
    networkData: PropTypes.string,
    demoData: PropTypes.array
};

SelectedComponentList.defaultProps = {
    isExpanded: false,
    networkData: 'all',
    demoData: []
};

export default observer(SelectedComponentList);
