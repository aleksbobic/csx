import { makeAutoObservable, action } from 'mobx';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import axios from 'axios';

export class GraphStore {
    perspectives = [];
    references = [];
    tableData = [];
    tableColumns = [];

    graphData = {
        meta: {
            graphID: null,
            query: '',
            anchorProperties: [],
            maxDegree: 0
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
        perspectivesInGraph: []
    };

    detailGraphData = {
        meta: {
            graphID: null,
            query: '',
            visible_entries: [],
            maxDegree: 0
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
        perspectivesInGraph: []
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
                maxDegree: 0
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
            perspectivesInGraph: []
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
                maxDegree: 0
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
            perspectivesInGraph: []
        };
        this.store.graphInstance.toggleVisibleComponents(-1);
    };

    generateNodeLabelSprite = (label, size) =>
        new SpriteText(label, 6, 'white').translateY(size + 5);

    generateNodeMaterial = (meshBasicMaterialTemplate, node) => {
        const material = meshBasicMaterialTemplate.clone();

        const currentGraphColorSchemas = Object.keys(
            this.store.graphInstance.nodeColorSchemeColors[
                this.store.core.currentGraph
            ]
        );

        const selectedColorSchemaAttribute =
            this.store.graphInstance.nodeColorScheme[
                this.store.core.currentGraph
            ];

        switch (selectedColorSchemaAttribute) {
            case 'type':
                material.color.set(
                    this.store.graphInstance.nodeColorSchemeColors[
                        this.store.core.currentGraph
                    ]['type'][node.feature]
                );
                break;
            case 'component':
                material.color.set(
                    this.store.graphInstance.nodeColorSchemeColors[
                        this.store.core.currentGraph
                    ]['component'][node.component]
                );
                break;
            case 'community':
                material.color.set(node.color);
                break;
            default:
                if (
                    currentGraphColorSchemas.includes(
                        selectedColorSchemaAttribute
                    )
                ) {
                    material.color.set(
                        this.store.graphInstance.nodeColorSchemeColors[
                            this.store.core.currentGraph
                        ][selectedColorSchemaAttribute][
                            node.properties[selectedColorSchemaAttribute]
                        ]
                    );
                } else {
                    material.color.set('white');
                }
                break;
        }

        return material;
    };

    generatePointObject = (meshTemplate, material, size) => {
        const mesh = meshTemplate.clone();
        mesh.material = material;
        mesh.scale.x = size;
        mesh.scale.y = size;
        mesh.scale.z = size;
        return [mesh, mesh.clone()];
    };

    generateNodeObjects = (nodes, graphType) => {
        const meshBasicMaterialTemplate = new THREE.MeshBasicMaterial({
            color: new THREE.Color('white'),
            side: THREE.DoubleSide
        });

        const geometryTemplate = new THREE.SphereBufferGeometry(1, 4, 4);

        const meshTemplate = new THREE.Mesh(
            geometryTemplate,
            meshBasicMaterialTemplate
        );

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].color = '#cccccc';
            nodes[i].labelSprite = this.generateNodeLabelSprite(
                nodes[i].label,
                nodes[i].size
            );

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

            nodes[i].initialx = nodes[i].x;
            nodes[i].initialy = nodes[i].y;
            nodes[i].initialz = nodes[i].z;

            nodes[i].nodeWithLabel = new THREE.Group();
            nodes[i].nodeWithLabel.add(point[0]);
            nodes[i].nodeWithLabel.add(nodes[i].labelSprite);

            nodes[i].nodeWithoutLabel = new THREE.Group();
            nodes[i].nodeWithoutLabel.add(point[1]);

            if (graphType === 'overview') {
                if (this.graphData.types[nodes[i].feature]) {
                    this.graphData.types[nodes[i].feature]['count'] += 1;
                } else {
                    this.graphData.types[nodes[i].feature] = {
                        count: 1
                    };
                }
            } else {
                if (this.detailGraphData.types[nodes[i].feature]) {
                    this.detailGraphData.types[nodes[i].feature]['count'] += 1;
                } else {
                    this.detailGraphData.types[nodes[i].feature] = {
                        count: 1
                    };
                }
            }
        }

        return nodes;
    };

    setLabelColors = color => {
        for (let i = 0; i < this.graphData.meta.nodeCount; i++) {
            this.graphData.nodes[i].labelSprite.color = color;
        }
    };

    setDetailLabelColors = color => {
        for (let i = 0; i < this.detailGraphData.meta.nodeCount; i++) {
            this.detailGraphData.nodes[i].labelSprite.color = color;
        }
    };

    setLabelTextHeight = textHeight => {
        for (let i = 0; i < this.graphData.meta.nodeCount; i++) {
            this.graphData.nodes[i].labelSprite.textHeight = textHeight;
        }
    };

    setLabelVisibility = visible => {
        for (let i = 0; i < this.graphData.meta.nodeCount; i++) {
            this.graphData.nodes[i].labelSprite.visible = visible;
        }
    };

    setOrphanNodeVisiblity = visible => {
        const data = this.store.core.isOverview
            ? this.graphData
            : this.detailGraphData;

        for (let i = 0; i < data.meta.nodeCount; i++) {
            if (data.nodes[i].neighbours.size === 0) {
                data.nodes[i].visible = visible;
            }
        }
    };

    updateNodeColor = () => {
        const data = this.store.core.isOverview
            ? this.graphData
            : this.detailGraphData;

        const selectedSchema =
            this.store.graphInstance.nodeColorScheme[
                this.store.core.currentGraph
            ];

        switch (selectedSchema) {
            case 'type':
                for (let i = 0; i < data.meta.nodeCount; i++) {
                    data.nodes[i].material.color.set(
                        this.store.graphInstance.nodeColorSchemeColors[
                            this.store.core.currentGraph
                        ]['type'][data.nodes[i].feature]
                    );
                }
                break;
            case 'component':
                for (let i = 0; i < data.meta.nodeCount; i++) {
                    data.nodes[i].material.color.set(
                        this.store.graphInstance.nodeColorSchemeColors[
                            this.store.core.currentGraph
                        ]['component'][data.nodes[i].component]
                    );
                }
                break;
            case 'none':
                for (let i = 0; i < data.meta.nodeCount; i++) {
                    data.nodes[i].material.color.set('white');
                }
                break;
            default:
                for (let i = 0; i < data.meta.nodeCount; i++) {
                    data.nodes[i].material.color.set(
                        this.store.graphInstance.nodeColorSchemeColors[
                            this.store.core.currentGraph
                        ][selectedSchema][
                            data.nodes[i].properties[selectedSchema]
                        ]
                    );
                }
                break;
        }
    };

    updateLinkColor = () => {
        const data = this.store.core.isOverview
            ? this.graphData
            : this.detailGraphData;

        switch (
            this.store.graphInstance.nodeColorScheme[
                this.store.core.currentGraph
            ]
        ) {
            case 'component':
                for (let i = 0; i < data.meta.linkCount; i++) {
                    data.links[i].color =
                        this.store.graphInstance.nodeColorSchemeColors[
                            this.store.core.currentGraph
                        ]['component'][data.links[i].component];
                }
                break;
            default:
                for (let i = 0; i < data.meta.linkCount; i++) {
                    data.links[i].color = 'rgb(255,255,255)';
                    data.links[i].target.material.color.set('white');
                }
                break;
        }

        data.links.push({});
        data.links.pop();
    };

    updatePerspectives = perspectives => {
        this.perspectives = perspectives.map(entry => entry[1]);
    };

    updateReferences = references => {
        this.references = references.map(entry => entry[1]);
    };

    generateNodeKeyValueStore = nodes => {
        const nodeKeyValueStore = {};

        for (let i = 0; i < nodes.length; i++) {
            nodeKeyValueStore[nodes[i].id] = nodes[i];
        }

        return nodeKeyValueStore;
    };

    addNeighbourObjectsToNodes = () => {
        for (let i = 0; i < this.currentGraphData.meta.nodeCount; i++) {
            this.currentGraphData.nodes[i].neighbourObjects = this
                .currentGraphData.nodes[i].neighbours
                ? [...this.currentGraphData.nodes[i].neighbours].map(
                      neighbourId =>
                          this.currentGraphData.nodeObjects[neighbourId]
                  )
                : [];
        }
    };

    selectComponent = componentId => {
        if (this.graphData.nodes) {
            if (!this.graphData.selectedComponents.includes(componentId)) {
                const nodesToSelect = this.graphData.nodes.filter(
                    node => node.component === componentId
                );
                this.selectNode(nodesToSelect);
            } else {
                const nodesToDeselect = this.graphData.nodes.filter(
                    node => node.component === componentId && node.selected
                );

                nodesToDeselect.forEach(node => {
                    const index = this.graphData.selectedNodes.findIndex(
                        n => n.id === node.id
                    );
                    this.deselectNode(node, index);
                });
            }
        }
    };

    updateTableColumns = () => {
        this.tableColumns = this.currentGraphData.perspectivesInGraph.map(
            perspective => {
                return {
                    Header: perspective.toUpperCase(),
                    accessor: perspective
                };
            }
        );
    };

    getSearchGraph = (query, graphType, suuid) => {
        let visibleDimensions = this.store.core.visibleDimensions[graphType];

        let schema = this.store.schema.getServerSchema();

        if (graphType === 'detail') {
            this.resetDetailGraphData();
        } else {
            this.resetGraphData();
        }

        this.graphData.meta.query = query;

        return this.store.search
            .search(query, visibleDimensions, schema, graphType, suuid)
            .then(
                action(response =>
                    this.handleRetrievedGraph(response, graphType, query)
                )
            );
    };

    handleRetrievedGraph = (response, graphType, query) => {
        if (!response['nodes'].length) {
            this.graphData['isEmpty'] = true;
            this.store.search.setSearchIsEmpty(true);
        } else {
            this.store.search.newNodeTypes = response.meta.new_dimensions;
            // console.log(response);
            if (graphType === 'overview') {
                // Handle overview graph data
                this.graphData.meta.query = query;
                this.graphData.meta.dataset = this.store.search.currentDataset;
                this.store.controlPanel.resetNavigationValues();

                this.setSelectedNodes([], 'overview');
                this.resetGraphData();

                this.graphData.tableData = response.meta.table_data;
                this.graphData.activeTableData = response.meta.table_data;

                this.store.graphInstance.generateSchemeColorsFromArray(
                    response.components.map(c => c.id),
                    'component'
                );

                response.meta.anchor_property_values.map(entry =>
                    this.store.graphInstance.generateSchemeColorsFromArray(
                        entry.values,
                        entry.property
                    )
                );

                const nodes = this.generateNodeObjects(
                    response.nodes,
                    'overview'
                );

                this.graphData = {
                    ...this.graphData,
                    links: response.edges.map(edge => {
                        edge.color =
                            this.store.graphInstance.nodeColorSchemeColors[
                                this.store.core.currentGraph
                            ][
                                this.store.graphInstance.nodeColorScheme.overview
                            ][edge.component];
                        return edge;
                    }),
                    nodes,
                    components: response.components,
                    isEmpty: false
                };

                this.graphData.meta = {
                    ...this.graphData.meta,
                    nodeCount: nodes.length,
                    linkCount: response.edges.length,
                    anchorProperties: response.meta.anchor_property_values,
                    maxDegree: response.meta.max_degree
                };

                this.graphData.perspectivesInGraph = response.meta.dimensions;

                this.store.core.setVisibleDimensions(response.meta.dimensions);

                this.tableColumns = this.graphData.perspectivesInGraph.map(
                    perspective => {
                        return {
                            Header: perspective.toUpperCase(),
                            accessor: perspective
                        };
                    }
                );

                this.store.graphInstance.resetSelfCentric();

                this.graphData.nodeObjects = this.generateNodeKeyValueStore(
                    this.graphData.nodes
                );

                this.addNeighbourObjectsToNodes();

                this.store.schema.populateStoreData();
            } else {
                // Handle detail graph data
                this.detailGraphData.meta.query = query;
                this.detailGraphData.meta.dataset =
                    this.store.search.currentDataset;
                this.store.controlPanel.resetNavigationValues();

                this.setSelectedNodes([], 'detail');
                this.resetDetailGraphData();

                this.detailGraphData.meta.visible_entries =
                    response.meta.visible_entries;
                this.detailGraphData.tableData = response.meta.table_data;
                this.detailGraphData.activeTableData = response.meta.table_data;

                this.store.graphInstance.generateSchemeColorsFromArray(
                    [
                        ...Object.keys(this.store.search.nodeTypes),
                        ...Object.keys(this.store.search.newNodeTypes)
                    ],
                    'type'
                );

                this.store.graphInstance.generateSchemeColorsFromArray(
                    response.components.map(c => c.id),
                    'component'
                );

                const nodes = this.generateNodeObjects(
                    response.nodes,
                    'detail'
                );

                this.detailGraphData = {
                    ...this.detailGraphData,
                    links: response.edges.map(edge => {
                        edge.color =
                            this.store.graphInstance.nodeColorSchemeColors[
                                this.store.core.currentGraph
                            ][this.store.graphInstance.nodeColorScheme.detail][
                                edge.component
                            ];
                        return edge;
                    }),
                    nodes,
                    components: response.components,
                    isEmpty: false
                };

                this.detailGraphData.meta = {
                    ...this.detailGraphData.meta,
                    nodeCount: nodes.length,
                    linkCount: response.edges.length,
                    maxDegree: response.meta.max_degree
                };

                this.detailGraphData.perspectivesInGraph =
                    response.meta.dimensions;

                this.store.core.setVisibleDimensions(response.meta.dimensions);

                this.tableColumns =
                    this.detailGraphData.perspectivesInGraph.map(
                        perspective => {
                            return {
                                Header: perspective.toUpperCase(),
                                accessor: perspective
                            };
                        }
                    );

                this.store.graphInstance.resetSelfCentric();

                this.detailGraphData.nodeObjects =
                    this.generateNodeKeyValueStore(this.detailGraphData.nodes);

                this.addNeighbourObjectsToNodes();
            }
        }
    };

    setSelectedNodes = (selectedNodes, graphType) => {
        if (graphType) {
            if (graphType === 'overview') {
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
                        node =>
                            node.id ===
                            this.store.graphInstance.selfCentricOriginNode.id
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

        if (this.store.core.isOverview) {
            const nodeComponent = this.currentGraphData.components.find(
                c => c.id === node.component
            );

            if (nodeComponent) {
                nodeComponent.selectedNodesCount -= 1;

                if (
                    nodeComponent.selectedNodesCount === 0 &&
                    nodeComponent.isSelected
                ) {
                    nodeComponent.isSelected = false;

                    const index =
                        this.currentGraphData.selectedComponents.findIndex(
                            cid => cid === nodeComponent.id
                        );
                    this.currentGraphData.selectedComponents.splice(index, 1);
                }
            }
        }
    };

    selectNode = nodes => {
        if (nodes.constructor !== Array) {
            nodes = [nodes];
        }

        if (this.store.core.isOverview) {
            this.setSelectedNodes([...this.graphData.selectedNodes, ...nodes]);
        } else {
            this.setSelectedNodes([
                ...this.detailGraphData.selectedNodes,
                ...nodes
            ]);
        }

        if (this.store.core.isOverview) {
            for (const node of nodes) {
                if (this.store.graphInstance.forceShouldIgnoreSelected) {
                    node.fx = node.x;
                    node.fy = node.y;
                }

                node.selected = true;

                const nodeComponent = this.graphData.components.find(
                    c => c.id === node.component
                );

                if (nodeComponent) {
                    nodeComponent.selectedNodesCount += 1;

                    if (
                        nodeComponent.selectedNodesCount ===
                            nodeComponent.nodes.length &&
                        !nodeComponent.isSelected
                    ) {
                        nodeComponent.isSelected = true;
                        this.graphData.selectedComponents.push(
                            nodeComponent.id
                        );
                    }
                }
            }
        } else {
            for (const node of nodes) {
                if (this.store.graphInstance.forceShouldIgnoreSelected) {
                    node.fx = node.x;
                    node.fy = node.y;
                }

                node.selected = true;
            }
        }
    };

    toggleNodeSelection = (newNodeID, nodeIndex, removeIfSelected = true) => {
        const newNode = this.currentGraphData.nodes.find(
            node => node.id === newNodeID
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

        data.nodes.push({});
        data.nodes.pop();
    };

    trimNetwork = async () => {
        const graph_data_copy = { ...this.currentGraphData };
        graph_data_copy.nodes = graph_data_copy.nodes
            .filter(node => node.visible)
            .map(node => node.id);

        if (this.store.core.currentGraph === 'detail') {
            this.resetDetailGraphData();
            this.resetGraphData();
        } else {
            this.resetGraphData();
        }

        try {
            const response = await axios.post('graph/trim', {
                nodes: graph_data_copy.nodes,
                user_id: this.store.core.userUuid,
                graph_type: this.store.core.currentGraph
            });

            this.handleRetrievedGraph(
                response.data,
                this.store.core.currentGraph,
                response.data['meta']['query']
            );
        } catch (error) {
            return this.store.core.handleError(error);
        }
    };

    get graphObjectCount() {
        if (
            !this.currentGraphData.meta.nodeCount &&
            !this.currentGraphData.meta.linkCount
        ) {
            return {};
        }

        return {
            nodes: { count: this.currentGraphData.meta.nodeCount },
            edges: { count: this.currentGraphData.meta.linkCount }
        };
    }

    get currentGraphData() {
        return this.store.core.isOverview
            ? this.graphData
            : this.detailGraphData;
    }
}
