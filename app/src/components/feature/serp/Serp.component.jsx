import { Box, IconButton, Text, Tooltip, VStack } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowRight } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

import { useContext, useEffect, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { RootStoreContext } from 'stores/RootStore';

function Serp(props) {
    const store = useContext(RootStoreContext);

    const [listData, setListData] = useState([]);
    const [timer, setTimer] = useState(null);

    const scrollTableContainerRefrence = useRef(null);
    const listElement = useRef(null);

    const rowVirtualizer = useVirtualizer({
        count: listData.length,
        getScrollElement: () => scrollTableContainerRefrence.current,
        estimateSize: () => 125
    });

    const recalculateSizes = () => {
        rowVirtualizer.measure();
        rowVirtualizer
            .getVirtualItems()
            .map((item, index) =>
                item.measureElement(
                    listElement.current.children[index].children[0]
                )
            );
    };

    useEffect(() => {
        setListData(props.data);
        setTimeout(() => {
            rowVirtualizer.measure();
            rowVirtualizer
                .getVirtualItems()
                .map((item, index) =>
                    item.measureElement(
                        listElement.current.children[index].children[0]
                    )
                );
        }, 100);
    }, [props.data, rowVirtualizer, props.visibleProperties]);

    useEffect(() => {
        const resizeSERP = () => {
            clearTimeout(timer);
            setTimer(setTimeout(recalculateSizes, 100));
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
            (feature, feature_index) =>
                getDataComponent(
                    feature,
                    listData[index][feature],
                    index,
                    feature_index
                )
        );

        return (
            <Box width="100%" paddingBottom="10px">
                <VStack
                    key={key}
                    backgroundColor="whiteAlpha.100"
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
        <VStack
            height="100%"
            width="100%"
            marginTop="20px"
            paddingBottom="10px"
        >
            <Box height="100%" width="100%">
                <AutoSizer height="100%" width="100%">
                    {({ height, width }) => (
                        <Box
                            ref={scrollTableContainerRefrence}
                            style={{
                                height: height,
                                width: width,
                                overflow: 'auto'
                            }}
                        >
                            <div
                                ref={listElement}
                                style={{
                                    height: rowVirtualizer.getTotalSize(),
                                    width: '100%',
                                    position: 'relative'
                                }}
                            >
                                {rowVirtualizer
                                    .getVirtualItems()
                                    .map(virtualRow => {
                                        return (
                                            <div
                                                key={virtualRow.index}
                                                ref={virtualRow.measureElement}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    transform: `translateY(${virtualRow.start}px)`
                                                }}
                                            >
                                                {renderResult(
                                                    virtualRow.index,
                                                    virtualRow.index
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        </Box>
                    )}
                </AutoSizer>
            </Box>
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
