import {
    Box,
    HStack,
    IconButton,
    Link,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { Assign, Presentation } from 'css.gg';

import ConnectorNode from 'components/feature/advancedsearch/connectornode/ConnectorNode.component';
import CountsNode from 'components/feature/advancedsearch/countsNode/Counts.component';
import FilterNode from 'components/feature/advancedsearch/filternode/FilterNode.component';
import KeywordExtractionNode from 'components/feature/advancedsearch/keywordextractionnode/KeywordExtractionNode.component';
import ResultsNode from 'components/feature/advancedsearch/resultsNode/ResultsNode.component';
import SearchEdge from 'components/feature/advancedsearch/searchedge/SearchEdge.component';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import ReactFlow, { MiniMap } from 'react-flow-renderer';
import AutoSizer from 'react-virtualized-auto-sizer';
import DatasetNode from '../../advancedsearch/datasetNode/Dataset.component';
import SchemaEdge from '../../advancedsearch/searchedge/SearchEdge.component';
import SearchNode from '../../advancedsearch/searchnode/SearchNode.component';
import HistoryNode from '../../historyNode/HistoryNode.component';
import OverviewCustomEdge from '../../overviewschemaedge/OverviewSchemaEdge.component';
import OverviewSchemaNode from '../../overviewschemanode/OverviewSchemaNode.component';
import SchemaNode from '../../schemanode/SchemaNode.component';

export function HistoryFlow() {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

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

    const [historyNodes, setHistoryNodes] = useState(store.history.nodes);
    const [historyEdges, setHistoryEdges] = useState(store.history.edges);

    const [historyViewport, setHistoryViewport] = useState(null);

    useEffect(() => {
        store.history.generateHistoryNodes();
    }, [store.history, colorMode]);

    useEffect(() => {
        setHistoryNodes(store.history.nodes);
        setHistoryEdges(store.history.edges);
    }, [store.history.edges, store.history.nodes]);

    const zoomToActiveHistoryNode = () => {
        const selectedNodePosition =
            store.history.nodes[store.core.studyHistoryItemIndex].position;

        historyViewport.setCenter(
            selectedNodePosition.x + 100,
            selectedNodePosition.y,
            { duration: 0, zoom: 1 }
        );
    };

    return (
        <Box
            height="100%"
            minHeight="200px"
            width="100%"
            backgroundColor="whiteAlpha.200"
            borderRadius="8px"
        >
            <AutoSizer>
                {({ height, width }) => (
                    <ReactFlow
                        style={{
                            height: `${height}px`,
                            width: `${width}px`
                        }}
                        nodes={historyNodes}
                        edges={historyEdges}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        snapToGrid={true}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        minZoom={0.2}
                        defaultZoom={1.25}
                        maxZoom={1.5}
                        onInit={instance => {
                            setHistoryViewport(instance);

                            if (
                                store.history.nodes[
                                    store.core.studyHistoryItemIndex
                                ]
                            ) {
                                const selectedNodePosition =
                                    store.history.nodes[
                                        store.core.studyHistoryItemIndex
                                    ].position;

                                instance.setCenter(
                                    selectedNodePosition.x + 100,
                                    selectedNodePosition.y,
                                    { duration: 0, zoom: 1 }
                                );
                            }
                        }}
                    >
                        <MiniMap
                            nodeColor={node =>
                                node.data.isActive
                                    ? '#3182ceeb'
                                    : colorMode === 'light'
                                    ? '#c5c5c5'
                                    : '#323232'
                            }
                            nodeStrokeColor={node =>
                                node.data.isActive
                                    ? '#3182ceeb'
                                    : colorMode === 'light'
                                    ? '#7bc5c5c57b7b'
                                    : '#323232'
                            }
                            nodeBorderRadius="15px"
                            maskColor={
                                colorMode === 'light' ? '#c5c5c5' : '#1a1a1a'
                            }
                            style={{
                                backgroundColor:
                                    colorMode === 'light'
                                        ? '#7b7b7b'
                                        : '#000000',
                                border: '1px solid #ffffff22',
                                borderRadius: '8px'
                            }}
                            nodeStrokeWidth={3}
                        />
                    </ReactFlow>
                )}
            </AutoSizer>

            <HStack position="absolute" bottom="20px" left="20px" zIndex="20">
                <Tooltip label="Navigate to current history node">
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
                                JSON.stringify({
                                    area: 'History panel'
                                }),
                                JSON.stringify({
                                    item_type: 'Button'
                                }),
                                JSON.stringify({
                                    event_type: 'Click',
                                    event_action:
                                        'Navigate to active history node'
                                })
                            );

                            zoomToActiveHistoryNode();
                        }}
                    />
                </Tooltip>

                <Tooltip label="Open presentation up to active history item.">
                    <IconButton
                        size="sm"
                        as={Link}
                        opacity="0.6"
                        transition="0.2s all ease-in-out"
                        isDisabled={!store.core.studyIsSaved}
                        _hover={{ opacity: 1 }}
                        icon={
                            <Presentation
                                style={{
                                    '--ggs': '0.8'
                                }}
                            />
                        }
                        onClick={e => {
                            if (!store.core.studyIsSaved) {
                                e.preventDefault();
                            }

                            store.track.trackEvent(
                                JSON.stringify({
                                    area: 'History panel'
                                }),
                                JSON.stringify({
                                    item_type: 'Link'
                                }),
                                JSON.stringify({
                                    event_type: 'Click',
                                    event_action:
                                        'Open presentation up to active history item'
                                })
                            );
                        }}
                        href={
                            store.core.studyIsSaved
                                ? `http://localhost:8882/present?study=${store.core.studyUuid}&active_item=${store.core.studyHistoryItemIndex}`
                                : ''
                        }
                        isExternal
                    />
                </Tooltip>
            </HStack>
        </Box>
    );
}
