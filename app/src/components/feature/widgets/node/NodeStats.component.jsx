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
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import WidgetAlert from '../WidgetAlert.component';

function SelectedNodeList(props) {
    const store = useContext(RootStoreContext);
    const [data, setData] = useState([]);
    const { colorMode } = useColorMode();
    const [title, setTitle] = useState(props.title);
    const [chartNetworkData, setChartNetworkData] = useState(
        props?.chart?.network_data ? props.chart.network_data : 'all'
    );
    const [dispalyLimit, setDispalyLimit] = useState(
        props?.chart?.display_limit ? props.chart.display_limit : 10
    );

    useEffect(() => {
        if (props.demoData.length) {
            setData(props.demoData);
        } else {
            let data;

            switch (chartNetworkData) {
                case 'selected':
                    data = store.graph.currentGraphData.selectedNodes;
                    break;
                case 'visible':
                    data = store.graph.currentGraphData.nodes.filter(
                        node => node.visible
                    );
                    break;
                default:
                    data = store.graph.currentGraphData.nodes;
                    break;
            }

            data = data.slice().sort((node1, node2) => {
                if (node1.neighbours.size > node2.neighbours.size) {
                    return -1;
                }

                if (node1.neighbours.size < node2.neighbours.size) {
                    return 1;
                }

                return 0;
            });

            if (chartNetworkData === 'selected' || dispalyLimit === 0) {
                setData(data);
            } else if (dispalyLimit > 0) {
                setData(data.slice(0, dispalyLimit));
            } else {
                setData(data.slice(dispalyLimit, data.length));
            }
        }
    }, [
        chartNetworkData,
        dispalyLimit,
        props.demoData,
        props.elementDisplayLimit,
        props.networkData,
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
                                    <option value="visible">Visible</option>
                                    <option value="selected">Selected</option>
                                    <option value="all">All</option>
                                </Select>
                            </HStack>
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
                                    defaultValue={dispalyLimit}
                                    borderRadius="5px"
                                    onChange={e => {
                                        setDispalyLimit(e.target.value);

                                        store.stats.setWidgetProperty(
                                            props.chart.id,
                                            'display_limit',
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
                                    <option value={10}>First 10</option>
                                    <option value={50}>First 50</option>
                                    <option value={100}>First 100</option>
                                    <option value={-10}>Last 10</option>
                                    <option value={-50}>Last 50</option>
                                    <option value={-100}>Last 100</option>
                                    <option value={0}>All</option>
                                </Select>
                            </HStack>
                        </VStack>
                    </CustomScroll>
                </VStack>
            </Center>
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
                                        props.networkData === 'selected'
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

                                {props.networkData === 'selected' && (
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
    networkData: PropTypes.string,
    demoData: PropTypes.array,
    elementDisplayLimit: PropTypes.number
};

SelectedNodeList.defaultProps = {
    isExpanded: false,
    networkData: 'all',
    demoData: [],
    elementDisplayLimit: 10
};

export default observer(SelectedNodeList);
