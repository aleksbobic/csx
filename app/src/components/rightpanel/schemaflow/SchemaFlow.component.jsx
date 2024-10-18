import "overlayscrollbars/overlayscrollbars.css";

import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Box,
  Button,
  HStack,
  IconButton,
  SlideFade,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import {
  ConnectorNode,
  CountsNode,
  DatasetNode,
  FilterNode,
  KeywordExtractionNode,
  ResultsNode,
  SearchEdge,
  SearchNode,
} from "components/advancedsearch";
import ReactFlow, {
  Background,
  applyEdgeChanges,
  applyNodeChanges,
} from "react-flow-renderer";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import AutoSizer from "react-virtualized-auto-sizer";
import HistoryNode from "components/historyNode/HistoryNode.component";
import OverviewCustomEdge from "components/overviewschemaedge/OverviewSchemaEdge.component";
import OverviewSchemaNode from "components/overviewschemanode/OverviewSchemaNode.component";
import { RootStoreContext } from "stores/RootStore";
import SchemaEdge from "components/schemaedge/SchemaEdge.component";
import SchemaNode from "components/schemanode/SchemaNode.component";
import { observer } from "mobx-react";

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
    store.core.isOverview,
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
      resultsNode: ResultsNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      schemaEdge: SchemaEdge,
      overviewCustomEdge: OverviewCustomEdge,
      searchEdge: SearchEdge,
    }),
    []
  );

  useEffect(() => {
    setSchemaNodes(
      store.core.isOverview ? store.overviewSchema.nodes : store.schema.nodes
    );
    setSchemaEdges(
      store.core.isOverview ? store.overviewSchema.edges : store.schema.edges
    );
  }, [
    store.core.currentGraph,
    store.core.isOverview,
    store.overviewSchema.edges,
    store.overviewSchema.nodes,
    store.schema.edges,
    store.schema.nodes,
  ]);

  const connectNodes = (connection) => {
    store.schema.addSchemaConnection(connection);
  };

  const updateEdge = (oldEdge, newEdge) => {
    store.schema.updateSchemaConnection(oldEdge, newEdge);
  };

  const onNodesChange = useCallback(
    (changes) => {
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
    (changes) => {
      if (store.core.isOverview) {
        store.overviewSchema.updateEdges(
          applyEdgeChanges(changes, store.overviewSchema.edges)
        );
      } else {
        store.schema.updateEdges(applyEdgeChanges(changes, store.schema.edges));
      }
    },
    [store.core, store.overviewSchema, store.schema]
  );

  return (
    <Box
      height="100%"
      minHeight="200px"
      width="100%"
      id="schema"
      style={{ position: "relative" }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <ReactFlow
            style={{
              height: `${height}px`,
              width: `${width}px`,
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
            onInit={(instance) => {
              instance.fitView();
              setSchemaViewport(instance);
            }}
          >
            <Background gap={12} size={1} style={{ opacity: 0.5 }} />
          </ReactFlow>
        )}
      </AutoSizer>

      {showApplyChanges && (
        <Box
          bottom="14px"
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
              leftIcon={
                <ArrowPathIcon style={{ width: "12px", height: "12px" }} />
              }
              _hover={{ backgroundColor: "blue.500" }}
              onClick={() => {
                store.track.trackEvent(
                  "Graph Area - Graph Controls",
                  "Button",
                  {
                    type: "Click",
                    value: "Regenerate graph",
                  }
                );
                store.overviewSchema.setSchemaHasChanges(false);
                store.schema.setSchemaHasChanges(false);
                store.graph.modifyStudy(store.core.currentGraph);
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
                    width: "30px",
                    heght: "30px",
                  }}
                />
              </Box>
              <Text fontSize="sm" fontWeight="medium" textAlign="left">
                {store.schema.schemaError}
              </Text>
            </HStack>
          </SlideFade>
        </Box>
      )}

      <HStack
        backgroundColor={colorMode === "light" ? "whiteAlpha.900" : "#1d1d1d"}
        position="absolute"
        bottom="10px"
        left="10px"
        zIndex="20"
        width="44px"
        height="44px"
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
              <ViewfinderCircleIcon
                style={{
                  width: "14px",
                  height: "14px",
                }}
              />
            }
            onClick={() => {
              store.track.trackEvent(
                {
                  area: "Schema panel",
                  sub_area: "Schema",
                },
                {
                  item_type: "Button",
                },
                {
                  event_type: "Click",
                  event_action: "Show all schema nodes",
                }
              );

              schemaViewport.fitView();
            }}
          />
        </Tooltip>
      </HStack>
    </Box>
  );
}

const ObservedSchemaFlow = observer(SchemaFlow);
export default ObservedSchemaFlow;
