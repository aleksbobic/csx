import {
    Box,
    HStack,
    IconButton,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { Assign } from 'css.gg';

import ConnectorNode from 'components/feature/advancedsearch/connectornode/ConnectorNode.component';
import CountsNode from 'components/feature/advancedsearch/countsNode/Counts.component';
import FilterNode from 'components/feature/advancedsearch/filternode/FilterNode.component';
import KeywordExtractionNode from 'components/feature/advancedsearch/keywordextractionnode/KeywordExtractionNode.component';
import ResultsNode from 'components/feature/advancedsearch/resultsNode/ResultsNode.component';
import SearchEdge from 'components/feature/advancedsearch/searchedge/SearchEdge.component';
import { observer } from 'mobx-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import PropTypes from 'prop-types';
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background
} from 'react-flow-renderer';
import AutoSizer from 'react-virtualized-auto-sizer';
// import DatasetNode from '../advancedsearch/datasetNode/Dataset.component';
import SearchNode from '../advancedsearch/searchnode/SearchNode.component';
import HistoryNode from '../historyNode/HistoryNode.component';
import OverviewCustomEdge from '../overviewschemaedge/OverviewSchemaEdge.component';
import OverviewSchemaNode from '../overviewschemanode/OverviewSchemaNode.component';
import SchemaEdge from '../schemaedge/SchemaEdge.component';
import SchemaNode from '../schemanode/SchemaNode.component';

function SchemaConfig(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();
    const [schemaViewport, setSchemaViewport] = useState(null);

    const [schemaNodes, setSchemaNodes] = useState(
        props.graphType === 'overview'
            ? store.overviewSchema.nodes
            : store.schema.nodes
    );
    const [schemaEdges, setSchemaEdges] = useState(
        props.graphType === 'overview'
            ? store.overviewSchema.edges
            : store.schema.edges
    );

    const nodeTypes = useMemo(
        () => ({
            // datasetNode: DatasetNode,
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
            props.graphType === 'overview'
                ? store.overviewSchema.nodes
                : store.schema.nodes
        );
        setSchemaEdges(
            props.graphType === 'overview'
                ? store.overviewSchema.edges
                : store.schema.edges
        );
    }, [
        props.graphType,
        store.overviewSchema.edges,
        store.overviewSchema.nodes,
        store.schema.edges,
        store.schema.nodes
    ]);

    const connectNodes = connection => {
        store.schema.addSchemaConnection(connection);
    };

    const updateEdge = (oldEdge, newEdge) => {
        store.schema.updateSchemaConnection(oldEdge, newEdge);
    };

    const onNodesChange = useCallback(
        changes =>
            props.graphType === 'overview'
                ? store.overviewSchema.updateNodes(
                      applyNodeChanges(changes, store.overviewSchema.nodes)
                  )
                : store.schema.updateNodes(
                      applyNodeChanges(changes, store.schema.nodes)
                  ),
        [props.graphType, store.overviewSchema, store.schema]
    );
    const onEdgesChange = useCallback(
        changes => {
            if (props.graphType === 'overview') {
                store.overviewSchema.updateEdges(
                    applyEdgeChanges(changes, store.overviewSchema.edges)
                );
            } else {
                store.schema.updateEdges(
                    applyEdgeChanges(changes, store.schema.edges)
                );
            }
        },
        [props.graphType, store.overviewSchema, store.schema]
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
                    colorMode === 'light' ? 'whiteAlpha.300' : 'blackAlpha.300'
                }
                position="absolute"
                bottom="10px"
                left="10px"
                zIndex="20"
                width="44px"
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
                                JSON.stringify({
                                    area: 'Schema config',
                                    sub_area: 'Schema'
                                }),
                                JSON.stringify({
                                    item_type: 'Button'
                                }),
                                JSON.stringify({
                                    event_type: 'Click',
                                    event_action: 'Show all schema nodes'
                                })
                            );

                            schemaViewport.fitView();
                        }}
                    />
                </Tooltip>
            </HStack>
        </Box>
    );
}

SchemaConfig.propTypes = {
    graphType: PropTypes.string
};

export default observer(SchemaConfig);
