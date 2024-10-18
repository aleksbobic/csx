import "overlayscrollbars/overlayscrollbars.css";

import {
  Box,
  HStack,
  IconButton,
  Link,
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
import {
  PresentationChartBarIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import ReactFlow, { MiniMap } from "react-flow-renderer";
import { useContext, useEffect, useMemo, useState } from "react";

import AutoSizer from "react-virtualized-auto-sizer";
import HistoryNode from "components/historyNode/HistoryNode.component";
import OverviewCustomEdge from "components/overviewschemaedge/OverviewSchemaEdge.component";
import OverviewSchemaNode from "components/overviewschemanode/OverviewSchemaNode.component";
import { RootStoreContext } from "stores/RootStore";
import SchemaEdge from "components/advancedsearch/searchedge/SearchEdge.component";
import SchemaNode from "components/schemanode/SchemaNode.component";

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
      style={{ position: "relative" }}
      id="HistoryFlow"
    >
      <AutoSizer>
        {({ height, width }) => (
          <ReactFlow
            style={{
              height: `${height}px`,
              width: `${width}px`,
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
            onInit={(instance) => {
              setHistoryViewport(instance);

              if (store.history.nodes[store.core.studyHistoryItemIndex]) {
                const selectedNodePosition =
                  store.history.nodes[store.core.studyHistoryItemIndex]
                    .position;

                instance.setCenter(
                  selectedNodePosition.x + 100,
                  selectedNodePosition.y,
                  { duration: 0, zoom: 1 }
                );
              }
            }}
          >
            <MiniMap
              nodeColor={(node) =>
                node.data.isActive
                  ? "#3182ceeb"
                  : colorMode === "light"
                    ? "#c5c5c5"
                    : "#323232"
              }
              nodeStrokeColor={(node) =>
                node.data.isActive
                  ? "#3182ceeb"
                  : colorMode === "light"
                    ? "#7bc5c5c57b7b"
                    : "#323232"
              }
              nodeBorderRadius="15px"
              maskColor={colorMode === "light" ? "#c5c5c5" : "#1a1a1a"}
              style={{
                backgroundColor: colorMode === "light" ? "#7b7b7b" : "#000000",
                border: "1px solid #ffffff22",
                borderRadius: "8px",
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
                  area: "History panel",
                },
                {
                  item_type: "Button",
                },
                {
                  event_type: "Click",
                  event_action: "Navigate to active history node",
                }
              );

              zoomToActiveHistoryNode();
            }}
          />
        </Tooltip>

        <Tooltip label="Open presentation up to active history item.">
          <Link
            size="sm"
            opacity="0.6"
            transition="0.2s all ease-in-out"
            style={{
              padding: "8px",
              borderRadius: "5px",
              backgroundColor: "#6e6e6e4f",
              cursor: !store.core.studyIsSaved ? "not-allowed" : "pointer",
              opacity: !store.core.studyIsSaved ? 0.6 : 1,
            }}
            _hover={{ opacity: 1 }}
            onClick={(e) => {
              if (!store.core.studyIsSaved) {
                e.preventDefault();
              }

              store.track.trackEvent(
                {
                  area: "History panel",
                },
                {
                  item_type: "Link",
                },
                {
                  event_type: "Click",
                  event_action: "Open presentation up to active history item",
                }
              );
            }}
            href={
              store.core.studyIsSaved
                ? `${store.core.getBasePresentURL()}?study=${
                    store.core.studyUuid
                  }&active_item=${store.core.studyHistoryItemIndex}`
                : ""
            }
            isExternal
          >
            <PresentationChartBarIcon
              style={{
                width: "14px",
                height: "14px",
              }}
            />
          </Link>
        </Tooltip>
      </HStack>
    </Box>
  );
}
