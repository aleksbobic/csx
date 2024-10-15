import * as THREE from "three";

import { action, makeAutoObservable } from "mobx";

import SpriteText from "three-spritetext";
import axios from "axios";
import { format } from "date-fns";
import { safeRequest } from "utils/general.utils";

export class GraphStore {
  perspectives = [];
  references = [];
  tableData = [];
  tableColumns = [];
  repeatRetrieval = null;

  graphData = {
    meta: {
      graphID: null,
      query: "",
      anchorProperties: [],
      maxDegree: 0,
      maxEdgeWeight: 0,
    },
    nodes: [],
    links: [],
    overviewNodes: [],
    overviewLinks: [],
    entryNodeIds: {},
    communities: [],
    components: [],
    nodeObjects: {},
    selectedNodes: [],
    selectedComponents: [],
    tableData: [],
    activeTableData: [],
    types: {},
    perspectivesInGraph: [],
  };

  detailGraphData = {
    meta: {
      graphID: null,
      query: "",
      visible_entries: [],
      maxDegree: 0,
      maxEdgeWeight: 0,
    },
    nodes: [],
    links: [],
    overviewNodes: [],
    overviewLinks: [],
    entryNodeIds: {},
    communities: [],
    components: [],
    nodeObjects: {},
    selectedNodes: [],
    selectedComponents: [],
    tableData: [],
    activeTableData: [],
    types: {},
    perspectivesInGraph: [],
  };

  constructor(store) {
    this.store = store;
    makeAutoObservable(this, {}, { deep: true });
  }

  clearGraphId = () => {
    this.graphData.meta.graphID = null;
    this.detailGraphData.meta.graphID = null;
  };

  resetGraphData = () => {
    this.graphData = {
      meta: {
        ...this.graphData.meta,
        references: [],
        nodeCount: 0,
        linkCount: 0,
        anchorProperties: [],
        maxDegree: 0,
        maxEdgeWeight: 0,
      },
      nodes: [],
      links: [],
      overviewNodes: [],
      overviewLinks: [],
      entryNodeIds: {},
      communities: [],
      components: [],
      nodeObjects: {},
      selectedNodes: [],
      selectedComponents: [],
      tableData: [],
      activeTableData: [],
      types: {},
      perspectivesInGraph: [],
    };
    this.store.graphInstance.toggleVisibleComponents(-1);
  };

  resetDetailGraphData = () => {
    this.detailGraphData = {
      meta: {
        ...this.detailGraphData.meta,
        references: [],
        nodeCount: 0,
        linkCount: 0,
        maxDegree: 0,
        maxEdgeWeight: 0,
      },
      nodes: [],
      links: [],
      overviewNodes: [],
      overviewLinks: [],
      entryNodeIds: {},
      communities: [],
      components: [],
      nodeObjects: {},
      selectedNodes: [],
      selectedComponents: [],
      tableData: [],
      activeTableData: [],
      types: {},
      perspectivesInGraph: [],
    };
    this.store.graphInstance.toggleVisibleComponents(-1);
  };

  setRepeatRetrieval = (val) => (this.repeatRetrieval = val);

  runRepeatRetrieval = () => {
    if (this.repeatRetrieval.type === "expand") {
      this.repeatRetrieval.repeatFunc(
        this.repeatRetrieval.nodes,
        this.repeatRetrieval.connector,
        this.repeatRetrieval.preserveContext,
        this.repeatRetrieval.page
      );
    }
  };

  generateNodeLabelSprite = (label, size) =>
    new SpriteText(
      label,
      10,
      this.store.core.colorMode === "light" ? "black" : "white"
    ).translateY(size + 5);

  generateNodeMaterial = (meshBasicMaterialTemplate, node) => {
    const material = meshBasicMaterialTemplate.clone(false);

    const currentGraphColorSchemas = Object.keys(
      this.store.graphInstance.nodeColorSchemeColors[
        this.store.core.currentGraph
      ]
    );

    const selectedColorSchemaAttribute =
      this.store.graphInstance.nodeColorScheme[this.store.core.currentGraph];

    switch (selectedColorSchemaAttribute) {
      case "node type":
        material.color.set(
          this.store.graphInstance.nodeColorSchemeColors[
            this.store.core.currentGraph
          ]["node type"][node.feature]
        );
        break;
      case "degree":
        material.color.set(
          this.store.graphInstance.nodeColorSchemeColors[
            this.store.core.currentGraph
          ]["degree"][node.neighbours.size]
        );
        break;
      case "component":
        const nodeColor =
          this.store.graphInstance.nodeColorSchemeColors[
            this.store.core.currentGraph
          ]["component"][node.component];

        if (nodeColor) {
          material.color.set(nodeColor);
        } else {
          material.color.set(
            this.store.core.colorMode === "light" ? "black" : "white"
          );
        }

        break;
      case "community":
        material.color.set(node.color);
        break;
      default:
        if (currentGraphColorSchemas.includes(selectedColorSchemaAttribute)) {
          material.color.set(
            this.store.graphInstance.nodeColorSchemeColors[
              this.store.core.currentGraph
            ][selectedColorSchemaAttribute][
              node.properties[selectedColorSchemaAttribute]
            ]
          );
        } else {
          material.color.set(
            this.store.core.colorMode === "light" ? "black" : "white"
          );
        }
        break;
    }

    return material;
  };

  generatePointObject = (meshTemplate, material, size) => {
    const mesh = meshTemplate.clone(false);
    mesh.material = material;
    mesh.scale.x = size;
    mesh.scale.y = size;
    mesh.scale.z = size;
    return [mesh, mesh.clone(false), mesh.clone(false)];
  };

  generateNodeObjects = (nodes, graphType) => {
    const meshBasicMaterialTemplate = new THREE.MeshBasicMaterial({
      color: new THREE.Color("white"),
    });

    const geometryTemplate = new THREE.CircleGeometry(1, 16);

    const meshTemplate = new THREE.Mesh(
      geometryTemplate,
      meshBasicMaterialTemplate
    );

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].color = "#cccccc";
      nodes[i].labelSprite = this.generateNodeLabelSprite(
        nodes[i].label,
        nodes[i].size
      );

      nodes[i].originalSize = nodes[i].size;
      nodes[i].neighbours = new Set(nodes[i].neighbours);

      nodes[i].selected = false;

      nodes[i].visible =
        !nodes[i].neighbours || nodes[i].neighbours.size === 0
          ? this.store.graphInstance.orphanNodeVisibility
          : true;
      nodes[i].material = this.generateNodeMaterial(
        meshBasicMaterialTemplate,
        nodes[i]
      );

      const point = this.generatePointObject(
        meshTemplate,
        nodes[i].material,
        nodes[i].size
      );

      if (!nodes[i].x || !nodes[i].y) {
        const angle = Math.floor(Math.random() * 360);
        const radius = Math.floor(Math.random() * 600 - 300);

        nodes[i].x = Math.cos(angle) * radius;
        nodes[i].y = Math.sin(angle) * radius;
      }

      nodes[i].initialx = nodes[i].x;
      nodes[i].initialy = nodes[i].y;
      nodes[i].initialz = nodes[i].z;

      nodes[i].nodeWithLabel = new THREE.Group();
      nodes[i].nodeWithLabel.add(point[0]);
      nodes[i].nodeWithLabel.add(nodes[i].labelSprite);

      nodes[i].nodeWithoutLabel = new THREE.Group();
      nodes[i].nodeWithoutLabel.add(point[1]);
      nodes[i].nodeWithoutLabelSolo = new THREE.Group();
      nodes[i].nodeWithoutLabelSolo.add(point[2]);

      if (graphType === "overview") {
        if (this.graphData.types[nodes[i].feature]) {
          this.graphData.types[nodes[i].feature]["count"] += 1;
        } else {
          this.graphData.types[nodes[i].feature] = {
            count: 1,
          };
        }
      } else {
        if (this.detailGraphData.types[nodes[i].feature]) {
          this.detailGraphData.types[nodes[i].feature]["count"] += 1;
        } else {
          this.detailGraphData.types[nodes[i].feature] = {
            count: 1,
          };
        }
      }
    }

    return nodes;
  };

  setLabelColors = (color) => {
    for (let i = 0; i < this.graphData.meta.nodeCount; i++) {
      this.graphData.nodes[i].labelSprite.color = color;
    }
  };

  setDetailLabelColors = (color) => {
    for (let i = 0; i < this.detailGraphData.meta.nodeCount; i++) {
      this.detailGraphData.nodes[i].labelSprite.color = color;
    }
  };

  setLabelTextHeight = (textHeight) => {
    for (let i = 0; i < this.graphData.meta.nodeCount; i++) {
      this.graphData.nodes[i].labelSprite.textHeight = textHeight;
    }
  };

  setLabelVisibility = (visible) => {
    for (let i = 0; i < this.graphData.meta.nodeCount; i++) {
      this.graphData.nodes[i].labelSprite.visible = visible;
    }
  };

  setOrphanNodeVisiblity = (visible) => {
    const data = this.store.core.isOverview
      ? this.graphData
      : this.detailGraphData;

    for (let i = 0; i < data.meta.nodeCount; i++) {
      if (data.nodes[i].neighbours.size === 0) {
        data.nodes[i].visible = visible;
      }
    }
  };

  updateNodeColor = (colorMode) => {
    const data = this.store.core.isOverview
      ? this.graphData
      : this.detailGraphData;

    const selectedSchema =
      this.store.graphInstance.nodeColorScheme[this.store.core.currentGraph];

    switch (selectedSchema) {
      case "node type":
        for (let i = 0; i < data.meta.nodeCount; i++) {
          data.nodes[i].material.color.set(
            this.store.graphInstance.nodeColorSchemeColors[
              this.store.core.currentGraph
            ]["node type"][data.nodes[i].feature]
          );
        }
        break;
      case "degree":
        for (let i = 0; i < data.meta.nodeCount; i++) {
          data.nodes[i].material.color.set(
            this.store.graphInstance.nodeColorSchemeColors[
              this.store.core.currentGraph
            ]["degree"][data.nodes[i].neighbours.size]
          );
        }
        break;
      case "component":
        for (let i = 0; i < data.meta.nodeCount; i++) {
          const nodeColor =
            this.store.graphInstance.nodeColorSchemeColors[
              this.store.core.currentGraph
            ]["component"][data.nodes[i].component];

          if (nodeColor) {
            data.nodes[i].material.color.set(nodeColor);
          } else {
            data.nodes[i].material.color.set(
              colorMode === "light" ? "black" : "white"
            );
          }
        }
        break;
      case "none":
        for (let i = 0; i < data.meta.nodeCount; i++) {
          data.nodes[i].material.color.set(
            colorMode === "light" ? "black" : "white"
          );
        }
        break;
      default:
        for (let i = 0; i < data.meta.nodeCount; i++) {
          data.nodes[i].material.color.set(
            this.store.graphInstance.nodeColorSchemeColors[
              this.store.core.currentGraph
            ][selectedSchema][data.nodes[i].properties[selectedSchema]]
          );
        }
        break;
    }
  };

  updateLinkColor = (colorMode) => {
    const data = this.store.core.isOverview
      ? this.graphData
      : this.detailGraphData;

    if (
      this.store.graphInstance.edgeColorScheme[this.store.core.currentGraph] ===
      "auto"
    ) {
      switch (
        this.store.graphInstance.nodeColorScheme[this.store.core.currentGraph]
      ) {
        case "component":
          for (let i = 0; i < data.meta.linkCount; i++) {
            data.links[i].color =
              this.store.graphInstance.nodeColorSchemeColors[
                this.store.core.currentGraph
              ]["component"][data.links[i].component];
          }
          break;
        default:
          for (let i = 0; i < data.meta.linkCount; i++) {
            data.links[i].color =
              colorMode === "light" ? "rgb(0,0,0)" : "rgb(255,255,255)";
            data.links[i].target.material.color.set(
              colorMode === "light" ? "black" : "white"
            );
          }
          break;
      }
    } else if (
      this.store.graphInstance.edgeColorScheme[this.store.core.currentGraph] ===
      "weight"
    ) {
      for (let i = 0; i < data.meta.linkCount; i++) {
        data.links[i].color =
          this.store.graphInstance.edgeColorSchemeColors[
            this.store.core.currentGraph
          ]["weight"][data.links[i].weight];
      }
    } else if (
      this.store.graphInstance.edgeColorScheme[this.store.core.currentGraph] ===
      "feature types"
    ) {
      for (let i = 0; i < data.meta.linkCount; i++) {
        data.links[i].color =
          this.store.graphInstance.edgeColorSchemeColors[
            this.store.core.currentGraph
          ]["feature types"][
            data.links[i].connections.reduce((features, connection) => {
              if (!features.includes(connection.feature)) {
                features.push(connection.feature);
              }
              return features;
            }, []).length
          ];
      }
    }

    data.links.push({});
    data.links.pop();
  };

  updatePerspectives = (perspectives) => {
    this.perspectives = perspectives.map((entry) => entry[1]);
  };

  updateReferences = (references) => {
    this.references = references.map((entry) => entry[1]);
  };

  generateNodeKeyValueStore = (nodes) => {
    const nodeKeyValueStore = {};

    for (let i = 0; i < nodes.length; i++) {
      nodeKeyValueStore[nodes[i].id] = nodes[i];
    }

    return nodeKeyValueStore;
  };

  addNeighbourObjectsToNodes = () => {
    for (let i = 0; i < this.currentGraphData.meta.nodeCount; i++) {
      this.currentGraphData.nodes[i].neighbourObjects = this.currentGraphData
        .nodes[i].neighbours
        ? [...this.currentGraphData.nodes[i].neighbours].map(
            (neighbourId) => this.currentGraphData.nodeObjects[neighbourId]
          )
        : [];
    }
  };

  selectComponent = (componentId) => {
    if (this.currentGraphData.nodes) {
      if (this.currentGraphData.selectedComponents.includes(componentId)) {
        const nodesToDeselect = this.currentGraphData.nodes.filter(
          (node) => node.component === componentId && node.selected
        );

        nodesToDeselect.forEach((node) => {
          const index = this.currentGraphData.selectedNodes.findIndex(
            (n) => n.id === node.id
          );
          this.deselectNode(node, index);
        });
      } else {
        const nodesToSelect = this.currentGraphData.nodes.filter(
          (node) => node.component === componentId && !node.selected
        );
        this.selectNode(nodesToSelect);
      }
    }
  };

  updateTableColumns = () => {
    this.tableColumns = this.currentGraphData.perspectivesInGraph.map(
      (perspective) => {
        return {
          Header: perspective.toUpperCase(),
          accessor: perspective,
        };
      }
    );
  };

  modifyStudy = async (graphType) => {
    this.store.core.setDataIsLoading(true);
    const userId = this.store.core.userUuid;
    const studyId = this.store.core.studyUuid;

    const currentStudyHistoryItem =
      this.store.core.studyHistory.length > 0
        ? this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].id
        : "";

    const visibleDimensions =
      this.store.core.visibleDimensions[graphType] || [];
    const schema = this.store.schema.getServerSchema() || [];

    if (graphType === "detail") {
      this.resetDetailGraphData();
    } else {
      this.resetGraphData();
    }

    const params = {
      search_uuid: this.store.search.searchID,
      history_item_id: currentStudyHistoryItem,
      graph_type: graphType,
      graph_schema: schema,
      visible_dimensions: visibleDimensions,
      index: localStorage.getItem("currentDataset"),
      anchor: this.store.search.anchor,
      links: this.store.search.links,
      query: this.store.search.advancedSearchQuery
        ? JSON.stringify(this.store.search.advancedSearchQuery)
        : this.store.search.query,
      action_time: format(new Date(), "H:mm do MMM yyyy OOOO"),
      charts: this.store.stats.charts[this.store.search.currentDataset] || [],
    };

    if (this.store.core.studyHistory.length > 0) {
      params.history_parent_id =
        this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].id;
    }

    if (
      graphType === "detail" &&
      this.store.graph.graphData.selectedComponents.length
    ) {
      const entryArray = this.store.graph.graphData.components
        .filter((component) =>
          this.store.graph.graphData.selectedComponents.includes(component.id)
        )
        .reduce((entries, component) => entries.concat(component.entries), []);

      params.visible_entries = [...new Set(entryArray)];
    } else {
      params.visible_entries = [];
    }

    if (graphType === "overview") {
      params.anchor_properties = this.store.overviewSchema.anchorProperties;
    } else {
      params.anchor_properties = [];
    }

    const { response, error } = await safeRequest(
      axios.post(`studies/${studyId}/history`, params, {
        headers: { user_id: userId },
      })
    );

    if (error) {
      this.store.core.setDataIsLoading(false);
      this.store.core.handleRequestError(error);
      return;
    }

    if (
      !response.data.hasOwnProperty("graph") ||
      response.data?.nodes?.length === 0
    ) {
      this.graphData["isEmpty"] = true;
      this.store.search.setSearchIsEmpty(true);
      this.store.core.setDataIsLoading(false);
    } else {
      this.store.core.setStudyHistory(response.data.history);

      this.store.core.setStudyHistoryItemIndex(
        this.store.core.studyHistory.length - 1
      );

      this.store.core.setStudyQuery();

      const historyGraphType =
        this.store.core.studyHistory[this.store.core.studyHistoryItemIndex]
          .graph_type;

      this.store.core.setCurrentGraph(historyGraphType);

      this.store.history.generateHistoryNodes();

      this.store.workflow.updateNodes([]);
      this.store.workflow.updateEdges([]);

      try {
        this.store.workflow.addNodesFromJSONQuery(
          JSON.parse(this.store.search.query)
        );
      } catch (e) {
        this.store.workflow.addNodesFromQuery(this.store.search.query);
      }

      this.handleRetrievedGraph(
        response.data.graph,
        historyGraphType,
        this.store.search.query
      );
    }
  };

  getStudyFromHistory = async (studyId, historyID) => {
    this.store.core.setDataIsLoading(true);
    const userId = this.store.core.userUuid;

    const { response, error } = await safeRequest(
      axios.get(`studies/${studyId}/history/${historyID}`, {
        headers: { user_id: userId },
      })
    );

    if (error) {
      this.store.core.setDataIsLoading(false);
      this.store.search.setSearchIsEmpty(true);
      this.store.core.handleRequestError(error);
      return;
    }

    this.store.stats.setChartListForDataset(response.data.charts);

    this.store.core.setStudyHistory(response.data.history);

    this.store.core.setStudyHistoryItemIndexById(historyID);

    this.store.core.setStudyQuery();

    this.store.workflow.resetWorkflow();
    this.store.overviewSchema.setAnchorProperties([]);

    const historyGraphType =
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex]
        .graph_type;

    this.store.core.setCurrentGraph(historyGraphType);

    this.store.search.setLinks(
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].links
    );

    this.store.search.anchor =
      this.store.core.studyHistory[
        this.store.core.studyHistoryItemIndex
      ].anchor;
    this.store.search.anchorProperties =
      this.store.core.studyHistory[
        this.store.core.studyHistoryItemIndex
      ].anchor_properties;
    this.store.overviewSchema.setAnchorProperties(
      this.store.search.anchorProperties
    );

    this.store.search.schema =
      this.store.core.studyHistory[
        this.store.core.studyHistoryItemIndex
      ].schema;

    this.store.workflow.updateNodes([]);
    this.store.workflow.updateEdges([]);

    try {
      this.store.workflow.addNodesFromJSONQuery(
        JSON.parse(this.store.search.query)
      );
    } catch (e) {
      this.store.workflow.addNodesFromQuery(this.store.search.query);
    }

    this.store.schema.populateStoreData();
    this.store.overviewSchema.populateStoreData();

    this.store.history.generateHistoryNodes();

    this.handleRetrievedGraph(
      response.data.graph,
      historyGraphType,
      this.store.search.query
    );
  };

  getStudy = async (studyId) => {
    this.store.core.setDataIsLoading(true);
    const userId = this.store.core.userUuid;

    const { response, error } = await safeRequest(
      axios.get(`studies/${studyId}`, {
        headers: { user_id: userId },
      })
    );

    if (error) {
      this.store.core.setDataIsLoading(false);
      this.store.search.setSearchIsEmpty(true);
      this.store.core.handleRequestError(error);
      return;
    }

    if (response.data.empty) {
      this.store.core.setStudyIsEmpty(true);
      return;
    }

    if (response.data.history.length === 0) {
      this.modifyStudy("overview");
      return;
    }

    if (response.data.public) {
      this.store.core.setIsStudyPublic(true);
      this.store.core.setStudyPublicURL(response.data.public_url);
    }

    this.store.core.updateIsStudySaved(true);
    this.store.core.setStudyName(response.data.name);
    this.store.core.setStudyAuthor(response.data.author);
    this.store.core.setStudyDescription(response.data.description);
    this.store.core.setStudyHistory(response.data.history);
    this.store.core.setStudyHistoryItemIndex(
      this.store.core.studyHistory.length - 1
    );
    this.store.core.setStudyQuery();

    this.store.search.useDataset(
      this.store.search.datasets.indexOf(response.data.index)
    );
    this.store.workflow.resetWorkflow();
    this.store.overviewSchema.setAnchorProperties([]);

    const historyGraphType =
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex]
        .graph_type;

    this.store.core.setCurrentGraph(historyGraphType);

    this.store.search.setLinks(
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].links
    );

    this.store.search.anchor =
      this.store.core.studyHistory[
        this.store.core.studyHistoryItemIndex
      ].anchor;
    this.store.search.anchorProperties =
      this.store.core.studyHistory[
        this.store.core.studyHistoryItemIndex
      ].anchor_properties;

    this.store.overviewSchema.setAnchorProperties(
      this.store.search.anchorProperties
    );

    this.store.search.schema =
      this.store.core.studyHistory[
        this.store.core.studyHistoryItemIndex
      ].schema;

    this.store.workflow.updateNodes([]);
    this.store.workflow.updateEdges([]);

    try {
      this.store.workflow.addNodesFromJSONQuery(
        JSON.parse(this.store.search.query)
      );
    } catch (e) {
      this.store.workflow.addNodesFromQuery(this.store.search.query);
    }

    this.store.schema.populateStoreData();
    this.store.overviewSchema.populateStoreData();

    this.store.history.generateHistoryNodes();

    this.handleRetrievedGraph(response.data.graph, historyGraphType, "");
  };

  getSearchGraph = (query, graphType, suuid) => {
    const visibleDimensions = this.store.core.visibleDimensions[graphType];

    const schema = this.store.schema.getServerSchema();

    if (graphType === "detail") {
      this.resetDetailGraphData();
    } else {
      this.resetGraphData();
    }

    this.graphData.meta.query = query;

    return this.store.search
      .search(query, visibleDimensions, schema, graphType, suuid)
      .then(
        action((response) =>
          this.handleRetrievedGraph(response, graphType, query)
        )
      );
  };

  getLinkColor = (edge) => {
    if (this.store.graphInstance.selectedEdgeColorSchema === "auto") {
      return this.store.graphInstance.nodeColorScheme[
        this.store.core.currentGraph
      ] !== "component"
        ? "#ffffff"
        : this.store.graphInstance.nodeColorSchemeColors[
            this.store.core.currentGraph
          ][
            this.store.graphInstance.nodeColorScheme[
              this.store.core.currentGraph
            ]
          ][edge.component];
    }

    if (this.store.graphInstance.selectedEdgeColorSchema === "weight") {
      return this.store.graphInstance.edgeColorSchemeColors[
        this.store.core.currentGraph
      ]["weight"][edge.weight];
    }

    return this.store.graphInstance.edgeColorSchemeColors[
      this.store.core.currentGraph
    ]["feature types"][
      edge.connections.reduce((features, connection) => {
        if (!features.includes(connection.feature)) {
          features.push(connection.feature);
        }
        return features;
      }, []).length
    ];
  };

  handleRetrievedGraph = (response, graphType, query) => {
    this.store.graphInstance.setIsSelfCentric(false);
    this.store.graphInstance.setIsFiltered(false);

    if (!response["nodes"].length) {
      this.graphData["isEmpty"] = true;
      this.store.search.setSearchIsEmpty(true);
    } else {
      this.store.search.newNodeTypes = response.meta.new_dimensions;
      this.store.graphInstance.resetLabelFeatures();

      if (graphType === "overview") {
        // Handle overview graph data
        this.graphData.meta.query = query;
        this.graphData.meta.dataset = this.store.search.currentDataset;
        this.store.controlPanel.resetNavigationValues();

        this.setSelectedNodes([], "overview");
        this.resetGraphData();

        this.graphData.tableData = response.meta.table_data;
        this.graphData.activeTableData = response.meta.table_data;

        this.store.graphInstance.generateSchemeColorsFromArray(
          response.components.map((c) => c.id),
          "component"
        );

        response.meta.anchor_property_values.forEach((entry) => {
          if (
            this.store.search.nodeTypes[entry.property] === "category" ||
            entry.values.length <= 8
          ) {
            this.store.graphInstance.generateSchemeColorsFromArray(
              [
                ...new Set(
                  response.nodes.map((node) => node.properties[entry.property])
                ),
              ],
              entry.property
            );
          } else {
            this.store.graphInstance.generateNumericColorSchema(
              [
                ...new Set(
                  response.nodes.map((node) => node.properties[entry.property])
                ),
              ],
              entry.property
            );
          }
        });

        if (
          !["none", "component", "degree"].includes(
            this.store.graphInstance.nodeColorScheme[
              this.store.core.currentGraph
            ]
          ) &&
          !response.meta.anchor_property_values.find(
            (entry) =>
              entry.property ===
              this.store.graphInstance.nodeColorScheme[
                this.store.core.currentGraph
              ]
          )
        ) {
          this.store.graphInstance.setNodeColorScheme("component");
        }

        this.store.graphInstance.generateNumericColorSchema(
          response.nodes.map((node) => node.neighbours.length),
          "degree"
        );

        this.store.graphInstance.generateNumericColorSchema(
          response.edges.map((edge) => edge.weight),
          "weight",
          "edge"
        );

        this.store.graphInstance.generateNumericColorSchema(
          response.edges.map(
            (edge) =>
              edge.connections.reduce((features, connection) => {
                if (!features.includes(connection.feature)) {
                  features.push(connection.feature);
                }
                return features;
              }, []).length
          ),
          "feature types",
          "edge"
        );

        const nodes = this.generateNodeObjects(response.nodes, "overview");

        this.graphData = {
          ...this.graphData,
          links: response.edges.map((edge) => {
            edge.color = this.getLinkColor(edge);
            return edge;
          }),
          nodes,
          components: response.components,
          isEmpty: false,
        };

        this.graphData.meta = {
          ...this.graphData.meta,
          nodeCount: nodes.length,
          linkCount: response.edges.length,
          anchorProperties: response.meta.anchor_property_values,
          maxDegree: response.meta.max_degree,
          maxEdgeWeight: Math.max(...response.edges.map((edge) => edge.weight)),
        };

        this.graphData.perspectivesInGraph = response.meta.dimensions;

        this.store.core.setVisibleDimensions(response.meta.dimensions);

        this.tableColumns = this.graphData.perspectivesInGraph.map(
          (perspective) => {
            return {
              Header: perspective.toUpperCase(),
              accessor: perspective,
            };
          }
        );

        this.store.graphInstance.resetSelfCentric();

        this.graphData.nodeObjects = this.generateNodeKeyValueStore(
          this.graphData.nodes
        );

        this.addNeighbourObjectsToNodes();

        this.store.overviewSchema.populateStoreData();
      } else {
        // Handle detail graph data
        this.detailGraphData.meta.query = query;
        this.detailGraphData.meta.dataset = this.store.search.currentDataset;
        this.store.controlPanel.resetNavigationValues();

        this.setSelectedNodes([], "detail");
        this.resetDetailGraphData();

        this.detailGraphData.meta.visible_entries =
          response.meta.visible_entries;
        this.detailGraphData.tableData = response.meta.table_data;
        this.detailGraphData.activeTableData = response.meta.table_data;

        this.store.graphInstance.generateSchemeColorsFromArray(
          [
            ...Object.keys(this.store.search.nodeTypes),
            ...Object.keys(this.store.search.newNodeTypes),
          ],
          "node type"
        );

        this.store.graphInstance.generateSchemeColorsFromArray(
          response.components.map((c) => c.id),
          "component"
        );

        this.store.graphInstance.generateNumericColorSchema(
          response.nodes.map((node) => node.neighbours.length),
          "degree"
        );

        this.store.graphInstance.generateNumericColorSchema(
          response.edges.map((edge) => edge.weight),
          "weight",
          "edge"
        );

        this.store.graphInstance.setNodeColorScheme("node type");

        const nodes = this.generateNodeObjects(response.nodes, "detail");

        this.detailGraphData = {
          ...this.detailGraphData,
          links: response.edges.map((edge) => {
            edge.color = this.getLinkColor(edge);
            return edge;
          }),
          nodes,
          components: response.components,
          isEmpty: false,
        };

        this.detailGraphData.meta = {
          ...this.detailGraphData.meta,
          nodeCount: nodes.length,
          linkCount: response.edges.length,
          maxDegree: response.meta.max_degree,
          maxEdgeWeight: Math.max(...response.edges.map((edge) => edge.weight)),
        };

        this.detailGraphData.perspectivesInGraph = response.meta.dimensions;

        this.store.core.setVisibleDimensions(response.meta.dimensions);

        this.tableColumns = this.detailGraphData.perspectivesInGraph.map(
          (perspective) => {
            return {
              Header: perspective.toUpperCase(),
              accessor: perspective,
            };
          }
        );

        this.store.graphInstance.resetSelfCentric();

        this.detailGraphData.nodeObjects = this.generateNodeKeyValueStore(
          this.detailGraphData.nodes
        );

        this.addNeighbourObjectsToNodes();

        this.store.schema.refreshNodeStyles();
      }
      this.store.core.setDataIsLoading(false);
    }
  };

  setSelectedNodes = (selectedNodes, graphType) => {
    if (graphType) {
      if (graphType === "overview") {
        this.graphData.selectedNodes = selectedNodes;
      } else {
        this.detailGraphData.selectedNodes = selectedNodes;
      }
    } else {
      if (this.store.core.isOverview) {
        this.graphData.selectedNodes = selectedNodes;
      } else {
        this.detailGraphData.selectedNodes = selectedNodes;
      }
    }
  };

  deselectNode = (node, nodeIndex) => {
    this.currentGraphData.selectedNodes.splice(nodeIndex, 1);

    this.store.graphInstance.removeOutlinePassObject(node.__threeObj);

    node.selected = false;
    node.fx = null;
    node.fy = null;

    if (
      this.store.graphInstance.isSelfCentric &&
      this.store.graphInstance.selfCentricOriginNode
    ) {
      if (
        !this.currentGraphData.selectedNodes.length ||
        (this.store.graphInstance.selfCentricOriginNode &&
          this.currentGraphData.selectedNodes.findIndex(
            (node) =>
              node.id === this.store.graphInstance.selfCentricOriginNode.id
          ) === -1)
      ) {
        this.store.graphInstance.resetSelfCentric();
      } else if (this.currentGraphData.selectedNodes.length === 1) {
        this.store.graphInstance.triggerSelfCentric(
          this.currentGraphData.selectedNodes[0]
        );
      }
    }

    if (this.currentGraphData.selectedNodes.length === 0) {
      this.store.graphInstance.resetSelfCentric();
    }

    const nodeComponent = this.currentGraphData.components.find(
      (c) => c.id === node.component
    );

    if (nodeComponent) {
      nodeComponent.selectedNodesCount -= 1;

      if (nodeComponent.selectedNodesCount === 0 && nodeComponent.isSelected) {
        nodeComponent.isSelected = false;

        const index = this.currentGraphData.selectedComponents.findIndex(
          (cid) => cid === nodeComponent.id
        );
        this.currentGraphData.selectedComponents.splice(index, 1);
      }
    }
  };

  selectNode = (nodes) => {
    if (nodes.constructor !== Array) {
      nodes = [nodes];
    }

    if (this.store.core.isOverview) {
      this.setSelectedNodes([...this.graphData.selectedNodes, ...nodes]);
    } else {
      this.setSelectedNodes([...this.detailGraphData.selectedNodes, ...nodes]);
    }

    for (const node of nodes) {
      if (this.store.graphInstance.forceShouldIgnoreSelected) {
        node.fx = node.x;
        node.fy = node.y;
      }

      node.selected = true;

      const nodeComponent = this.currentGraphData.components.find(
        (c) => c.id === node.component
      );

      if (nodeComponent) {
        nodeComponent.selectedNodesCount += 1;

        if (
          nodeComponent.selectedNodesCount === nodeComponent.nodes.length &&
          !nodeComponent.isSelected
        ) {
          nodeComponent.isSelected = true;
          this.currentGraphData.selectedComponents.push(nodeComponent.id);
        }
      }
    }
  };

  toggleNodeSelection = (newNodeID, nodeIndex, removeIfSelected = true) => {
    const newNode = this.currentGraphData.nodes.find(
      (node) => node.id === newNodeID
    );

    const isSelected = newNode.selected;

    if (isSelected && removeIfSelected) {
      // Node is already selected so unselect it
      this.deselectNode(newNode, nodeIndex);
    } else if (!isSelected) {
      // Node is not selected so select it
      this.selectNode(newNode);
    }
  };

  resetNodesPositions = () => {
    const data = this.currentGraphData;

    for (let i = 0; i < data.meta.nodeCount; i++) {
      data.nodes[i].x = data.nodes[i].initialx;
      data.nodes[i].y = data.nodes[i].initialy;
      data.nodes[i].z = data.nodes[i].initialz;
    }

    data.nodes = [...data.nodes];
  };

  removeInverseSelection = () => {
    this.removeSelection(null, true);
  };

  removeSelection = async (originNode, inverse) => {
    this.store.core.setDataIsLoading(true);
    this.store.core.setDataModificationMessage(null);

    let removedNodeEntries;

    if (originNode) {
      removedNodeEntries = originNode.entries;
    } else {
      if (inverse) {
        const notSelectedEntries = this.store.graph.currentGraphData.nodes
          .filter((node) => !node.selected)
          .map((node) => node.entries)
          .flat();

        const selectedEntries = this.store.graph.currentGraphData.selectedNodes
          .map((node) => node.entries)
          .flat();

        removedNodeEntries = notSelectedEntries.filter(
          (entry) => !selectedEntries.includes(entry)
        );
      } else {
        removedNodeEntries = this.store.graph.currentGraphData.selectedNodes
          .map((node) => node.entries)
          .flat();
      }
    }

    const graph_data_copy = { ...this.currentGraphData };
    graph_data_copy.nodes = graph_data_copy.nodes
      .filter((node) => {
        if (node.entries.length === 1) {
          return !removedNodeEntries.includes(node.entries[0]);
        }

        return !node.entries.some((entry) =>
          removedNodeEntries.includes(entry)
        );
      })
      .map((node) => node.id);

    if (graph_data_copy.nodes.length > 0) {
      if (this.store.core.currentGraph === "detail") {
        this.resetDetailGraphData();
        this.resetGraphData();
      } else {
        this.resetGraphData();
      }

      const historyItemId =
        this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].id;

      const params = {
        nodes: graph_data_copy.nodes,
        delete_type: "remove",
        action_time: format(new Date(), "H:mm do MMM yyyy OOOO"),
        graph_type: this.store.core.currentGraph,
        history_parent_id:
          this.store.core.studyHistory.length > 0 &&
          this.store.core.studyHistory[this.store.core.studyHistoryItemIndex]
            .id,
        charts: this.store.stats.charts[this.store.search.currentDataset] || [],
      };

      const { response, error } = await safeRequest(
        axios.put(
          `studies/${this.store.core.studyUuid}/history/${historyItemId}/nodes/delete`,
          params,
          {
            headers: { user_id: this.store.core.userUuid },
          }
        )
      );

      if (error) {
        this.store.core.setDataIsLoading(false);
        this.store.core.handleRequestError(error);
        return;
      }

      this.store.core.setStudyHistory(response.data.history);

      this.store.core.setStudyHistoryItemIndex(
        this.store.core.studyHistory.length - 1
      );
      this.store.core.setStudyQuery();

      const historyGraphType =
        this.store.core.studyHistory[this.store.core.studyHistoryItemIndex]
          .graph_type;

      this.store.core.setCurrentGraph(historyGraphType);

      this.store.history.generateHistoryNodes();

      this.handleRetrievedGraph(
        response.data.graph,
        historyGraphType,
        this.store.search.query
      );

      this.store.history.generateHistoryNodes();

      if (response.data.entry_delta === 0) {
        this.store.core.setDataModificationMessage(
          "No search results removed."
        );
      } else if (response.data.entry_delta === 1) {
        this.store.core.setDataModificationMessage("1 search result removed.");
      } else {
        this.store.core.setDataModificationMessage(
          `${response.data.entry_delta} search results removed.`
        );
      }
    }
  };

  trimNetwork = async () => {
    this.store.core.setDataIsLoading(true);
    this.store.core.setDataModificationMessage(null);
    const graph_data_copy = { ...this.currentGraphData };
    graph_data_copy.nodes = graph_data_copy.nodes
      .filter((node) => node.visible)
      .map((node) => node.id);

    if (this.store.core.currentGraph === "detail") {
      this.resetDetailGraphData();
      this.resetGraphData();
    } else {
      this.resetGraphData();
    }

    const historyItemId =
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].id;

    const params = {
      nodes: graph_data_copy.nodes,
      delete_type: "trim",
      action_time: format(new Date(), "H:mm do MMM yyyy OOOO"),
      graph_type: this.store.core.currentGraph,
      history_parent_id:
        this.store.core.studyHistory.length > 0 &&
        this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].id,
      charts: this.store.stats.charts[this.store.search.currentDataset] || [],
    };

    const { response, error } = await safeRequest(
      axios.put(
        `studies/${this.store.core.studyUuid}/history/${historyItemId}/nodes/delete`,
        params,
        {
          headers: { user_id: this.store.core.userUuid },
        }
      )
    );

    if (error) {
      this.store.core.setDataIsLoading(false);
      this.store.core.handleRequestError(error);
      return;
    }

    this.store.core.setStudyHistory(response.data.history);

    this.store.core.setStudyHistoryItemIndex(
      this.store.core.studyHistory.length - 1
    );
    this.store.core.setStudyQuery();

    const historyGraphType =
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex]
        .graph_type;

    this.store.core.setCurrentGraph(historyGraphType);

    this.store.history.generateHistoryNodes();

    this.handleRetrievedGraph(
      response.data.graph,
      historyGraphType,
      this.store.search.query
    );

    this.store.history.generateHistoryNodes();

    if (response.data.entry_delta === 0) {
      this.store.core.setDataModificationMessage("No search results removed.");
    } else if (response.data.entry_delta === 1) {
      this.store.core.setDataModificationMessage("1 search result removed.");
    } else {
      this.store.core.setDataModificationMessage(
        `${response.data.entry_delta} search results removed.`
      );
    }
  };

  expandNetwork = async (
    nodes,
    connector = null,
    preserveContext = false,
    page = null
  ) => {
    this.store.core.setDataIsLoading(true);
    this.store.core.setDataModificationMessage(null);

    if (this.store.core.currentGraph === "detail") {
      this.resetDetailGraphData();
      this.resetGraphData();
    } else {
      this.resetGraphData();
    }

    const anchor_properties =
      this.store.core.currentGraph === "overview"
        ? this.store.overviewSchema.anchorProperties
        : [];
    let visible_entries;

    if (
      this.store.core.currentGraph === "detail" &&
      this.store.graph.graphData.selectedComponents.length
    ) {
      const entryArray = this.store.graph.graphData.components
        .filter((component) =>
          this.store.graph.graphData.selectedComponents.includes(component.id)
        )
        .reduce((entries, component) => entries.concat(component.entries), []);

      visible_entries = [...new Set(entryArray)];
    } else {
      visible_entries = [];
    }

    const historyItemId =
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].id;

    const params = {
      values: {
        connector: connector,
        nodes: nodes.map((node) => {
          return {
            value: node.label,
            feature: node.feature,
            entry: node.entries[0],
          };
        }),
      },
      page: page,
      graph_type: this.store.core.currentGraph,
      anchor: this.store.search.anchor,
      links: this.store.search.links,
      visible_entries: visible_entries,
      anchor_properties: anchor_properties,
      action_time: format(new Date(), "H:mm do MMM yyyy OOOO"),
      preserve_context: preserveContext,
      history_parent_id:
        this.store.core.studyHistory.length > 0 &&
        this.store.core.studyHistory[this.store.core.studyHistoryItemIndex].id,
      charts: this.store.stats.charts[this.store.search.currentDataset] || [],
    };

    const { response, error } = await safeRequest(
      axios.put(
        `studies/${this.store.core.studyUuid}/history/${historyItemId}/nodes/expand`,
        params,
        {
          headers: { user_id: this.store.core.userUuid },
        }
      )
    );

    if (error) {
      this.store.core.setDataIsLoading(false);
      this.store.core.handleRequestError(error);
      return;
    }

    if (
      response["data"]["pages"] &&
      response["data"]["pages"] > 1 &&
      (!page || (page < 50 && page < response["data"]["pages"]))
    ) {
      this.setRepeatRetrieval({
        nodes: nodes,
        connector: connector,
        preserveContext: preserveContext,
        page: page ? page + 1 : 2,
        type: "expand",
        repeatFunc: this.expandNetwork,
      });
    } else {
      this.setRepeatRetrieval(null);
    }

    this.store.core.setStudyHistory(response.data.history);

    this.store.core.setStudyHistoryItemIndex(
      this.store.core.studyHistory.length - 1
    );
    this.store.core.setStudyQuery();

    const historyGraphType =
      this.store.core.studyHistory[this.store.core.studyHistoryItemIndex]
        .graph_type;

    this.store.core.setCurrentGraph(historyGraphType);

    this.store.history.generateHistoryNodes();

    this.handleRetrievedGraph(
      response.data.graph,
      historyGraphType,
      this.store.search.query
    );

    this.store.history.generateHistoryNodes();

    if (response.data.entry_delta === 0) {
      this.store.core.setDataModificationMessage(
        "No new search results added."
      );
    } else if (response.data.entry_delta === 1) {
      this.store.core.setDataModificationMessage("1 new search result added.");
    } else {
      this.store.core.setDataModificationMessage(
        `${response.data.entry_delta} new search results added.`
      );
    }
  };

  getMaxPropValue = (property) => {
    return this.currentGraphData.nodes.reduce((maxValue, node) => {
      return node.properties[property] > maxValue
        ? node.properties[property]
        : maxValue;
    }, 0);
  };

  get graphObjectCount() {
    if (
      !this.currentGraphData.meta.nodeCount &&
      !this.currentGraphData.meta.linkCount
    ) {
      return {};
    }

    return {
      nodes: {
        count: this.currentGraphData.meta.nodeCount,
        label: "nodes",
      },
      edges: {
        count: this.currentGraphData.meta.linkCount,
        label: "edges",
      },
      components: {
        count: this.currentGraphData.components.length,
        label: "components",
      },
      entries: {
        count: this.currentGraphData.tableData.length,
        label: "entries",
      },
      maxDegree: {
        count: this.currentGraphData.meta.maxDegree,
        label: "max degree",
      },
    };
  }

  get graphVisibleObjectCount() {
    if (
      !this.currentGraphData.meta.nodeCount &&
      !this.currentGraphData.meta.linkCount
    ) {
      return {};
    }

    const visibleNodes = this.currentGraphData.nodes.filter(
      (node) => node.visible
    );

    return {
      nodes: {
        count: visibleNodes.length,
        label: "nodes",
      },
      edges: {
        count: this.currentGraphData.links.filter((link) => link.visible)
          .length,
        label: "edges",
      },
      entries: {
        count: visibleNodes.map((node) => node.entries).flat().length,
        label: "entries",
      },
      maxDegree: {
        count: visibleNodes.reduce((maxDegree, node) => {
          if (node.neighbours.size > maxDegree) {
            return node.neighbours.size;
          }
          return maxDegree;
        }, 0),
        label: "max degree",
      },
    };
  }

  get graphSelectedObjectCount() {
    return {
      nodes: {
        count: this.currentGraphData.selectedNodes.length,
        label: "selected nodes",
      },
      components: {
        count: this.currentGraphData.selectedComponents.length,
        label: "selected components",
      },
      entries: {
        count: new Set(
          this.currentGraphData.selectedNodes.map((node) => node.entries).flat()
        ).size,
        label: "selected entries",
      },
      maxDegree: {
        count: this.currentGraphData.selectedNodes.reduce((maxDegree, node) => {
          if (node.neighbours.size > maxDegree) {
            return node.neighbours.size;
          }
          return maxDegree;
        }, 0),
        label: "max degree of selected nodes",
      },
    };
  }

  get currentGraphData() {
    return this.store.core.isOverview ? this.graphData : this.detailGraphData;
  }
}
