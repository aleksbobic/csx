import {
    interpolateRainbow,
    interpolateYlOrRd,
    schemeTableau10
} from 'd3-scale-chromatic';
import { makeAutoObservable } from 'mobx';
import * as THREE from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';

const SELF_CENTRIC_TYPES = {
    DIRECT: 'direct',
    INTERSECTION: 'intersection',
    UNION: 'union',
    ORIGIN_INTERSECTION: 'origin_union',
    ONLY_SELECTED: 'only_selected_nodes',
    SAME_ENTRY: 'same_entry',
    SELECTED_COMPONENT: 'selected_component',
    CHART_FILTER: 'chart_filter',
    DEGREE_FILTER: 'degree_filter',
    NEIGHBOURS: 'node_neighbours'
};

export class GraphInstanceStore {
    graphInstance = null;
    outlinePass;
    forceEngine = false;
    forceCooldownTicks = 0;
    forceCooldownTime = 0;
    isSelfCentric = false;
    selfCentricType = SELF_CENTRIC_TYPES.DIRECT;
    selfCentricOriginNode = null;
    linkVisibility = true;
    orphanNodeVisibility = true;
    nodeColorScheme = { overview: 'component', detail: 'component' };
    nodeColorSchemeColors = { overview: {}, detail: {} };
    forceShouldIgnoreSelected = false;
    visibleComponents = [];
    hoverData = [];

    labels = {
        isVisible: true,
        visibilityDistance: 600,
        labelDistances: {
            600: 'small',
            1500: 'medium',
            2400: 'large',
            3300: 'x large',
            4200: '2x large'
        },
        textHeight: 4.5
    };

    constructor(store) {
        this.store = store;
        makeAutoObservable(this, {}, { deep: true });
    }

    setHoverData = hoverData => (this.hoverData = hoverData);

    setGraphProps = ref => {
        this.graphInstance = ref;
        this.graphInstance.d3ReheatSimulation();

        this.graphInstance.controls().noRotate = true;
        this.graphInstance.controls().mouseButtons = {
            LEFT: 2,
            MIDDLE: 1,
            RIGHT: 0
        };
        this.graphInstance.d3Force('link').distance(() => 300);

        this.outlinePass = new OutlinePass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.graphInstance.scene(),
            this.graphInstance.camera()
        );

        this.outlinePass.edgeStrength = 3;
        this.outlinePass.edgeglow = 0;
        this.outlinePass.edgeThickness = 1;

        this.graphInstance.postProcessingComposer().addPass(this.outlinePass);
    };

    setOutlinePassColor(color) {
        this.outlinePass.hiddenEdgeColor.set(color);
        this.outlinePass.visibleEdgeColor.set(color);
    }

    // make selected nodes and links between them visible
    triggerSelectedNodes = () => {
        const nodeCount = this.store.graph.currentGraphData.nodes.length;
        const linkCount = this.store.graph.currentGraphData.links.length;

        for (let i = 0; i < nodeCount; i++) {
            this.store.graph.currentGraphData.nodes[i].visible =
                this.store.graph.currentGraphData.nodes[i].selected;
        }

        const selectedNodeIds =
            this.store.graph.currentGraphData.selectedNodes.map(
                node => node.id
            );

        // Find links that are connecting selected nodes
        for (let i = 0; i < linkCount; i++) {
            let linkSource =
                this.store.graph.currentGraphData.links[i].source.id;
            let linkTarget =
                this.store.graph.currentGraphData.links[i].target.id;

            this.store.graph.currentGraphData.links[i].visible =
                selectedNodeIds.includes(linkSource) &&
                selectedNodeIds.includes(linkTarget);
        }

        this.filterTabularData();

        this.isSelfCentric = true;
        this.selfCentricType = null;
        this.selfCentricType = SELF_CENTRIC_TYPES.ONLY_SELECTED;
    };

    filterNodesByDegree = (min, max) => {
        const nodeCount = this.store.graph.currentGraphData.nodes.length;
        const linkCount = this.store.graph.currentGraphData.links.length;

        for (let i = 0; i < nodeCount; i++) {
            if (
                this.store.graph.currentGraphData.nodes[i].neighbours.size ===
                    0 &&
                !this.store.graphInstance.orphanNodeVisibility
            ) {
                this.store.graph.currentGraphData.nodes[i].visible = false;
            } else {
                this.store.graph.currentGraphData.nodes[i].visible =
                    this.store.graph.currentGraphData.nodes[i].neighbours
                        .size >= min &&
                    this.store.graph.currentGraphData.nodes[i].neighbours
                        .size <= max;
            }
        }

        const visibleNodeIds = [];

        for (let i = 0; i < nodeCount; i++) {
            if (this.store.graph.currentGraphData.nodes[i].visible) {
                visibleNodeIds.push(
                    this.store.graph.currentGraphData.nodes[i].id
                );
            }
        }

        // Find links that are connecting selected nodes
        for (let i = 0; i < linkCount; i++) {
            let linkSource =
                this.store.graph.currentGraphData.links[i].source.id;
            let linkTarget =
                this.store.graph.currentGraphData.links[i].target.id;

            this.store.graph.currentGraphData.links[i].visible =
                visibleNodeIds.includes(linkSource) &&
                visibleNodeIds.includes(linkTarget);
        }

        this.filterTabularData();

        this.isSelfCentric = true;
        this.selfCentricType = null;
        this.selfCentricType = SELF_CENTRIC_TYPES.DEGREE_FILTER;
    };

    filterNodesById = (origin, neighbourData, level, feature = 'all') => {
        const visibleNodes = [
            origin,
            ...neighbourData
                .slice(0, level + 1)
                .map(data => data.neighbours)
                .flat()
                .filter(node => feature === 'all' || node.feature === feature)
        ];

        const visibleNodeIds = visibleNodes.map(node => node.id);

        const data = this.store.graph.currentGraphData;

        data.nodes.forEach(node => {
            node.visible = visibleNodeIds.includes(node.id);
        });

        const linkCount = data.links.length;

        for (let i = 0; i < linkCount; i++) {
            data.links[i].visible =
                visibleNodeIds.includes(data.links[i].source.id) &&
                visibleNodeIds.includes(data.links[i].target.id);
        }

        if (visibleNodeIds.length > 1) {
            this.zoomToFitByNodeIds(visibleNodeIds);
        } else if (visibleNodeIds.length === 1) {
            this.zoomToFitByNodeId(visibleNodeIds[0]);
        }

        this.filterTabularData();

        this.isSelfCentric = true;
        this.selfCentricType = null;
        this.selfCentricType = SELF_CENTRIC_TYPES.NEIGHBOURS;
    };

    filterTabularData = (only_selected = false) => {
        const data = this.store.graph.currentGraphData;

        this.store.graph.activeTableData = [];
        let visibleNodeEntries;

        if (only_selected) {
            visibleNodeEntries = [
                ...new Set(
                    this.store.graph.currentGraphData.selectedNodes
                        .filter(node => node.visible)
                        .map(node => node.entries)
                        .flat()
                )
            ];
        } else {
            visibleNodeEntries = [
                ...new Set(
                    this.store.graph.currentGraphData.nodes
                        .filter(node => node.visible)
                        .map(node => node.entries)
                        .flat()
                )
            ];
        }

        data.activeTableData = data.tableData.filter(row =>
            visibleNodeEntries.includes(row.entry)
        );
    };

    ignoreSelected = event => {
        this.forceShouldIgnoreSelected = event.target.checked;

        this.store.graph.currentGraphData.selectedNodes.forEach(node => {
            if (node.selected) {
                node.fx = this.forceShouldIgnoreSelected ? node.x : null;
                node.fy = this.forceShouldIgnoreSelected ? node.y : null;
            }
        });
    };

    applyForce = () => {
        this.toggleLinkVisibility(false);
        this.forceCooldownTicks = Infinity;
        this.forceCooldownTime = 3000;
        this.forceEngine = true;
    };

    stopForce = () => {
        this.toggleLinkVisibility(true);
        this.forceCooldownTicks = 0;
        this.forceCooldownTicks = 0;
        this.forceEngine = false;
    };

    addOutlinePassObject(threeObject) {
        const index = this.outlinePass.selectedObjects.findIndex(
            nodeObj => nodeObj.nodeid === threeObject.nodeid
        );

        if (index === -1) {
            this.outlinePass.selectedObjects.push(threeObject);
        } else {
            this.outlinePass.selectedObjects[index] = threeObject;
        }
    }

    removeOutlinePassObject(threeObject) {
        if (threeObject) {
            this.outlinePass.selectedObjects =
                this.outlinePass.selectedObjects.filter(
                    nodeObj => nodeObj.nodeid !== threeObject.nodeid
                );
        }
    }

    zoomToFitByNodeIds = ids => {
        const coordinates = this.store.graph.currentGraphData.nodes
            .filter(node => ids.includes(node.id))
            .map(node => [node.x, node.y]);

        let maxX = coordinates[0][0];
        let minX = coordinates[0][0];
        let maxY = coordinates[0][1];
        let minY = coordinates[0][1];

        coordinates.forEach(coordinate => {
            if (coordinate[0] > maxX) {
                maxX = coordinate[0];
            } else if (coordinate[0] < minX) {
                minX = coordinate[0];
            }

            if (coordinate[1] > maxY) {
                maxY = coordinate[1];
            } else if (coordinate[1] < minY) {
                minY = coordinate[1];
            }
        });

        const cameraX = Math.round((minX + maxX) / 2, 2);
        const cameraY = Math.round((minY + maxY) / 2, 2);

        const xDistance = Math.abs(maxX) + Math.abs(minX);
        const yDistance = Math.abs(maxY) + Math.abs(minY);

        const largestDinstance = xDistance > yDistance ? xDistance : yDistance;

        this.graphInstance.cameraPosition(
            {
                x: cameraX,
                y: cameraY,
                z: largestDinstance + largestDinstance * 0.3
            },
            new THREE.Vector3(cameraX, cameraY, -1),
            0
        );
    };

    zoomToFitByNodeId = (id, cameraDistance = 100) => {
        const node = this.store.graph.currentGraphData.nodes.find(
            node => node.id === id
        );

        this.graphInstance.cameraPosition(
            {
                x: node.x,
                y: node.y,
                z: cameraDistance
            },
            new THREE.Vector3(node.x, node.y, -1),
            0
        );
    };

    zoomToFit = (x = 0, y = 0, z = 2000) => {
        this.graphInstance.cameraPosition(
            { x, y, z },
            new THREE.Vector3(x, y, -1),
            x !== 0 ? 0 : 500
        );
    };

    takeScreenshot = () => {
        const renderer = this.graphInstance.renderer();
        const scene = this.graphInstance.scene();
        const camera = this.graphInstance.camera();

        renderer.render(scene, camera);

        const screenshot = renderer.domElement.toDataURL(
            'image/octet-stream',
            1.0
        );

        const element = document.createElement('a');
        element.setAttribute('href', screenshot);
        element.setAttribute('download', 'cs.png');

        element.click();
    };

    resetSelfCentric = () => {
        const nodeCount = this.store.graph.currentGraphData.nodes.length;
        const linkCount = this.store.graph.currentGraphData.links.length;

        this.selfCentricOriginNode = null;

        if (this.isSelfCentric) {
            for (let i = 0; i < nodeCount; i++) {
                this.store.graph.currentGraphData.nodes[i].visible = true;
                this.store.graph.currentGraphData.nodes[i].visible =
                    !this.store.graph.currentGraphData.nodes[i].neighbours ||
                    this.store.graph.currentGraphData.nodes[i].neighbours
                        .size === 0
                        ? this.orphanNodeVisibility
                        : true;
            }

            for (let i = 0; i < linkCount; i++) {
                this.store.graph.currentGraphData.links[i].visible = true;
            }

            this.isSelfCentric = false;
        }

        this.selfCentricType = null;
        this.filterTabularData();
    };

    triggerSelfCentric = () => {
        const data = this.store.graph.currentGraphData;

        // If self centric origin node is not set then set it
        if (!this.selfCentricOriginNode) {
            this.selfCentricOriginNode = this.store.contextMenu.originNode;
        }
        const originNode = this.selfCentricOriginNode;

        // Select origin node if it's not selected
        if (!originNode.selected) {
            this.store.graph.toggleNodeSelection(originNode.id);
        }

        const nodeCount = data.nodes.length;
        const linkCount = data.links.length;

        // trigger visiblity for nodes that are immediate neighbours of origin node
        for (let i = 0; i < nodeCount; i++) {
            data.nodes[i].visible =
                (originNode.neighbours &&
                    originNode.neighbours.has(data.nodes[i].id)) ||
                data.nodes[i].id === originNode.id;
        }

        // trigger visiblity for links connecting immediate neighbouars with origin node
        for (let i = 0; i < linkCount; i++) {
            data.links[i].visible =
                data.links[i].source.id === originNode.id ||
                data.links[i].target.id === originNode.id;
        }

        this.filterTabularData(true);

        this.isSelfCentric = true;
        this.selfCentricType = SELF_CENTRIC_TYPES.DIRECT;
        this.store.contextMenu.hideContextMenu();
    };

    // Check if node with nodeid fulfills pre-defined requirements for being neighbours with another node(s)
    isNeighbourWith(nodeId, neighbourIds, mutualWithOrigin = false, count) {
        const node = this.store.graph.currentGraphData.nodes.find(
            node => node.id === nodeId
        );

        let neighbourCount = 0;
        const neighbours = Array.from(node.neighbours);

        if (mutualWithOrigin) {
            // Check if node is a neighbour of one of the visible nodes and a neighbouar of the origin node
            return (
                neighbours.some(actualNeighbourId =>
                    neighbourIds.includes(actualNeighbourId)
                ) && neighbours.includes(this.selfCentricOriginNode.id)
            );
        }

        // Check if node has at least a pre-defined number of mutual neighbours
        const minNumberOfNeighbours = count ? count : neighbourIds.length;

        for (let i = 0; i < neighbours.length; i++) {
            if (neighbourIds.includes(neighbours[i])) {
                neighbourCount = neighbourCount + 1;

                if (neighbourCount === minNumberOfNeighbours) {
                    return true;
                }
            }
        }
        return false;
    }

    getMutualNeighboursWithOrigin = selectedNodeIds => {
        const selectedNodeIdsWithoutOrigin = selectedNodeIds.filter(
            nodeId => nodeId !== this.selfCentricOriginNode.id
        );

        return this.store.graph.currentGraphData.selectedNodes.map(node =>
            node.id === this.selfCentricOriginNode.id
                ? []
                : [...node.neighbours].filter(
                      (neighbourId, i, self) =>
                          self.includes(neighbourId) &&
                          !selectedNodeIds.includes(neighbourId) &&
                          this.isNeighbourWith(
                              neighbourId,
                              selectedNodeIdsWithoutOrigin,
                              true
                          )
                  )
        );
    };

    getMutualNeighbours = selectedNodeIds => {
        return this.store.graph.currentGraphData.selectedNodes.map(node => {
            return [...node.neighbours].filter((neighbourId, i, self) => {
                return (
                    self.includes(neighbourId) &&
                    !selectedNodeIds.includes(neighbourId) &&
                    this.isNeighbourWith(neighbourId, selectedNodeIds, false, 2)
                );
            });
        });
    };

    triggerMultiSelfCentric = (
        onlyMutual = false,
        mutualWithOrigin = false
    ) => {
        const selectedNodeIds =
            this.store.graph.currentGraphData.selectedNodes.map(
                node => node.id
            );

        let neighbours;

        // Identify nodes which should stay visible
        if (onlyMutual) {
            // Only nodes which are connected to all selected nodes
            neighbours = mutualWithOrigin
                ? this.getMutualNeighboursWithOrigin(selectedNodeIds)
                : this.getMutualNeighbours(selectedNodeIds);
        } else {
            // Only nodes which are connected to at least one of the selected nodes
            neighbours = this.store.graph.currentGraphData.selectedNodes.map(
                node => [...node.neighbours]
            );
        }

        let visibleNodeIds = [];
        let visibleNodeIdsWithoutMain = [];

        neighbours.forEach(neighbourArray => {
            visibleNodeIds.push(...neighbourArray);
            visibleNodeIdsWithoutMain.push(...neighbourArray);
        });

        visibleNodeIds.push(...selectedNodeIds);
        visibleNodeIds = Array.from(new Set(visibleNodeIds));
        visibleNodeIdsWithoutMain = Array.from(
            new Set(visibleNodeIdsWithoutMain)
        );

        const nodeCount = this.store.graph.currentGraphData.nodes.length;
        const linkCount = this.store.graph.currentGraphData.links.length;

        // Hide nodes not meeting the above criteria
        for (let i = 0; i < nodeCount; i++) {
            this.store.graph.currentGraphData.nodes[i].visible =
                visibleNodeIds.includes(
                    this.store.graph.currentGraphData.nodes[i].id
                );
        }

        // Identify links which should stay visible
        if (onlyMutual) {
            // Only links which are connecting selected nodes
            for (let i = 0; i < linkCount; i++) {
                let linkSource =
                    this.store.graph.currentGraphData.links[i].source.id;
                let linkTarget =
                    this.store.graph.currentGraphData.links[i].target.id;

                let linkInMain = selectedNodeIds.some(nodeId =>
                    [linkSource, linkTarget].includes(nodeId)
                );

                let linkInVisible = visibleNodeIdsWithoutMain.some(nodeId =>
                    [linkSource, linkTarget].includes(nodeId)
                );

                this.store.graph.currentGraphData.links[i].visible =
                    (linkInMain && linkInVisible) ||
                    (selectedNodeIds.includes(linkSource) &&
                        selectedNodeIds.includes(linkTarget));
            }
        } else {
            // Only links which are connecting at least one selected node
            for (let i = 0; i < linkCount; i++) {
                this.store.graph.currentGraphData.links[i].visible =
                    selectedNodeIds.includes(
                        this.store.graph.currentGraphData.links[i].source.id
                    ) ||
                    selectedNodeIds.includes(
                        this.store.graph.currentGraphData.links[i].target.id
                    );
            }
        }

        this.filterTabularData(true);

        this.isSelfCentric = true;
        this.selfCentricType = null;
        this.selfCentricType = onlyMutual
            ? mutualWithOrigin
                ? SELF_CENTRIC_TYPES.ORIGIN_INTERSECTION
                : SELF_CENTRIC_TYPES.INTERSECTION
            : SELF_CENTRIC_TYPES.UNION;
    };

    triggerSameEntry = (withSelectedNodes = false) => {
        // Select all nodes which should be visible
        let visibleNodeIds;
        let nodesWithPotentiallySameEntires;
        let mainEntries;

        if (withSelectedNodes) {
            visibleNodeIds =
                this.store.graph.currentGraphData.selectedNodes.map(
                    node => node.id
                );
            nodesWithPotentiallySameEntires =
                this.store.graph.currentGraphData.selectedNodes
                    .map(node => node.neighbourObjects)
                    .flat();
            mainEntries = this.store.graph.currentGraphData.selectedNodes
                .map(node => node.entries)
                .flat();
        } else {
            visibleNodeIds = [this.selfCentricOriginNode.id];
            nodesWithPotentiallySameEntires = [
                ...this.selfCentricOriginNode.neighbourObjects
            ];
            mainEntries = this.selfCentricOriginNode.entries;
        }

        let i = 0;

        while (i < nodesWithPotentiallySameEntires.length) {
            if (
                nodesWithPotentiallySameEntires[i]['entries'].some(entry =>
                    mainEntries.includes(entry)
                )
            ) {
                visibleNodeIds.push(nodesWithPotentiallySameEntires[i].id);

                for (const entryCandidate of nodesWithPotentiallySameEntires[i]
                    .neighbourObjects) {
                    if (
                        !nodesWithPotentiallySameEntires.find(
                            entry => entry.id === entryCandidate.id
                        )
                    ) {
                        nodesWithPotentiallySameEntires.push(entryCandidate);
                    }
                }
            }

            i += 1;
        }

        const nodeCount = this.store.graph.currentGraphData.nodes.length;
        const linkCount = this.store.graph.currentGraphData.links.length;

        // Hide nodes not meeting the above criteria
        for (let i = 0; i < nodeCount; i++) {
            this.store.graph.currentGraphData.nodes[i].visible =
                visibleNodeIds.includes(
                    this.store.graph.currentGraphData.nodes[i].id
                );
        }

        // Identify links which should stay visible
        for (let i = 0; i < linkCount; i++) {
            this.store.graph.currentGraphData.links[i].visible =
                visibleNodeIds.includes(
                    this.store.graph.currentGraphData.links[i].source.id
                ) &&
                visibleNodeIds.includes(
                    this.store.graph.currentGraphData.links[i].target.id
                );
        }

        this.filterTabularData(true);

        this.isSelfCentric = true;
        this.selfCentricType = null;
        this.selfCentricType = SELF_CENTRIC_TYPES.SAME_ENTRY;
    };

    toggleLinkVisibility = val => {
        this.linkVisibility = val ? val : !this.linkVisibility;
    };

    setNodeColorScheme = val => {
        this.nodeColorScheme[this.store.core.currentGraph] = val;
        this.nodeColorScheme = { ...this.nodeColorScheme };
    };

    generateSchemeColorsFromArray = (values, feature) => {
        const skipfactor =
            values && values.length > 10 ? 1 / values.length : null;

        this.nodeColorSchemeColors[this.store.core.currentGraph][feature] = {};

        for (let i = 0; i < values.length; i++) {
            this.nodeColorSchemeColors[this.store.core.currentGraph][feature][
                values[i]
            ] = skipfactor
                ? interpolateRainbow(i * skipfactor)
                : schemeTableau10[i];
        }
    };

    generateNumericColorSchema = (values, feature) => {
        const min = Math.min(...values);
        const max = Math.max(...values);

        const norm_values = values.map(value => (value - min) / (max - min));

        this.nodeColorSchemeColors[this.store.core.currentGraph][feature] = {};

        if (min === max) {
            for (let i = 0; i < values.length; i++) {
                this.nodeColorSchemeColors[this.store.core.currentGraph][
                    feature
                ][values[i]] = interpolateYlOrRd(1);
            }
        } else {
            for (let i = 0; i < values.length; i++) {
                this.nodeColorSchemeColors[this.store.core.currentGraph][
                    feature
                ][values[i]] = interpolateYlOrRd(norm_values[i]);
            }
        }
    };

    toggleLabelVisibility = () => {
        this.labels.isVisible = !this.labels.isVisible;
        this.store.graph.setLabelVisibility(this.labels.isVisible);
    };

    setOrphanNodeVisiblity = val => {
        this.orphanNodeVisibility = val;
    };

    toggleOrphanNodeVisibility = () => {
        this.setOrphanNodeVisiblity(!this.orphanNodeVisibility);
        this.store.graph.setOrphanNodeVisiblity(this.orphanNodeVisibility);
    };

    changeShowLabelDistance = val => {
        this.labels.visibilityDistance = val;
        this.labels.textHeight = 2 + (4 * val) / 900;
        this.store.graph.setLabelTextHeight(this.labels.textHeight);
    };

    toggleVisibleComponents = componentId => {
        let allVisibleComponents;

        this.store.graph.currentGraphData.selectedNodes.forEach(
            (node, index) => {
                this.store.graph.deselectNode(node, index);
            }
        );

        if (componentId === -1) {
            allVisibleComponents = [];
        } else {
            if (this.visibleComponents.includes(componentId)) {
                allVisibleComponents = this.visibleComponents.filter(
                    cId => cId !== componentId
                );
            } else {
                allVisibleComponents = [...this.visibleComponents, componentId];
            }
        }

        const visibleNodeIds = [];

        const data = this.store.graph.currentGraphData;

        if (componentId === -1) {
            data.activeTableData = data.tableData;
        } else {
            this.store.graph.activeTableData = [];
            const selectedComponents = data.components.filter(component =>
                allVisibleComponents.includes(component['id'])
            );

            const componentEntries = [
                ...new Set(
                    selectedComponents
                        .map(component => component['entries'])
                        .flat()
                )
            ];

            data.activeTableData = data.tableData.filter(row =>
                componentEntries.includes(row.entry)
            );
        }

        data.nodes.forEach(node => {
            if (
                allVisibleComponents.includes(node.component) ||
                allVisibleComponents.length === 0
            ) {
                node.visible = true;
                visibleNodeIds.push(node.id);
            } else {
                node.visible = false;
            }
        });

        const linkCount = data.links.length;

        // Identify links which should stay visible
        for (let i = 0; i < linkCount; i++) {
            data.links[i].visible =
                visibleNodeIds.includes(data.links[i].source.id) &&
                visibleNodeIds.includes(data.links[i].target.id);
        }

        if (visibleNodeIds.length > 1) {
            this.zoomToFitByNodeIds(visibleNodeIds);
        } else if (visibleNodeIds.length === 1) {
            this.zoomToFitByNodeId(visibleNodeIds[0]);
        }

        this.setVisibleComponents(allVisibleComponents);
    };

    setVisibleComponents = value => (this.visibleComponents = value);

    get selectedColorSchema() {
        return this.nodeColorScheme[this.store.core.currentGraph];
    }

    filterNodesWithValue = (property, value) => {
        this.toggleVisibleComponents(-1);
        this.resetSelfCentric();

        const nodeCount = this.store.graph.currentGraphData.nodes.length;
        const linkCount = this.store.graph.currentGraphData.links.length;

        const getNodeProp =
            property.type === 'basic'
                ? this.store.stats.getNodeBasicProp
                : this.store.stats.getNodeAdvancedProp;

        const visibleIds = [];

        for (let i = 0; i < nodeCount; i++) {
            const isVisible =
                getNodeProp(
                    this.store.graph.currentGraphData.nodes[i],
                    property.prop
                ) === value;

            this.store.graph.currentGraphData.nodes[i].visible = isVisible;

            if (isVisible) {
                visibleIds.push(this.store.graph.currentGraphData.nodes[i].id);
            }
        }

        for (let i = 0; i < linkCount; i++) {
            this.store.graph.currentGraphData.links[i].visible =
                visibleIds.includes(
                    this.store.graph.currentGraphData.links[i].source.id
                ) &&
                visibleIds.includes(
                    this.store.graph.currentGraphData.links[i].target.id
                );
        }

        this.selfCentricType = null;
        this.selfCentricType = SELF_CENTRIC_TYPES.CHART_FILTER;

        this.filterTabularData();

        return visibleIds;
    };

    filterEdgesWithValue = (property, value) => {
        this.toggleVisibleComponents(-1);
        this.resetSelfCentric();

        const nodeCount = this.store.graph.currentGraphData.nodes.length;
        const linkCount = this.store.graph.currentGraphData.links.length;

        let visibleIds = [];

        if (property.type === 'basic') {
            for (let i = 0; i < linkCount; i++) {
                let isVisible =
                    this.store.graph.currentGraphData.links[i][
                        property.prop
                    ] === value;
                this.store.graph.currentGraphData.links[i].visible = isVisible;
                if (isVisible) {
                    visibleIds.push(
                        this.store.graph.currentGraphData.links[i].source.id
                    );
                    visibleIds.push(
                        this.store.graph.currentGraphData.links[i].target.id
                    );
                }
            }
        } else {
            for (let i = 0; i < linkCount; i++) {
                let isVisible = this.store.graph.currentGraphData.links[
                    i
                ].connections.find(
                    connection => connection[property.prop] === value
                );

                this.store.graph.currentGraphData.links[i].visible = isVisible;
                if (isVisible) {
                    visibleIds.push(
                        this.store.graph.currentGraphData.links[i].source.id
                    );
                    visibleIds.push(
                        this.store.graph.currentGraphData.links[i].target.id
                    );
                }
            }
        }

        visibleIds = [...new Set(visibleIds)];

        for (let i = 0; i < nodeCount; i++) {
            const isVisible = visibleIds.includes(
                this.store.graph.currentGraphData.nodes[i].id
            );

            this.store.graph.currentGraphData.nodes[i].visible = isVisible;
        }

        this.selfCentricType = null;
        this.selfCentricType = SELF_CENTRIC_TYPES.CHART_FILTER;

        this.filterTabularData();
        return visibleIds;
    };
}
