import React from "react";
import { ScatterplotLayer, PathLayer, HeatmapLayer } from "deck.gl";

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
}) => {
  // new9 - Calculate control points for curved links
  const getCurvedPath = (source, target, curvature) => {
    const midPoint = [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2];

    //new9 - Offset the midpoint to create curvature
    const offset = [
      curvature * (target[1] - source[1]),
      -curvature * (target[0] - source[0]),
    ];

    const controlPoint = [midPoint[0] + offset[0], midPoint[1] + offset[1]];

    return [source, controlPoint, target];
  };
  // end getCurvedPath

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
    data: links,
    getPath: (d) =>
      getCurvedPath(d.sourcePosition, d.targetPosition, linkCurvature),
    getColor: (d) => [...d.color.slice(0, 3), linkOpacity * 255],
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
