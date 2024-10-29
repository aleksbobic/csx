import React, { useState } from "react";
import { Map } from "react-map-gl";
import DeckGL from "deck.gl";
import { ScatterplotLayer, LineLayer } from "deck.gl";
import { Box } from "@chakra-ui/react";
import CountryContinentSelector from "./CountryContinentSelector.component";
// import NodeInfo from "./NodeInfo.component";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYWhtYWRzYWRpbiIsImEiOiJjbTJseXBmNmEwaG45MmpxeWFvbTRpb2hzIn0.EBxlL-lKPuB48rO_LharvA";

export default function MapComponent() {
  const initialViewState = {
    longitude: 15.4395,
    latitude: 47.0707,
    zoom: 1, // Zoom level set to 1 to start with the globe visible
    minZoom: 0, // Allow zooming out as much as possible (globe view)
    maxZoom: 20, // Adjust max zoom to limit maximum zoom in
    pitch: 0,
    bearing: 0,
  };

  // sample dtata for the nodes
  const [data, setData] = useState([
    {
      position: [15.4395, 47.0707],
      size: 1000,
      description: "Technology University of Graz",
      color: [0, 255, 0],
    }, // Graz
    {
      position: [16.3738, 48.2082],
      size: 800,
      description: "Vienna - Capital City of Austria",
      color: [0, 255, 0],
    }, // Vienna
    {
      position: [13.0465, 47.8229],
      size: 1200,
      description: "Salzburg - Known for Mozart",
      color: [0, 255, 0],
    }, // Salzburg
    {
      position: [14.2858, 48.3069],
      size: 1000,
      description: "Linz - City by the Danube",
      color: [0, 255, 0],
    }, // Linz
    {
      position: [15.1002, 46.6168],
      size: 900,
      description: "Klagenfurt - Near Lake Wörthersee",
      color: [0, 255, 0],
    }, // Klagenfurt
    {
      position: [8.5417, 47.3769],
      size: 1100,
      description: "Aleks",
      color: [0, 255, 0],
    }, // Zurich (New Node)
  ]);

  // New connection data to connect Zurich to Graz
  const connections = [
    { source: [15.4395, 47.0707], target: [8.5417, 47.3769] }, // Graz to Zurich
  ];

  const [viewState, setViewState] = useState(initialViewState);

  const handleHover = ({ object }) => {
    if (object) {
      const updatedData = data.map((d) =>
        d === object
          ? { ...d, color: [255, 0, 0] }
          : { ...d, color: [0, 255, 0] }
      );
      setData(updatedData);
    } else {
      // Reset colors when not hovering over any object
      setData(data.map((d) => ({ ...d, color: [0, 255, 0] })));
    }
  };

  // Handle country or continent selection from the new component
  const handleSelection = (newViewState) => {
    setViewState(newViewState);
  };

  return (
    <>
      <CountryContinentSelector onSelect={handleSelection} />
      {/* <NodeInfo /> */}

      <DeckGL
        initialViewState={viewState}
        controller={true}
        getTooltip={({ object }) =>
          object && `Description: ${object.description}`
        }
        layers={[
          // ScatterplotLayer for the nodes
          new ScatterplotLayer({
            id: "scatterplot-layer",
            data,
            getPosition: (d) => d.position,
            getRadius: (d) => d.size,
            getFillColor: (d) => d.color,
            pickable: true,
            onHover: handleHover,
          }),
          // Sample lineLayer to connect Zurich and Graz
          new LineLayer({
            id: "line-layer",
            data: connections,
            getSourcePosition: (d) => d.source,
            getTargetPosition: (d) => d.target,
            getColor: [0, 255, 255],
            getWidth: 1,
          }),
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
