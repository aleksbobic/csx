import React from "react";
import { ScatterplotLayer, PathLayer, HeatmapLayer } from "deck.gl";
import { getCurvedPath } from "./utils/curvedPath"; // new 12 - import curved path function

const LayersComponent = ({
  nodes = [],
  links = [],
  nodeOpacity,
  linkWidth,
  linkOpacity,
  linkCurvature,
  displayNodes,
  handleHover,
  handleClick,
  isHeatmapVisible, // New10 - prop to control heatmap visibility
  isBundlingEnabled, //new11 - Toggle for link bundling
}) => {
  // Use ScatterplotLayer to render nodes
  const scatterplotLayer = new ScatterplotLayer({
    id: "scatterplot-layer",
    data: displayNodes.length ? displayNodes : nodes,
    getPosition: (d) => d.position,
    getRadius: (d) => d.size,
    getFillColor: (d) => [...d.color.slice(0, 3), nodeOpacity * 255],
    pickable: true,
    onHover: handleHover,
    onClick: handleClick,
  });

  //new9 - Use PathLayer to render links with curvature
  const pathLayer = new PathLayer({
    id: "path-layer",
    data: links, // 14 - changed to links as before
    getPath: (d) => {
      if (!d.sourcePosition || !d.targetPosition) {
        console.warn(`Invalid link detected: ${d.id}`);
        return null;
      }
      return getCurvedPath(
        d.sourcePosition,
        d.targetPosition,
        linkCurvature,
        d.controlPoints
      );
    }, //new11 - Use getCurvedPath to get curved path based on curvature, new16 - warn if invalid link
    getColor: (d) => {
      // Solid gray for non-bundled links
      return isBundlingEnabled
        ? [90, 34, 139, linkOpacity * 255] // Purple for bundled links
        : [169, 169, 169, linkOpacity * 255]; // Gray for regular links
    },
    getWidth: (d) => linkWidth,
    widthUnits: "pixels",
    pickable: false,
  });
  // New10 - Heatmap Layer
  const heatmapLayer = new HeatmapLayer({
    id: "heatmap-layer",
    data: nodes, // Use nodes data to visualize density
    getPosition: (d) => d.position,
    getWeight: (d) => 1, // Set uniform weight for simplicity
    radiusPixels: 50, // can be adjusted as needed
    intensity: 1, // can be adjusted as needed
    threshold: 0.05, // can be adjusted as needed
    visible: isHeatmapVisible, // Visibility controlled by isHeatmapVisible prop
  });

  // new9 - Using .filter(Boolean) ensures that only valid layers are passed, avoiding potential errors.
  return [scatterplotLayer, pathLayer, heatmapLayer].filter(Boolean);
};

export default LayersComponent;
