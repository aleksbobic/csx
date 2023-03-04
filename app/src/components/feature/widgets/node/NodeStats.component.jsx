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
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import WidgetAlert from '../WidgetAlert.component';
import WidgetSettings from '../WidgetSettings.component';

function SelectedNodeList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();
    const [widgetConfig, setWidgetConfig] = useState(
        store.stats.activeWidgets.find(
            widget => widget.id === props.chart?.id
        ) || {}
    );

    const sortWidgetData = data => {
        return data.slice().sort((node1, node2) => {
            if (node1.neighbours.size > node2.neighbours.size) {
                return -1;
            }

            if (node1.neighbours.size < node2.neighbours.size) {
                return 1;
            }

            return 0;
        });
    };

    const getWidgetDataBasedOnNetworkData = useCallback(
        widget => {
            switch (widget.network_data) {
                case 'selected':
                    return store.graph.currentGraphData.selectedNodes;
                case 'visible':
                    return store.graph.currentGraphData.nodes.filter(
                        node => node.visible
                    );
                default:
                    return store.graph.currentGraphData.nodes;
            }
        },
        [
            store.graph.currentGraphData.nodes,
            store.graph.currentGraphData.selectedNodes
        ]
    );

    const getWidgetData = useCallback(
        widget => {
            if (!widget) {
                return null;
            }

            let data = getWidgetDataBasedOnNetworkData(widget);

            data = sortWidgetData(data);

            if (
                widget.network_data === 'selected' ||
                widget.display_limit === 0
            ) {
                return data;
            }

            if (widget.display_limit > 0) {
                return data.slice(0, widget.display_limit);
            }

            return data.slice(widget.display_limit, data.length);
        },
        [getWidgetDataBasedOnNetworkData]
    );

    useEffect(() => {
        if (props.demoData.length) {
            setData(props.demoData);
        } else {
            const widget = store.stats.activeWidgets.find(
                widget => widget.id === props.chart.id
            );

            setWidgetConfig(widget);
            setData(getWidgetData(widget));
        }
    }, [
        getWidgetData,
        props.chart?.id,
        props.demoData,
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

    const renderNodeDetails = node => {
        return (
            <HStack>
                {store.core.isDetail && (
                    <Tag
                        size="md"
                        borderRadius="4px"
                        variant="solid"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.200'
                        }
                    >
                        <TagLabel>Type: {node.feature}</TagLabel>
                    </Tag>
                )}

                <Tag
                    size="md"
                    borderRadius="4px"
                    variant="solid"
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'whiteAlpha.200'
                    }
                >
                    <TagLabel>
                        {`${node.neighbours.size} ${
                            node.neighbours.size === 1
                                ? 'neighbour'
                                : 'neighbours'
                        }`}
                    </TagLabel>
                </Tag>
            </HStack>
        );
    };

    if (props.settingsMode && props.isExpanded) {
        return (
            <WidgetSettings
                widgetID={props.chart.id}
                settings={['item state', 'item count']}
            />
        );
    }

    if (data.length === 0) {
        return <WidgetAlert size={props.isExpanded ? 'md' : 'sm'} />;
    }

    return (
        <Box height="100%" width="100%" position="relative">
            <CustomScroll
                style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    position: 'absolute'
                }}
            >
                <VStack height="100%" width="100%" spacing={1}>
                    {data.map((node, index) => {
                        return (
                            <Stat
                                key={node.id}
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
                                <Heading
                                    size="xs"
                                    marginBottom={
                                        props.isExpanded ? '8px' : '0'
                                    }
                                    whiteSpace="nowrap"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    opacity={colorMode === 'light' && 0.8}
                                    width="100%"
                                    paddingRight={
                                        widgetConfig.network_data === 'selected'
                                            ? '30px'
                                            : '0'
                                    }
                                    _hover={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        if (!props.demoData.length) {
                                            store.track.trackEvent(
                                                `Details Panel - Widget - ${props.chart.id}`,
                                                'Button',
                                                JSON.stringify({
                                                    type: 'Click',
                                                    value: `Zoom to fit ${node.id} - ${node.label}`
                                                })
                                            );

                                            store.graphInstance.zoomToFitByNodeId(
                                                node.id
                                            );
                                        }
                                    }}
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="black"
                                        opacity="0.2"
                                        display="inline"
                                        marginRight="5px"
                                    >
                                        {index} -
                                    </Text>
                                    {node.label}
                                </Heading>

                                {props.isExpanded && renderNodeDetails(node)}

                                {widgetConfig.network_data === 'selected' && (
                                    <Box
                                        position="absolute"
                                        top="4px"
                                        right="8px"
                                    >
                                        <Tooltip label="Deselect node">
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
                                                                value: `Deselect ${node.id} - ${node.label}`
                                                            })
                                                        );

                                                        const nodeIndex =
                                                            store.graph.currentGraphData.selectedNodes.findIndex(
                                                                n =>
                                                                    n.id ===
                                                                    node.id
                                                            );

                                                        store.graph.toggleNodeSelection(
                                                            node.id,
                                                            nodeIndex
                                                        );
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    </Box>
                                )}
                            </Stat>
                        );
                    })}
                </VStack>
            </CustomScroll>
        </Box>
    );
}
SelectedNodeList.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.array
};

SelectedNodeList.defaultProps = {
    isExpanded: false,
    demoData: []
};

export default observer(SelectedNodeList);
