import {
    Box,
    HStack,
    IconButton,
    Tooltip,
    useColorMode,
    Button,
    SlideFade,
    Text,
    VStack,
    Skeleton
} from '@chakra-ui/react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import { Assign, Sync } from 'css.gg';

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
import DatasetNode from '../../advancedsearch/datasetNode/Dataset.component';
import SchemaEdge from '../../schemaedge/SchemaEdge.component';
import SearchNode from '../../advancedsearch/searchnode/SearchNode.component';
import HistoryNode from '../../historyNode/HistoryNode.component';
import OverviewCustomEdge from '../../overviewschemaedge/OverviewSchemaEdge.component';
import OverviewSchemaNode from '../../overviewschemanode/OverviewSchemaNode.component';
import SchemaNode from '../../schemanode/SchemaNode.component';
import { observer } from 'mobx-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function SchemaFlow() {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();
    const [schemaViewport, setSchemaViewport] = useState(null);

    const [showApplyChanges, setShowApplyChanges] = useState(false);
    const [showSchemaError, setShowSchemaError] = useState(false);

    useEffect(() => {
        if (!store.core.isOverview && store.schema.schemaHasErrors) {
            setShowSchemaError(true);
        }

        if (
            (store.core.isOverview &&
                store.overviewSchema.schemaHasChanges &&
                store.overviewSchema.links.length > 0) ||
            (store.schema.schemaHasChanges && !store.schema.schemaHasErrors)
        ) {
            setShowSchemaError(false);
            setShowApplyChanges(true);
        } else {
            setShowApplyChanges(false);
        }
    }, [
        store.overviewSchema.schemaHasChanges,
        store.overviewSchema.links,
        store.schema.schemaHasChanges,
        store.schema.schemaHasErrors,
        store.schema.edges,
        store.core.isOverview
    ]);

    const [schemaNodes, setSchemaNodes] = useState(
        store.core.isOverview ? store.overviewSchema.nodes : store.schema.nodes
    );
    const [schemaEdges, setSchemaEdges] = useState(
        store.core.isOverview ? store.overviewSchema.edges : store.schema.edges
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
                ? store.overviewSchema.nodes
                : store.schema.nodes
        );
        setSchemaEdges(
            store.core.isOverview
                ? store.overviewSchema.edges
                : store.schema.edges
        );
    }, [
        store.core.currentGraph,
        store.core.isOverview,
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
        changes => {
            store.core.isOverview
                ? store.overviewSchema.updateNodes(
                      applyNodeChanges(changes, store.overviewSchema.nodes)
                  )
                : store.schema.updateNodes(
                      applyNodeChanges(changes, store.schema.nodes)
                  );
        },
        [store.core.isOverview, store.overviewSchema, store.schema]
    );
    const onEdgesChange = useCallback(
        changes => {
            if (store.core.isOverview) {
                store.overviewSchema.updateEdges(
                    applyEdgeChanges(changes, store.overviewSchema.edges)
                );
            } else {
                store.schema.updateEdges(
                    applyEdgeChanges(changes, store.schema.edges)
                );
            }
        },
        [store.core, store.overviewSchema, store.schema]
    );

    const getActionRecommendationLabel = action => {
        if (action === 'change_node') {
            return '~Node';
        }
        if (action.includes('edge')) {
            return `${action.includes('add') ? '+' : '-'}Edge`;
        }

        return `${action.includes('add') ? '+' : '-'}Prop`;
    };

    const getACtionRecommendationTooltip = (action, value) => {
        if (action === 'change_node') {
            return `Change node to ${value}`;
        }
        if (action.includes('edge')) {
            return `${
                action.includes('add') ? 'Add' : 'Remove'
            } ${value} as an edge`;
        }

        return `${
            action.includes('add') ? 'Add' : 'Remove'
        }  ${value} as a node property`;
    };

    return (
        <Box height="100%" minHeight="200px" width="100%" id="schema">
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

            {showApplyChanges && (
                <Box
                    bottom="64px"
                    left="50%"
                    zIndex="20"
                    transform="translateX(-50%)"
                    position="absolute"
                >
                    <SlideFade in={showApplyChanges} offsetY="10px">
                        <Button
                            backgroundColor="blue.600"
                            borderRadius="full"
                            position="relative"
                            size="sm"
                            leftIcon={<Sync style={{ '--ggs': '0.6' }} />}
                            _hover={{ backgroundColor: 'blue.500' }}
                            onClick={() => {
                                store.track.trackEvent(
                                    JSON.stringify({
                                        area: 'Graph area',
                                        sub_area: 'Graph Controls'
                                    }),
                                    JSON.stringify({
                                        item_type: 'Button'
                                    }),
                                    JSON.stringify({
                                        event_type: 'Click',
                                        event_action: 'Regenerate graph'
                                    })
                                );

                                store.overviewSchema.setSchemaHasChanges(false);
                                store.schema.setSchemaHasChanges(false);
                                store.graph.modifyStudy(
                                    store.core.currentGraph
                                );
                            }}
                        >
                            Apply Changes
                        </Button>
                    </SlideFade>
                </Box>
            )}

            {showSchemaError && (
                <Box
                    bottom="10px"
                    left="50%"
                    zIndex="20"
                    transform="translateX(-50%)"
                    position="absolute"
                >
                    <SlideFade in={showSchemaError} offsetY="10px">
                        <HStack
                            background="linear-gradient(45deg, #f26c29 0%, #a54514 100%)"
                            borderRadius="10px"
                            padding="5px 10px 5px 5px"
                        >
                            <Box padding="5px" borderRadius="6px">
                                <ExclamationTriangleIcon
                                    style={{
                                        width: '30px',
                                        heght: '30px'
                                    }}
                                />
                            </Box>
                            <Text
                                fontSize="sm"
                                fontWeight="medium"
                                textAlign="left"
                            >
                                {store.schema.schemaError}
                            </Text>
                        </HStack>
                    </SlideFade>
                </Box>
            )}

            <HStack
                backgroundColor={
                    colorMode === 'light' ? 'whiteAlpha.900' : '#1d1d1d'
                }
                position="absolute"
                bottom="10px"
                left="10px"
                zIndex="20"
                width="44px"
                height="44px"
                padding="6px"
                borderRadius="10px"
                spacing="16px"
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
                                    area: 'Schema panel',
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

                <HStack
                    padding="8px 5px 11px"
                    spacing="5px"
                    borderRadius="10px"
                    marginLeft="10px"
                    backgroundColor="whiteAlpha.100"
                    position="relative"
                >
                    <VStack alignItems="flex-start">
                        <Text
                            fontSize="7px"
                            fontWeight="black"
                            position="absolute"
                            letterSpacing="0.5px"
                            top="3px"
                            left="5px"
                            textTransform="uppercase"
                        >
                            Recommended Actions
                        </Text>
                        <HStack marginBottom="-5px" minWidth="172px">
                            {store.overviewSchema.recommendedActions.map(
                                recommendation => {
                                    if (
                                        store.overviewSchema
                                            .loadingActionRecommendations ||
                                        store.core.dataIsLoading
                                    ) {
                                        return (
                                            <Box
                                                key={recommendation.id}
                                                minHeight="22x"
                                                minWidth="52px"
                                                borderRadius="7px"
                                                padding="1px"
                                                display="flex"
                                                justifyContent="center"
                                                alignItems="center"
                                                style={{ marginBottom: '-5px' }}
                                            >
                                                <Skeleton
                                                    height="20px"
                                                    width="50px"
                                                />
                                            </Box>
                                        );
                                    }

                                    return (
                                        <Box
                                            key={recommendation.id}
                                            minHeight="22x"
                                            minWidth="52px"
                                            background="linear-gradient(152deg, rgba(3,25,119,1) 0%, rgba(66,154,226,1) 100%)"
                                            borderRadius="7px"
                                            padding="1px"
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            style={{ marginBottom: '-5px' }}
                                        >
                                            <Tooltip
                                                label={getACtionRecommendationTooltip(
                                                    recommendation.action,
                                                    recommendation.value
                                                )}
                                            >
                                                <Button
                                                    background="blackAlpha.800"
                                                    style={{
                                                        width: '50px',
                                                        height: '20px',
                                                        borderRadius: '6px'
                                                    }}
                                                    fontSize="xs"
                                                    _hover={{
                                                        backgroundColor:
                                                            'blue.500',
                                                        color: 'white'
                                                    }}
                                                    onClick={() => {
                                                        if (
                                                            recommendation.action ===
                                                            'change_node'
                                                        ) {
                                                            store.overviewSchema.setAnchor(
                                                                recommendation.value
                                                            );
                                                        }
                                                        if (
                                                            recommendation.action.includes(
                                                                'edge'
                                                            )
                                                        ) {
                                                            if (
                                                                recommendation.action.includes(
                                                                    'add'
                                                                )
                                                            ) {
                                                                const newNodeId =
                                                                    store.overviewSchema.addLinkNode();
                                                                store.overviewSchema.setLink(
                                                                    recommendation.value,
                                                                    newNodeId
                                                                );
                                                            } else {
                                                                store.overviewSchema.removeLinkNode(
                                                                    store.overviewSchema.nodes.find(
                                                                        node =>
                                                                            node
                                                                                .data
                                                                                .label ===
                                                                            recommendation.value
                                                                    ).id
                                                                );
                                                            }
                                                        }
                                                        if (
                                                            recommendation.action.includes(
                                                                'add'
                                                            )
                                                        ) {
                                                            store.overviewSchema.addProperty(
                                                                recommendation.value
                                                            );
                                                        } else {
                                                            store.overviewSchema.removeProperty(
                                                                recommendation.value
                                                            );
                                                        }

                                                        store.overviewSchema.pushCurrentSchemaToPastSchemasIncremental();
                                                        store.overviewSchema.getActionRecommendations();
                                                    }}
                                                >
                                                    {getActionRecommendationLabel(
                                                        recommendation.action
                                                    )}
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    );
                                }
                            )}
                        </HStack>
                    </VStack>
                </HStack>
            </HStack>
        </Box>
    );
}

export default observer(SchemaFlow);
