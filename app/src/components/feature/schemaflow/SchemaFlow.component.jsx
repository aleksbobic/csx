import {
    Box,
    HStack,
    IconButton,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { Assign, Lock, LockUnlock } from 'css.gg';

import ConnectorNode from 'components/feature/advancedsearch/connectornode/ConnectorNode.component';
import CountsNode from 'components/feature/advancedsearch/countsNode/Counts.component';
import FilterNode from 'components/feature/advancedsearch/filternode/FilterNode.component';
import KeywordExtractionNode from 'components/feature/advancedsearch/keywordextractionnode/KeywordExtractionNode.component';
import ResultsNode from 'components/feature/advancedsearch/resultsNode/ResultsNode.component';
import SearchEdge from 'components/feature/advancedsearch/searchedge/SearchEdge.component';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background
} from 'react-flow-renderer';
import AutoSizer from 'react-virtualized-auto-sizer';
import DatasetNode from '../advancedsearch/datasetNode/Dataset.component';
import SchemaEdge from '../schemaedge/SchemaEdge.component';
import SearchNode from '../advancedsearch/searchnode/SearchNode.component';
import HistoryNode from '../historyNode/HistoryNode.component';
import OverviewCustomEdge from '../overviewschemaedge/OverviewSchemaEdge.component';
import OverviewSchemaNode from '../overviewschemanode/OverviewSchemaNode.component';
import SchemaNode from '../schemanode/SchemaNode.component';
import { observer } from 'mobx-react';

function SchemaFlow() {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();
    const [schemaViewport, setSchemaViewport] = useState(null);

    const [schemaNodes, setSchemaNodes] = useState(
        store.core.isOverview ? store.schema.overviewNodes : store.schema.nodes
    );
    const [schemaEdges, setSchemaEdges] = useState(
        store.core.isOverview ? store.schema.overviewEdges : store.schema.edges
    );

    const nodeTypes = useMemo(
        () => ({
            datasetNode: DatasetNode,
            schemaNode: SchemaNode,
            overviewSchemaNode: OverviewSchemaNode,
            historyNode: HistoryNode,
            searchNode: SearchNode,
            connectorNode: ConnectorNode,
            filterNode: FilterNode,
            keywordExtractionNode: KeywordExtractionNode,
            countsNode: CountsNode,
            resultsNode: ResultsNode
        }),
        []
    );

    const edgeTypes = useMemo(
        () => ({
            schemaEdge: SchemaEdge,
            overviewCustomEdge: OverviewCustomEdge,
            searchEdge: SearchEdge
        }),
        []
    );

    useEffect(() => {
        setSchemaNodes(
            store.core.isOverview
                ? store.schema.overviewNodes
                : store.schema.nodes
        );
        setSchemaEdges(
            store.core.isOverview
                ? store.schema.overviewEdges
                : store.schema.edges
        );
    }, [
        store.core.currentGraph,
        store.core.isOverview,
        store.schema.edges,
        store.schema.nodes,
        store.schema.overviewEdges,
        store.schema.overviewNodes
    ]);

    const connectNodes = connection => {
        store.schema.addSchemaConnection(connection);
        store.core.updateVisibleDimensionsBasedOnSchema();
    };

    const updateEdge = (oldEdge, newEdge) => {
        store.schema.updateSchemaConnection(oldEdge, newEdge);
    };

    const onNodesChange = useCallback(
        changes =>
            store.core.isOverview
                ? store.schema.updateOverviewNodes(
                      applyNodeChanges(changes, store.schema.overviewNodes)
                  )
                : store.schema.updateNodes(
                      applyNodeChanges(changes, store.schema.nodes)
                  ),
        [store.core.isOverview, store.schema]
    );
    const onEdgesChange = useCallback(
        changes => {
            if (store.core.isOverview) {
                store.schema.updateOverviewEdges(
                    applyEdgeChanges(changes, store.schema.overviewEdges)
                );
            } else {
                store.schema.updateEdges(
                    applyEdgeChanges(changes, store.schema.edges)
                );
                store.core.updateVisibleDimensionsBasedOnSchema();
            }
        },
        [store.core, store.schema]
    );

    return (
        <Box height="100%" minHeight="200px" width="100%">
            <AutoSizer>
                {({ height, width }) => (
                    <ReactFlow
                        style={{
                            height: `${height}px`,
                            width: `${width}px`
                        }}
                        nodes={schemaNodes}
                        edges={schemaEdges}
                        nodesDraggable={true}
                        nodesConnectable={true}
                        snapToGrid={true}
                        onConnect={connectNodes}
                        onEdgeUpdate={updateEdge}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onInit={instance => {
                            instance.fitView();
                            setSchemaViewport(instance);
                        }}
                    >
                        <Background
                            gap={12}
                            size={1}
                            style={{ opacity: 0.5 }}
                        />
                    </ReactFlow>
                )}
            </AutoSizer>
            <HStack
                backgroundColor={
                    colorMode === 'light' ? 'whiteAlpha.900' : 'blackAlpha.900'
                }
                position="absolute"
                bottom="10px"
                left="10px"
                zIndex="20"
                width={store.core.isDetail ? '82px' : '44px'}
                height="42px"
                padding="6px"
                borderRadius="10px"
                spacing="6px"
            >
                <Tooltip label="Show all nodes">
                    <IconButton
                        size="sm"
                        opacity="0.6"
                        transition="0.2s all ease-in-out"
                        _hover={{ opacity: 1 }}
                        icon={
                            <Assign
                                style={{
                                    '--ggs': '0.8'
                                }}
                            />
                        }
                        onClick={() => {
                            store.track.trackEvent(
                                'Schema Panel',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Show all schema nodes'
                                })
                            );

                            schemaViewport.fitView();
                        }}
                    />
                </Tooltip>
                {store.core.isDetail && (
                    <Tooltip
                        label={
                            store.core.isSchemaNodeTypeBound
                                ? 'Unbind schema and visible node types'
                                : 'Bind schema and visible node types'
                        }
                    >
                        <IconButton
                            size="sm"
                            opacity="0.6"
                            transition="0.2s all ease-in-out"
                            _hover={{ opacity: 1 }}
                            icon={
                                store.core.isSchemaNodeTypeBound ? (
                                    <Lock
                                        style={{
                                            '--ggs': '0.7'
                                        }}
                                    />
                                ) : (
                                    <LockUnlock
                                        style={{
                                            '--ggs': '0.7',
                                            marginBottom: '-2px',
                                            marginRight: '-2px'
                                        }}
                                    />
                                )
                            }
                            onClick={() => {
                                store.track.trackEvent(
                                    'Schema Panel',
                                    'Button',
                                    JSON.stringify({
                                        type: 'Click',
                                        value: store.core.isSchemaNodeTypeBound
                                            ? 'Unbind schema and visible node types'
                                            : 'Bind schema and visible node types'
                                    })
                                );

                                store.core.setIsSchemaNodeTypeBound(
                                    !store.core.isSchemaNodeTypeBound
                                );
                            }}
                        />
                    </Tooltip>
                )}
            </HStack>
        </Box>
    );
}

export default observer(SchemaFlow);
