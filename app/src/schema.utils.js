import dagre from "dagre";

export const getSchemaElementPositions = (
  nodes,
  edges,
  anchorPropertyCount,
  direction = "TB"
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    let height = node.data.isAnchor ? 98 + anchorPropertyCount * 38 : 41;

    if (
      node.data.isAnchor &&
      node.data.addedProperties.length === node.data.properties.length
    ) {
      height = height - 24;
    }

    let width = node.data.isAnchor ? 224 : 195;

    if (
      node.data.isAnchor &&
      node.data.addedProperties.length === node.data.properties.length
    ) {
      width = width - 39;
    }

    dagreGraph.setNode(node.id, {
      width: width,
      height: height,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    let height = node.data.isAnchor ? 98 + anchorPropertyCount * 38 : 41;

    if (
      node.data.isAnchor &&
      node.data.addedProperties.length === node.data.properties.length
    ) {
      height = height - 24;
    }

    let width = node.data.isAnchor ? 224 : 195;

    if (
      node.data.isAnchor &&
      node.data.addedProperties.length === node.data.properties.length
    ) {
      width = width - 39;
    }

    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export const generateNodePositions = (schema) => {
  const graph = new dagre.graphlib.Graph()
    .setDefaultEdgeLabel(() => ({}))
    .setGraph({
      rankdir: "LR",
      align: "UL",
    });

  schema.forEach((entry) => {
    if (!Object.keys(entry).includes("source")) {
      graph.setNode(entry.id, {
        width: 208,
        height: 32,
        position: {
          x: 0,
          y: 0,
        },
      });
    } else {
      graph.setEdge(entry.source, entry.target);
    }
  });

  dagre.layout(graph);

  return schema.map((entry) => {
    if (!Object.keys(entry).includes("source")) {
      const nodeWithPosition = graph.node(entry.id);
      entry.targetPosition = "top";
      entry.sourcePosition = "bottom";

      entry.position = {
        y: nodeWithPosition.y - 32 / 2,
        x: nodeWithPosition.x - 208 / 2,
      };
    }

    return entry;
  });
};
