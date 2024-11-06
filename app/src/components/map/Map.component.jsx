import React, { useState, useEffect, useMemo } from "react";
import { Map } from "react-map-gl";
import DeckGL from "deck.gl";
import { ScatterplotLayer, LineLayer } from "deck.gl";
import { Box } from "@chakra-ui/react";
import CountryContinentSelector from "./CountryContinentSelector.component";
import { getEnv } from "src/utils/general.utils";
import { useStore } from "../../stores/hooks/useStore"; //New2-Import the custom hook to access the store

const MAPBOX_TOKEN = getEnv("VITE_MAPBOX_TOKEN");

export default function MapComponent() {
  const initialViewState = {
    longitude: 15.4395,
    latitude: 47.0707,
    zoom: 1,
    minZoom: 0,
    maxZoom: 20,
    pitch: 0,
    bearing: 0,
  };

  const { graph } = useStore(); //New2- Access graphStore through the root store
  const [viewState, setViewState] = useState(initialViewState);

  //New2- Get nodes from graphStore and prepare them for display
  //New2 Memoize nodes to avoid re-calculation on every render
  const nodes = useMemo(
    () =>
      graph.currentGraphData.nodes.map((node) => ({
        position: [node.longitude, node.latitude],
        size: 1000, // Customize size if needed
        description: node.label || "No description",
        color: [0, 255, 0], // Default green color
      })),
    [graph.currentGraphData.nodes]
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
            : { ...node, color: [0, 255, 0] }
        )
      );
    } else {
      setDisplayNodes(
        displayNodes.map((node) => ({ ...node, color: [0, 255, 0] }))
      );
    }
  };

  const handleSelection = (newViewState) => {
    setViewState(newViewState);
  };

  useEffect(() => {
    //New2- Sync displayNodes with nodes if graph data changes
    setDisplayNodes(nodes);
  }, [nodes]);

  return (
    <>
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
            getRadius: (d) => d.size,
            getFillColor: (d) => d.color,
            pickable: true,
            onHover: handleHover,
          }),
          // maybe lineLayer to connect nodes in the future
        ]}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: "100%", height: "100%" }}
        />
      </DeckGL>
    </>
  );
}
