import React, { useState, useEffect, useMemo } from "react";
import { Map, Source, Layer } from "react-map-gl";
import DeckGL from "deck.gl";
import { Box } from "@chakra-ui/react";
import CountryContinentSelector from "./CountryContinentSelector.component";
import { getEnv } from "src/utils/general.utils";
import { useStore } from "../../stores/hooks/useStore"; //New2-Import the custom hook to access the store
import "mapbox-gl/dist/mapbox-gl.css";
import NodeInfoComponent from "./NodeInfo.component"; // new9 - Import NodeInfoComponent
import MapRightPanel from "./MapRightPanel.component"; // New9 - Import MapRightPanel component
import LayersComponent from "./MapLayers.component"; // New9- Import LayersComponent
import MapControls from "./MapControls.component"; // New9 - Import MapControls component
import { observer } from "mobx-react"; // new 13 - Import observer from mobx-react to make the component reactive with store changes
import { bundleLinks } from "./utils/linkBundling"; // new 14 - import link bundling function
import LegendBox from "./LegendBox.component"; //new15 - Import LegendBox

const MAPBOX_TOKEN = getEnv("VITE_MAPBOX_TOKEN");

const MapComponent = observer(() => {
  const initialViewState = {
    longitude: 15.4395,
    latitude: 47.0707,
    zoom: 4,
    minZoom: 0,
    maxZoom: 20,
    pitch: 0, //new10 - for 2D view
    bearing: 0, //new10 - for 2D view
  };

  const { graph, geo, mapCluster } = useStore(); //New2- Access graphStore through the root store, New4- Access geoStore through the root store for node positions, New15 - Access mapClusterStore through the root store
  const [viewState, setViewState] = useState(initialViewState);

  const [viewType, setViewType] = useState("overview"); //New3- Track whether we’re in overview or detail view

  const [layoutKey, setLayoutKey] = useState(0); // New4- Track layout changes to force re-render
  const [selectedLayout, setSelectedLayout] = useState("default"); //New4: Updated: Track selected layout

  const [popoverNode, setPopoverNode] = useState(null); // new9 - Track the clicked node for popover
  const [isPopoverOpen, setPopoverOpen] = useState(false); // new9 - Control popover visibility
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 }); // new9 - Track the position of the popover
  const [activeNode, setActiveNode] = useState(null); // New9 - Track the node that was last clicked

  const [nodeOpacity, setNodeOpacity] = useState(1); //New9 - Opacity for nodes
  const [linkWidth, setLinkWidth] = useState(0.5); //New9 -  Width for links
  const [linkOpacity, setLinkOpacity] = useState(1); //New9 -  Opacity for links
  const [linkCurvature, setLinkCurvature] = useState(0); //New9 -  Curvature for links
  const [isRightPanelOpen, setRightPanelOpen] = useState(false); // New9 - State for showing/hiding the right panel
  const [layerKey, setLayerKey] = useState(0); // New9 - state to trigger layer refresh

  const [isHeatmapVisible, setIsHeatmapVisible] = useState(false); // New10 - state for heatmap visibility

  const [isBundlingEnabled, setIsBundlingEnabled] = useState(false); // new11 - State to toggle link bundling
  const [isProcessing, setIsProcessing] = useState(false); // new11 - State to track bundling processing

  const [isClusteringEnabled, setIsClusteringEnabled] = useState(false); // New15 - state for clustering toggle
  const [clusterRadius, setClusterRadius] = useState(mapCluster.clusterRadius); // New15 - state for cluster radius
  const [isLegendVisible, setIsLegendVisible] = useState(false); //new15 - State for legend visibility

  const [filteredData, setFilteredData] = useState(null); // NEW16: State to manage filtered nodes and links
  const [isFiltered, setIsFiltered] = useState(false); // NEW16: Track whether the graph is filtered.

  //New4: Updated: Switch view and reset layout to "default" when switching views
  const toggleView = () => {
    const newViewType = viewType === "overview" ? "detail" : "overview";
    setViewType(newViewType);
    setSelectedLayout("default"); // Updated: Reset to default layout on view switch
    geo.setLayoutType("default"); // Updated: Apply default layout in GeoStore on view switch

    // Pass the view type to CoreStore via setOverviewMode
    graph.store.core.setOverviewMode(newViewType === "overview");
  };

  // New9 - Function to toggle right panel visibility
  const toggleRightPanel = () => setRightPanelOpen(!isRightPanelOpen);

  // New9 - Handlers for opacity, width, and curvature changes
  const handleNodeOpacityChange = (value) => {
    setNodeOpacity(value);
    setLayerKey((prev) => prev + 1); // Increment key to refresh layers
  };

  const handleLinkWidthChange = (value) => {
    setLinkWidth(value);
    setLayerKey((prev) => prev + 1);
  };

  const handleLinkOpacityChange = (value) => {
    setLinkOpacity(value);
    setLayerKey((prev) => prev + 1);
  };

  const handleLinkCurvatureChange = (value) => {
    setLinkCurvature(value);
    setLayerKey((prev) => prev + 1);
  };

  // new10 - Toggle function for heatmap visibility
  const toggleHeatmap = () => setIsHeatmapVisible((prev) => !prev);

  // new11 - Function to toggle link bundling with timeout for optimistic UI
  const handleToggleBundling = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsBundlingEnabled(!isBundlingEnabled);
      setLayerKey((prev) => prev + 1); // Increment key to refresh layers
      setIsProcessing(false);
    }, 0); // Allow immediate UI feedback
  };

  // new5 - Memoize nodes to avoid re-calculation on every render and highlight overlapping nodes
  // New6: Update node size based on calculated size property in GeoStore
  // new16: Memoize nodes to include filtering logic and compatibility with other features
  const nodes = useMemo(() => {
    const groupedNodes = {};
    graph.currentGraphData.nodes.forEach((node) => {
      const key = `${node.latitude},${node.longitude}`;
      if (!groupedNodes[key]) {
        groupedNodes[key] = [];
      }
      groupedNodes[key].push(node);
    });

    // Ensure node sizes are calculated in GeoStore
    graph.calculateNodeDegreesAndSizes();

    // If filteredData is active, return only filtered nodes
    if (filteredData?.nodes) {
      return filteredData.nodes.map((node) => ({
        ...node,
        position: [node.longitude, node.latitude],
        color:
          groupedNodes[`${node.latitude},${node.longitude}`]?.length > 1
            ? [255, 0, 0]
            : [0, 255, 0],
      }));
    }

    // Otherwise, return all nodes
    return (graph.currentGraphData.nodes || []).map((node) => ({
      id: node.id, // new16 - Include node ID for direct connections
      position: [node.longitude, node.latitude],
      size: node.size,
      label: node.label || "No label",
      feature: node.feature || "No feature",
      frequency: node.frequency || 0,
      searchResultCount: node.searchResultCount || 0,
      color:
        groupedNodes[`${node.latitude},${node.longitude}`]?.length > 1
          ? [255, 0, 0]
          : [0, 255, 0],
    }));
  }, [graph.currentGraphData.nodes, filteredData, geo.layoutType, layoutKey]);
  // end of updated code

  //New3 - Memoize links using the updated getLinkCoordinates function
  // new16: Memoize links to include filtered data and bundling logic
  const links = useMemo(() => {
    const rawLinks = graph.getLinkCoordinates(); //new 14 - Get raw link coordinates

    // If filteredData is active, return only filtered links
    if (filteredData?.links) {
      return filteredData.links;
    }

    // Apply bundling if enabled, otherwise return raw links
    return isBundlingEnabled ? bundleLinks(rawLinks) : rawLinks;
  }, [
    graph.currentGraphData.links,
    filteredData,
    isBundlingEnabled,
    layoutKey,
  ]); // New4- Add layoutKey to trigger re-render, new11 - Add isBundlingEnabled to trigger re-render
  // end of updated code

  //New2- State to handle hover color changes
  const [displayNodes, setDisplayNodes] = useState(nodes);

  //New2- Update displayNodes on hover // new9 - update to consider popoverNode
  const handleHover = ({ object }) => {
    if (!object && !popoverNode) {
      setDisplayNodes(nodes); // Reset all colors if no node is hovered and no node is clicked
    } else if (
      object &&
      (!popoverNode || popoverNode.position !== object.position)
    ) {
      // Only update color if hovering over a different node than the clicked one
      setDisplayNodes(
        displayNodes.map((node) =>
          node.position === object.position
            ? { ...node, color: [128, 0, 128] } // Change color on hover
            : node.position === popoverNode?.position
              ? { ...node, color: [128, 0, 128] } // Keep clicked node purple
              : {
                  ...node,
                  color: nodes.find((n) => n.position === node.position).color,
                }
        )
      );
    }
  };

  // new9 - Handle click on a node to show the popover of node details
  const handleClick = ({ object, x, y }) => {
    if (object) {
      // console.log("Node clicked:", object); // Debug log for clicked node
      if (activeNode && activeNode.position === object.position) {
        // Close the popover if clicking the same node again
        setPopoverOpen(false);
        setActiveNode(null); // Reset activeNode to close popover and avoid reopening
        setPopoverNode(null); // Ensure popoverNode is also reset
      } else {
        // Open popover for a newly clicked node
        setActiveNode(object); // Update activeNode to the current node
        setPopoverNode(object); // Set the clicked node for the popover
        setPopoverOpen(true);
        setPopoverPosition({ x, y });

        // Update displayNodes to apply purple color only to the clicked node
        setDisplayNodes(
          displayNodes.map(
            (node) =>
              node.position === object.position
                ? { ...node, color: [128, 0, 128] } // Highlight clicked node
                : {
                    ...node,
                    color: nodes.find((n) => n.position === node.position)
                      .color,
                  } // Reset others to default
          )
        );
      }
    }
  };

  //new9 - Disable tooltip if popover is open
  const getTooltip = ({ object }) => {
    if (isPopoverOpen) return null;
    return object && `Label: ${object.label}`;
  };
  // New9 - function to reset color on popover close
  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setActiveNode(null); // Reset activeNode when popover closes
    setPopoverNode(null);
    setDisplayNodes(nodes); // Reset node colors to default
  };

  // New2- Handle selection of country or continent
  const handleSelection = (newViewState) => {
    setViewState(newViewState);
  };

  // New4- Update layout type in geoStore
  // new16: Adjust layout handling to ensure compatibility with filteredData
  const handleLayoutChange = (e) => {
    const newLayoutType = e.target.value;
    setSelectedLayout(newLayoutType);
    geo.setLayoutType(newLayoutType);
    setFilteredData(null); //new16 - Clear filteredData when changing layouts
    setLayoutKey((prevKey) => prevKey + 1); // Trigger re-render with new layout
  };

  // displayNodes is updated whenever nodes, geo.layoutType, or layoutKey changes
  // new13: Update displayNodes when node sizes change
  useEffect(() => {
    geo.applyNodeSizes(); //new13 - Ensure sizes are recalculated during node refresh
    setDisplayNodes(nodes);
  }, [nodes, geo.layoutType, layoutKey]);

  // new15 - Update clustering when the clustering state changes
  useEffect(() => {
    if (isClusteringEnabled) {
      mapCluster.updateClusteredNodes();
    }
  }, [isClusteringEnabled, graph.currentGraphData]);
  // new15 - Toggle clustering
  const toggleClustering = () => {
    setIsClusteringEnabled(!isClusteringEnabled);
  };
  // new15 - Update cluster radius when it changes
  const handleClusterRadiusChange = (radius) => {
    setClusterRadius(radius);
    mapCluster.setClusterRadius(radius);
    mapCluster.updateClusteredNodes(); // Force the clustered nodes to refresh
    setLayerKey((prev) => prev + 1); // Increment key to refresh layers
  };
  // new15 - Toggle legend visibility and pass node distribution
  const toggleLegend = () => setIsLegendVisible((prev) => !prev);
  // new15 - Get node distribution from mapCluster store
  const nodeDistribution = useMemo(
    () => mapCluster.nodeDistribution,
    [graph.currentGraphData]
  );
  // new15 - Update node distribution when the graph data changes
  useEffect(() => {
    mapCluster.calculateNodeDistribution();
  }, []);
  // new15 - Update node distribution when the graph data changes
  useEffect(() => {
    mapCluster.calculateNodeDistribution();
  }, [viewType, graph.currentGraphData]);

  //new16 - Show Direct Connections for a Node
  const showDirectConnections = (nodeId) => {
    if (!nodeId) {
      console.error("Invalid nodeId provided to showDirectConnections");
      return;
    }
    const result = graph.getConnectedNodesAndLinks(nodeId);
    // console.log("Filtered Links Before Setting:", result.links);

    if (!result || result.nodes.length === 0) {
      console.warn(`No connections found for node: ${nodeId}`);
      setFilteredData(null); // Reset to ensure no invalid filtering persists
      return;
    }
    // console.log(`Found connections for nodeId: ${nodeId}`, result);
    setFilteredData(result); // Set filtered nodes and links
    setLayerKey((prev) => prev + 1); // Force re-render

    setIsFiltered(true); // NEW: Mark as filtered
    setPopoverOpen(false); // NEW: Close the popover
    setPopoverNode(null); // NEW: Reset popover node state
    setActiveNode(null); // NEW: Reset active node
  };

  // Reset View to Default
  const resetView = () => {
    setFilteredData(null); // Clear filtering
    setLayerKey((prev) => prev + 1); // Force re-render

    setIsFiltered(false); // NEW: Reset filtered state
  };

  // //new9 - Update layers whenever any relevant state (opacity, width, curvature) changes
  // new16 - Update layers when filteredData changes
  const layers = useMemo(() => {
    // console.log("Links passed to PathLayer:", links);
    return LayersComponent({
      nodes,
      links,
      nodeOpacity,
      linkWidth,
      linkOpacity,
      linkCurvature,
      displayNodes,
      handleHover,
      handleClick,
      isHeatmapVisible, //new10 - Pass heatmap visibility state
      isBundlingEnabled, // new11 - Pass bundling state
    });
  }, [
    nodes,
    links,
    nodeOpacity,
    linkWidth,
    linkOpacity,
    linkCurvature,
    displayNodes,
    isHeatmapVisible,
    isBundlingEnabled, //new11 - Pass bundling state
    layerKey, //new9 - Add layerKey to force re-render when layers change
    filteredData, // new16 - Add filteredData to trigger re-render when filtering changes
  ]);

  return (
    <Box as={"section"} overflowX={"hidden"}>
      <CountryContinentSelector onSelect={handleSelection} />
      <DeckGL
        viewState={viewState} // Set current viewState here to persist location and zoom
        onViewStateChange={({ viewState }) => setViewState(viewState)} // Track map position changes
        controller={true}
        getTooltip={getTooltip}
        layers={layers} // New9 - Pass layers to DeckGL
        key={layerKey} // New9 - Add key to force re-render when layers change
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: "100%", height: "100%" }}
          projection={"mercator"} // New10- Set projection to "mercator" for 2d view only
        >
          {/*new 15 - Clustering Source and Layers */}
          {isClusteringEnabled && (
            <Source
              id="clusters"
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: mapCluster.clusteredNodes.map((node) => ({
                  type: "Feature",
                  geometry: { type: "Point", coordinates: node.position },
                  properties: node.properties,
                })),
              }}
              cluster={true}
              clusterRadius={mapCluster.clusterRadius}
              clusterMaxZoom={mapCluster.maxZoom}
            />
          )}
          {isClusteringEnabled && (
            <>
              <Layer {...mapCluster.getClusterLayer()} />
              <Layer {...mapCluster.getClusterCountLayer()} />
              <Layer {...mapCluster.getUnclusteredPointLayer()} />
            </>
          )}
        </Map>
      </DeckGL>
      <NodeInfoComponent // new9 - Integrate NodeInfoComponent for popover
        node={popoverNode} // Pass the clicked node to NodeInfoComponent
        isOpen={isPopoverOpen}
        onClose={handlePopoverClose} // Close popover and reset node colors
        position={popoverPosition} // new9 - Pass position to NodeInfoComponent
        showDirectConnections={showDirectConnections} //new16: Pass function to show direct connections
      />
      <MapControls
        viewType={viewType}
        toggleView={toggleView}
        isRightPanelOpen={isRightPanelOpen}
        toggleRightPanel={toggleRightPanel}
        isHeatmapVisible={isHeatmapVisible}
        toggleHeatmap={toggleHeatmap}
        selectedLayout={selectedLayout}
        handleLayoutChange={handleLayoutChange}
        resetView={resetView} //new16: Pass reset function to controls
        isFiltered={isFiltered} // NEW16: Pass isFiltered to controls
      />
      {/*new9 - add a right panel to control node and link properties */}
      {isRightPanelOpen && (
        <MapRightPanel
          nodeOpacityValue={nodeOpacity}
          handleNodeOpacityChange={handleNodeOpacityChange} // Pass handler for node opacity
          linkWidthValue={linkWidth}
          handleLinkWidthChange={handleLinkWidthChange} // Pass handler for link width
          linkOpacityValue={linkOpacity}
          handleLinkOpacityChange={handleLinkOpacityChange} // Pass handler for link opacity
          linkCurvatureValue={linkCurvature}
          handleLinkCurvatureChange={handleLinkCurvatureChange} // Pass handler for link curvature
          isBundlingEnabled={isBundlingEnabled} // new11 - Pass bundling state
          handleToggleBundling={handleToggleBundling} // new11 - Pass handler for toggling bundling
          isClusteringEnabled={isClusteringEnabled} //new15 - Pass clustering state
          handleToggleClustering={toggleClustering} //new15 - Pass clustering handler
          clusterRadius={clusterRadius} //new15 - Pass cluster radius
          handleClusterRadiusChange={handleClusterRadiusChange} //new15 - Pass cluster radius handler
          isVisible={isLegendVisible} //new15 - Pass legend visibility state
          toggleLegend={toggleLegend} //new15 - Pass legend visibility handler
        />
      )}
      {/*new15 - add a legend box to show node distribution */}
      <LegendBox distribution={nodeDistribution} isVisible={isLegendVisible} />
    </Box>
  );
});
export default MapComponent;
