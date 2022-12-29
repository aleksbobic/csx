import {
    Box,
    IconButton,
    Text,
    Tooltip,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowRight } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import { useContext, useEffect, useRef, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import { useResizeDetector } from 'react-resize-detector';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function Serp(props) {
    const store = useContext(RootStoreContext);

    const [listData, setListData] = useState([]);
    const [listSizes, setListSizes] = useState([]);
    const [timer, setTimer] = useState(null);

    const listContainerRefrence = useRef(null);
    const listItemRefrences = useRef([]);
    const { width, height } = useResizeDetector({ listContainerRefrence });

    const { colorMode } = useColorMode();

    const listVirtualizer = useVirtualizer({
        count: listData.length,
        getScrollElement: () => listContainerRefrence.current,
        estimateSize: index => (listSizes[index] ? listSizes[index] : 125),
        measureElement: ({ index }) => listSizes[index]
    });

    const recalculateSizes = () => {
        listVirtualizer.getVirtualItems().forEach(item => {
            listSizes[item.index] =
                listItemRefrences.current[item.index].firstChild.clientHeight +
                10;
        });
        listVirtualizer.measure();
    };

    useEffect(() => {
        setListData(props.data);

        setTimeout(() => {
            const newSizes = Array(props.data.length);

            listVirtualizer.getVirtualItems().forEach(item => {
                newSizes[item.index] =
                    listItemRefrences.current[item.index].firstChild
                        .clientHeight + 10;
            });

            setListSizes(newSizes);
            listVirtualizer.measure();
        }, 100);
    }, [props.data, listVirtualizer, props.visibleProperties]);

    useEffect(() => {
        const resizeSERP = () => {
            clearTimeout(timer);
            setTimer(setTimeout(recalculateSizes, 50));
        };
        window.addEventListener('resize', resizeSERP);

        return () => {
            window.removeEventListener('resize', resizeSERP);
        };
    });

    const getDataComponent = (feature, value, index, feature_index) => {
        if (store.search.nodeTypes[feature] === 'string') {
            return (
                <Box
                    key={`serp_result_${index}_${feature_index}`}
                    padding="6px"
                    borderRadius="6px"
                    width="100%"
                >
                    <Text
                        fontSize="xs"
                        backgroundColor="blue.600"
                        marginRight="5px"
                        display="inline"
                        padding="3px 6px"
                        borderRadius="3px"
                        fontWeight="bold"
                    >
                        {feature.toUpperCase()}
                    </Text>
                    <Text
                        fontSize="xs"
                        width="100%"
                        paddingTop="10px"
                        display="inline"
                    >
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Text>
                </Box>
            );
        }

        if (store.search.nodeTypes[feature] === 'list') {
            return (
                <Box
                    key={`serp_result_${index}_${feature_index}`}
                    padding="6px"
                    borderRadius="6px"
                    width="100%"
                >
                    <Text
                        fontSize="xs"
                        backgroundColor="blue.600"
                        marginRight="5px"
                        display="inline"
                        padding="3px 6px"
                        borderRadius="3px"
                        fontWeight="bold"
                    >
                        {feature.toUpperCase()}:
                    </Text>

                    <Text fontSize="xs" display="inline">
                        {String(value.filter(value => value !== '')).replace(
                            /,/g,
                            ' | '
                        )}
                    </Text>
                </Box>
            );
        }

        return (
            <Box
                key={`serp_result_${index}_${feature_index}`}
                padding="6px"
                borderRadius="6px"
                width="100%"
            >
                <Text
                    fontSize="xs"
                    backgroundColor="blue.600"
                    marginRight="5px"
                    display="inline"
                    padding="3px 6px"
                    borderRadius="3px"
                    fontWeight="bold"
                >
                    {feature.toUpperCase()}:
                </Text>

                <Text fontSize="xs" display="inline">
                    {value}
                </Text>
            </Box>
        );
    };
    const renderResult = (index, key) => {
        const propertyObjects = props.visibleProperties.map(
            (feature, feature_index) => {
                return getDataComponent(
                    feature,
                    listData[index][feature],
                    index,
                    feature_index
                );
            }
        );

        return (
            <Box width="100%" paddingBottom="10px">
                <VStack
                    key={key}
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'whiteAlpha.100'
                    }
                    width="100%"
                    padding="20px"
                    paddingBottom="30px"
                    borderRadius="6px"
                >
                    {propertyObjects}
                </VStack>
                <Tooltip label="Show in graph">
                    <IconButton
                        position="absolute"
                        right="10px"
                        bottom="20px"
                        size="xs"
                        variant="ghost"
                        icon={<ArrowRight style={{ '--ggs': 0.6 }} />}
                        onClick={() => {
                            const nodeIds = store.graph.currentGraphData.nodes
                                .filter(node =>
                                    node.entries.includes(
                                        listData[index]['entry']
                                    )
                                )
                                .map(node => node.id);

                            store.track.trackEvent(
                                'Results Panel - List',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: `Navigate to entry ${listData[index]['entry']}`,
                                    nodes: nodeIds
                                })
                            );

                            if (nodeIds.length > 1) {
                                store.graphInstance.zoomToFitByNodeIds(nodeIds);
                            } else if (nodeIds.length === 1) {
                                store.graphInstance.zoomToFitByNodeId(
                                    nodeIds[0]
                                );
                            }
                        }}
                    />
                </Tooltip>
            </Box>
        );
    };

    return (
        <VStack height="100%" width="100%" paddingTop="30px">
            <OverlayScrollbarsComponent
                style={{
                    width: '100%',
                    height: '100%'
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
                <Box height="100%" width="100%" borderRadius="6px">
                    <Box
                        ref={listContainerRefrence}
                        style={{
                            height: `${height}px`,
                            width: `${width}px`,
                            borderRadius: '6px'
                        }}
                    >
                        <Box
                            style={{
                                height: `${listVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative'
                            }}
                        >
                            {listVirtualizer.getVirtualItems().length > 0 &&
                                listVirtualizer
                                    .getVirtualItems()
                                    .map((virtualRow, index) => {
                                        return (
                                            <Box
                                                key={virtualRow?.key}
                                                ref={element => {
                                                    listItemRefrences.current[
                                                        virtualRow.index
                                                    ] = element;
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: `${
                                                        virtualRow?.size - 10
                                                    }px`,
                                                    transform: `translateY(${virtualRow?.start}px)`
                                                }}
                                            >
                                                {renderResult(
                                                    virtualRow?.index,
                                                    virtualRow?.key
                                                )}
                                            </Box>
                                        );
                                    })}
                        </Box>
                    </Box>
                </Box>
            </OverlayScrollbarsComponent>
        </VStack>
    );
}

Serp.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array,
    hiddenColumns: PropTypes.array,
    visibleProperties: PropTypes.array
};

Serp.defaultProps = {
    hiddenColumns: []
};

export default observer(Serp);
