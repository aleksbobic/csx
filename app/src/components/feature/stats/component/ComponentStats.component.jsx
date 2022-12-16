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
import { Eye, Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function SelectedComponentList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();

    useEffect(() => {
        const components = store.graph.currentGraphData.components;

        if (props.demoData.length) {
            setData(props.demoData);
        } else if (props.networkData === 'all') {
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
                    ]['type'][node.feature]
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

    if (data.length === 0) {
        return (
            <VStack
                height="100%"
                width="100%"
                spacing={1}
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.200' : 'blackAlpha.800'
                }
                borderRadius="6px"
                justifyContent="center"
                padding="20%"
            >
                <Heading size="md" opacity="0.5">
                    NO DATA
                </Heading>
                {props.networkData !== 'all' && props.isExpanded && (
                    <Text
                        textAlign="center"
                        fontSize="sm"
                        fontWeight="bold"
                        opacity="0.5"
                    >
                        Select some components to see details here! 😉
                    </Text>
                )}
            </VStack>
        );
    }

    return (
        <OverlayScrollbarsComponent
            style={{
                width: '100%',
                height: '100%',
                paddingLeft: '10px',
                paddingRight: '10px'
            }}
            options={{
                scrollbars: {
                    theme: 'os-theme-dark',
                    autoHide: 'scroll',
                    autoHideDelay: 600,
                    clickScroll: true
                }
            }}
        >
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
                                        : 'blackAlpha.800'
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
                                                    'Components widget',
                                                    'Button click',
                                                    `Make component ${
                                                        component.id
                                                    }  ${
                                                        store.graphInstance.visibleComponents.includes(
                                                            component.id
                                                        )
                                                            ? 'invisible'
                                                            : 'visible'
                                                    }`
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
                                                            'Components widget',
                                                            'Button click',
                                                            `Deselect component ${component.id}`
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
        </OverlayScrollbarsComponent>
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
