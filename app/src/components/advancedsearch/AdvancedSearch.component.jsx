import {
  Box,
  Flex,
  HStack,
  Tooltip,
  Wrap,
  useColorMode,
} from "@chakra-ui/react";
import {
  CircleStackIcon,
  DocumentTextIcon,
  FunnelIcon,
  LinkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ReactFlow, {
  Background,
  applyEdgeChanges,
  applyNodeChanges,
} from "react-flow-renderer";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ConnectorNode from "./connectornode/ConnectorNode.component";
import CountsNode from "./countsNode/Counts.component";
import DatasetNode from "./datasetNode/Dataset.component";
import FilterNode from "./filternode/FilterNode.component";
import KeywordExtractionNode from "./keywordextractionnode/KeywordExtractionNode.component";
import OverviewCustomEdge from "components/overviewschemaedge/OverviewSchemaEdge.component";
import OverviewSchemaNode from "components/overviewschemanode/OverviewSchemaNode.component";
import PropTypes from "prop-types";
import ResultsNode from "./resultsNode/ResultsNode.component";
import { RootStoreContext } from "stores/RootStore";
import SchemaEdge from "components/schemaedge/SchemaEdge.component";
import SchemaNode from "components/schemanode/SchemaNode.component";
import SearchEdge from "./searchedge/SearchEdge.component";
import SearchNode from "./searchnode/SearchNode.component";
import historyNode from "../historyNode/HistoryNode.component";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

function AdvancedSearch({ isPanel = false, style }) {
  const reactFlowWrapper = useRef(null);
  const store = useContext(RootStoreContext);
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    setNodes(store.workflow.nodes);
    setEdges(store.workflow.edges);
  }, [store.workflow.edges, store.workflow.nodes]);

  useEffect(() => {
    if (colorMode) {
      store.workflow.updateNodeStyles();
    }
  }, [colorMode, store.workflow]);

  const onNodesChange = useCallback(
    (changes) =>
      store.workflow.updateNodes(
        applyNodeChanges(changes, store.workflow.nodes)
      ),
    [store.workflow]
  );
  const onEdgesChange = useCallback(
    (changes) =>
      store.workflow.updateEdges(
        applyEdgeChanges(changes, store.workflow.edges)
      ),
    [store.workflow]
  );

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const nodeTypes = useMemo(
    () => ({
      datasetNode: DatasetNode,
      searchNode: SearchNode,
      filterNode: FilterNode,
      keywordExtractionNode: KeywordExtractionNode,
      connectorNode: ConnectorNode,
      schemaNode: SchemaNode,
      historyNode: historyNode,
      overviewSchemaNode: OverviewSchemaNode,
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
    if (store.workflow.shouldRunWorkflow) {
      navigate(`/graph?study=${store.core.studyUuid}`);
    }
  }, [
    navigate,
    store.core.studyUuid,
    store.search,
    store.search.advancedSearchQuery,
    store.search.currentDataset,
    store.workflow.shouldRunWorkflow,
  ]);

  const onLoad = (flowInstance) => setReactFlowInstance(flowInstance);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const nodeType = event.dataTransfer.getData("application/reactflow");

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    const newNodeId = store.workflow.addNewAction(nodeType, position);

    store.track.trackEvent(
      { area: "Advanced search", sub_area: "Search canvas" },
      { item_type: "Node", item_id: `${newNodeId}`, item_label: `${nodeType}` },
      { event_type: "Drop", event_action: "Add new node" }
    );
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const getFilteredActionNodeList = () => {
    return store.workflow.actionNodeTypes.filter((node) => {
      switch (node.nodeType) {
        case "filterNode":
          return (
            store.workflow.getNodeTypesOfType(["integer", "float"]).length > 0
          );
        case "countsNode":
          return store.workflow.getNodeTypesOfType(["list"]).length > 0;
        case "keywordExtractionNode":
          return store.workflow.getNodeTypesOfType(["string"]).length > 0;
        default:
          return true;
      }
    });
  };

  const getNodeIcon = (nodeType) => {
    switch (nodeType) {
      case "datasetNode":
        return <CircleStackIcon style={{ width: "18px", height: "18px" }} />;
      case "filterNode":
        return <FunnelIcon style={{ width: "18px", height: "18px" }} />;
      case "connectorNode":
        return <LinkIcon style={{ width: "18px", height: "18px" }} />;
      case "searchNode":
        return (
          <MagnifyingGlassIcon style={{ width: "18px", height: "18px" }} />
        );
      default:
        return <DocumentTextIcon style={{ width: "18px", height: "18px" }} />;
    }
  };

  const renderNodeList = () => {
    return getFilteredActionNodeList().map((node, index) => (
      <Tooltip
        label={
          store.search.datasetTypes[store.search.currentDataset] === "api" &&
          node.nodeType === "connectorNode"
            ? ""
            : node.tooltip
        }
        key={`workflow_node_${index}`}
      >
        <Flex
          width="40px"
          height="40px"
          backgroundColor={
            colorMode === "light" ? "whiteAlpha.500" : "blackAlpha.500"
          }
          borderRadius="8px"
          onDragStart={(event) => onDragStart(event, node.nodeType)}
          draggable={
            !(
              store.search.datasetTypes[store.search.currentDataset] ===
                "api" && node.nodeType === "connectorNode"
            )
          }
          opacity={
            store.search.datasetTypes[store.search.currentDataset] === "api" &&
            node.nodeType === "connectorNode"
              ? 0.3
              : 1
          }
          cursor={
            store.search.datasetTypes[store.search.currentDataset] === "api" &&
            node.nodeType === "connectorNode"
              ? "default"
              : "pointer"
          }
          padding="5px 10px"
          justifyContent="center"
          alignItems="center"
          transition="all 0.1s ease-in-out"
          _hover={
            store.search.datasetTypes[store.search.currentDataset] === "api" &&
            node.nodeType === "connectorNode"
              ? {}
              : {
                  backgroundColor:
                    colorMode === "light" ? "blue.400" : "blue.700",
                  color: colorMode === "light" ? "black" : "white",
                }
          }
          role="group"
        >
          {getNodeIcon(node.nodeType)}
        </Flex>
      </Tooltip>
    ));
  };

  return (
    <HStack
      style={style}
      width="100%"
      height="100%"
      borderRadius="10px"
      overflow="hidden"
      position="relative"
    >
      <Box width="100%" height="100%" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={store.workflow.onConnect}
          onDragOver={onDragOver}
          onInit={onLoad}
          onDrop={onDrop}
          nodesDraggable={true}
          nodesConnectable={true}
          snapToGrid={true}
        >
          <Background gap={12} size={1} style={{ opacity: 0.2 }} />
        </ReactFlow>
      </Box>
      <Box
        position="absolute"
        width="206px"
        backgroundColor="transparent"
        marginLeft="0px"
        display="flex"
        flexDirection="column"
        flexGrow="1"
        zIndex="10"
        id="AdvancedSearchDock"
        style={
          isPanel
            ? { bottom: "15px", borderRadius: "10px", left: "15px" }
            : {
                bottom: "15px",
                borderRadius: "10px",
                left: "50%",
                transform: "translateX(-50%)",
              }
        }
      >
        <Wrap
          height="auto"
          padding="10px 10px"
          backgroundColor={
            colorMode === "light" ? "whiteAlpha.200" : "whiteAlpha.200"
          }
          borderRadius="10px"
          flexGrow="1"
          position="relative"
        >
          {renderNodeList()}
        </Wrap>
      </Box>
    </HStack>
  );
}

AdvancedSearch.propTypes = {
  datasetSelectorDisabled: PropTypes.bool,
  placeholder: PropTypes.string,
  isPanel: PropTypes.bool,
  style: PropTypes.object,
};

const ObservedAdvancedSearch = observer(AdvancedSearch);
export default ObservedAdvancedSearch;
