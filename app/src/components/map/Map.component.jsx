import React, { useState, useEffect, useMemo } from "react";
import { Map } from "react-map-gl";
import DeckGL from "deck.gl";
import { ScatterplotLayer, LineLayer } from "deck.gl";
import { Box, Button, Tooltip, Select } from "@chakra-ui/react";
import CountryContinentSelector from "./CountryContinentSelector.component";
import { getEnv } from "src/utils/general.utils";
import { useStore } from "../../stores/hooks/useStore"; //New2-Import the custom hook to access the store
import "mapbox-gl/dist/mapbox-gl.css";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
const MAPBOX_TOKEN = getEnv("VITE_MAPBOX_TOKEN");

export default function MapComponent() {
  const initialViewState = {
    longitude: 15.4395,
    latitude: 47.0707,
    zoom: 4,
    minZoom: 0,
    maxZoom: 20,
    pitch: 75, // Increase pitch
    bearing: 30, // Rotate the map
  };

  const { graph, geo } = useStore(); //New2- Access graphStore through the root store, New4- Access geoStore through the root store for node positions
  const [viewState, setViewState] = useState(initialViewState);
  const [viewType, setViewType] = useState("overview"); //New3- Track whether we’re in overview or detail view
  const [layoutKey, setLayoutKey] = useState(0); // New4- Track layout changes to force re-render
  const [selectedLayout, setSelectedLayout] = useState("default"); //New4: Updated: Track selected layout

  //New4: Updated: Switch view and reset layout to "default" when switching views
  const toggleView = () => {
    const newViewType = viewType === "overview" ? "detail" : "overview";
    setViewType(newViewType);
    setSelectedLayout("default"); // Updated: Reset to default layout on view switch
    geo.setLayoutType("default"); // Updated: Apply default layout in GeoStore on view switch

    // Pass the view type to CoreStore via setOverviewMode
    graph.store.core.setOverviewMode(newViewType === "overview");
  };

  // new5 - Memoize nodes to avoid re-calculation on every render and highlight overlapping nodes
  // New6: Update node size based on calculated size property in GeoStore
  const nodes = useMemo(() => {
    const groupedNodes = {};
    graph.currentGraphData.nodes.forEach((node) => {
      const key = `${node.latitude},${node.longitude}`;
      if (!groupedNodes[key]) {
        groupedNodes[key] = [];
      }
      groupedNodes[key].push(node);
    });

    return (graph.currentGraphData.nodes || []).map((node) => {
      const key = `${node.latitude},${node.longitude}`;
      const color = groupedNodes[key].length > 1 ? [255, 0, 0] : [0, 255, 0];
      return {
        position: [node.longitude, node.latitude],
        size: node.size, // New6: Use node.size calculated in GeoStore
        description: node.label || "No description",
        color,
      };
    });
  }, [graph.currentGraphData.nodes, viewType, geo.layoutType, layoutKey]); // New4- Add layoutKey to trigger re-render

  //New3 - Memoize links using the updated getLinkCoordinates function
  const links = useMemo(
    () => graph.getLinkCoordinates(),
    [graph.currentGraphData.links, viewType, layoutKey] // New4- Add layoutKey to trigger re-render
  );

  //New2- State to handle hover color changes
  const [displayNodes, setDisplayNodes] = useState(nodes);

  //New2- Update displayNodes on hover
  const handleHover = ({ object }) => {
    if (object) {
      setDisplayNodes(
        displayNodes.map((node) =>
          node.position === object.position
            ? { ...node, color: [128, 0, 128] } // Change color on hover
            : node
        )
      );
    } else {
      setDisplayNodes(nodes); // Reset color on hover out
    }
  };

  const handleSelection = (newViewState) => {
    setViewState(newViewState);
  };

  // New4- Update layout type in geoStore
  const handleLayoutChange = (e) => {
    const newLayoutType = e.target.value;
    setSelectedLayout(newLayoutType);
    geo.setLayoutType(newLayoutType);
    setLayoutKey((prevKey) => prevKey + 1); // Force re-render by updating layoutKey
  };

  useEffect(() => {
    setDisplayNodes(nodes);
  }, [nodes, geo.layoutType, layoutKey]);

  return (
    <Box as={"section"} overflowX={"hidden"}>
      <CountryContinentSelector onSelect={handleSelection} />
      <DeckGL
        initialViewState={viewState}
        controller={true}
        getTooltip={({ object }) =>
          object && `Description: ${object.description}`
        }
        layers={[
          new ScatterplotLayer({
            id: "scatterplot-layer",
            data: displayNodes,
            getPosition: (d) => d.position,
            getRadius: (d) => d.size, // New6: Use dynamic size for each node
            getFillColor: (d) => d.color,
            pickable: true,
            onHover: handleHover,
          }),
          // New3- Add LineLayer to display edges
          new LineLayer({
            id: "link-layer",
            data: links,
            getSourcePosition: (d) => d.sourcePosition,
            getTargetPosition: (d) => d.targetPosition,
            getColor: (d) => d.color || [211, 211, 211],
            getWidth: (d) => d.width || 0.5,
            pickable: false,
          }),
        ]}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: "100%", height: "100%" }}
        />
      </DeckGL>
      {/* New3- Add a button to switch between overview and detail view */}
      <Box
        position="absolute"
        top={"4em"}
        left={"0.5em"}
        zIndex="1"
        overflow={"hidden"}
        display={"flex"}
        flexDir={"row"}
        gap={"0.5em"}
        flexWrap={"wrap"}
        alignItems={"center"}
        justifyContent={"start"}
        width={"15em"}
        height={"auto"}
      >
        <Tooltip
          label={
            viewType === "overview"
              ? "Switch to detail view"
              : "Switch to overview view"
          }
        >
          <Button
            id="switch-view"
            onClick={toggleView}
            colorScheme="purple"
            color={"purple"}
            size={{ base: "sm", md: "md" }}
            aria-label="Switch view"
            // flex={"1"}
          >
            <Box as={FingerPrintIcon} w={6} h={6} />
          </Button>
        </Tooltip>

        {/* New4: Select component to choose layout */}
        <Select
          onChange={handleLayoutChange}
          // defaultValue="default"
          placeholder="Select Layout"
          value={selectedLayout}
          size={{ base: "sm", md: "md" }}
          colorScheme="purple"
          color={"purple.600"}
          focusBorderColor="purple.700"
          borderColor={"purple.400"}
          flex={"1"}
        >
          <option value="default">Default</option>
          <option value="grid">Grid</option>
          <option value="stack">Stack</option>
          <option value="circular">Circular</option>
          <option value="doubleCircle">Double-Circle</option>
          <option value="sunflower">Sunflower</option>
        </Select>
      </Box>
    </Box>
  );
}
