import {
    AspectRatio,
    Box,
    Center,
    Editable,
    EditableInput,
    EditablePreview,
    Heading,
    HStack,
    Select,
    Text,
    Tooltip,
    useColorMode,
    VStack,
    Wrap
} from '@chakra-ui/react';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { observer } from 'mobx-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import WidgetAlert from '../WidgetAlert.component';

function GraphStats(props) {
    const store = useContext(RootStoreContext);
    const [graphData, setGraphData] = useState([]);
    const [nodeData, setNodeData] = useState([]);
    const { colorMode } = useColorMode();
    const [title, setTitle] = useState(props.chart.title);
    const [chartNetworkData, setChartNetworkData] = useState(
        props?.chart?.network_data ? props.chart.network_data : 'all'
    );

    useEffect(() => {
        if (props.demoData) {
            setGraphData(Object.entries(props.demoData.graphData));
        } else {
            switch (chartNetworkData) {
                case 'visible':
                    setGraphData(
                        Object.entries(store.graph.graphVisibleObjectCount)
                    );
                    break;
                case 'selected':
                    setGraphData(
                        Object.entries(store.graph.graphSelectedObjectCount)
                    );
                    break;
                default:
                    setGraphData(Object.entries(store.graph.graphObjectCount));
                    break;
            }
        }
    }, [
        chartNetworkData,
        props.demoData,
        props.networkData,
        store.graph.graphObjectCount,
        store.graph.graphSelectedObjectCount,
        store.graph.graphVisibleObjectCount
    ]);

    useEffect(() => {
        if (props.demoData) {
            setNodeData(
                Object.entries(props.demoData.nodeData).map(entry => [
                    entry[0],
                    { count: entry[1].count, label: entry[0] }
                ])
            );
        } else {
            let node_counts;

            switch (chartNetworkData) {
                case 'visible':
                    node_counts = store.graph.currentGraphData.nodes
                        .filter(node => node.visible)
                        .reduce((counts, node) => {
                            if (Object.keys(counts).includes(node.feature)) {
                                counts[node.feature] += 1;
                            } else {
                                counts[node.feature] = 1;
                            }

                            return counts;
                        }, {});

                    setNodeData(
                        Object.entries(node_counts).map(entry => [
                            entry[0],
                            { count: entry[1], label: entry[0] }
                        ])
                    );
                    break;
                case 'selected':
                    node_counts =
                        store.graph.currentGraphData.selectedNodes.reduce(
                            (counts, node) => {
                                if (
                                    Object.keys(counts).includes(node.feature)
                                ) {
                                    counts[node.feature] += 1;
                                } else {
                                    counts[node.feature] = 1;
                                }

                                return counts;
                            },
                            {}
                        );

                    setNodeData(
                        Object.entries(node_counts).map(entry => [
                            entry[0],
                            { count: entry[1], label: entry[0] }
                        ])
                    );
                    break;
                default:
                    setNodeData(
                        Object.entries(store.graph.currentGraphData.types).map(
                            entry => [
                                entry[0],
                                { count: entry[1].count, label: entry[0] }
                            ]
                        )
                    );
                    break;
            }
        }
    }, [
        chartNetworkData,
        props.demoData,
        props.networkData,
        store.graph.currentGraphData.nodes,
        store.graph.currentGraphData.selectedNodes,
        store.graph.currentGraphData.selectedNodes.length,
        store.graph.currentGraphData.types,
        store.graphInstance.selfCentricType,
        store.graphInstance.visibleComponents
    ]);

    const renderGraphStats = (title, data) =>
        data.map((entry, index) => (
            <Box
                padding="2px"
                backgroundColor="transparent"
                borderRadius={8}
                key={`${title}_${index}_${entry[1].count}_${entry[1].label}`}
                width="93px"
            >
                <AspectRatio ratio={1} key={index} height="100%">
                    <Box
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.300'
                                : 'whiteAlpha.100'
                        }
                        borderRadius="10px"
                        width="100%"
                        height="100%"
                    >
                        <VStack
                            width="100%"
                            height="100%"
                            justifyContent="center"
                        >
                            <Text
                                color={
                                    colorMode === 'light'
                                        ? 'blackAlpha.900'
                                        : 'whiteAlpha.900'
                                }
                                fontSize="xl"
                                fontWeight="bold"
                            >
                                {entry[1].count}
                            </Text>
                            <Tooltip label={entry[1].label}>
                                <Text
                                    color={
                                        colorMode === 'light'
                                            ? 'blackAlpha.600'
                                            : 'whiteAlpha.600'
                                    }
                                    textTransform="capitalize"
                                    opacity="0.75"
                                    textAlign="center"
                                    fontSize="xs"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    width="100%"
                                    paddingLeft="10px"
                                    paddingRight="10px"
                                    style={{ margin: '0px' }}
                                >
                                    {entry[1].label}
                                </Text>
                            </Tooltip>
                        </VStack>
                    </Box>
                </AspectRatio>
            </Box>
        ));

    const renderStatsGroup = (data, title) => (
        <VStack width="100%">
            <Heading
                textAlign="left"
                width="100%"
                paddingLeft="4px"
                size="xs"
                color={
                    colorMode === 'light' ? 'blackAlpha.500' : 'whiteAlpha.300'
                }
                marginBottom="4px"
            >
                {title}
            </Heading>

            <Wrap width="100%" spacing="0">
                {renderGraphStats(title, data)}
            </Wrap>
        </VStack>
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
                                            setTitle(props.chart.title);
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
                        </VStack>
                    </CustomScroll>
                </VStack>
            </Center>
        );
    }

    if (nodeData.length === 0 && props.networkData !== 'all') {
        return <WidgetAlert size={props.isExpanded ? 'md' : 'sm'} />;
    }

    return (
        <CustomScroll style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <VStack maxHeight="100%" width="100%">
                {renderStatsGroup(graphData, 'Graph Stats')}
                {renderStatsGroup(nodeData, 'Node Stats')}
            </VStack>
        </CustomScroll>
    );
}
GraphStats.propTypes = {
    isExpanded: PropTypes.bool,
    demoData: PropTypes.object,
    networkData: PropTypes.string
};

GraphStats.defaultProps = { networkData: 'all' };

export default observer(GraphStats);
