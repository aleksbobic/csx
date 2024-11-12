import { makeAutoObservable } from "mobx";

class GeoStore {
    layoutType = "default";
    lastAppliedLayout = "default";  // New5: Track the last applied layout type
    initialPositionsOverview = null;
    initialPositionsDetail = null;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
        this.setInitialPositions();
        this.calculateNodeDegrees();  // New6: Calculate node degrees and sizes upon initialization
    }

    setInitialPositions() {
        const nodes = this.store.graph.currentGraphData.nodes;
        nodes.forEach(node => {
            if (!node.initialLongitude) node.initialLongitude = node.longitude;
            if (!node.initialLatitude) node.initialLatitude = node.latitude;
        });
    }

    setLayoutType(type) {
        this.layoutType = type;
        this.applyLayout();
        this.lastAppliedLayout = type;  // New5: Update the last applied layout after each layout change
    }

    applyLayout() {
        // this.store.graph.currentGraphData.nodes = [...nodes];  // New5: Trigger reactivity for UI update
        const nodes = this.store.graph.currentGraphData.nodes;
        if (!nodes || nodes.length === 0) {
            console.warn("No nodes to layout");
            return;
        }

        // Check if we’re switching between grid and stack directly
        if ((this.lastAppliedLayout === "grid" && this.layoutType === "stack") ||
            (this.lastAppliedLayout === "stack" && this.layoutType === "grid")) {

            // Temporarily set to default layout
            this.resetToInitialPositions();  // Reset positions
            this.lastAppliedLayout = "default";  // Update last layout to "default"
        }

        // Apply the selected layout after resetting to default
        if (this.layoutType === "default") {
            this.resetToInitialPositions();
        } else {
            const overlappingNodes = this.findOverlappingNodes(nodes);
            if (overlappingNodes.length === 0) {
                console.warn("No overlapping nodes to layout");
                return;
            }

            // Apply the selected layout (grid or stack)
            if (this.layoutType === "grid") {
                this.applyGridLayout(overlappingNodes);
            } else if (this.layoutType === "stack") {
                this.applyStackLayout(overlappingNodes);
            }
        }

        // Update last applied layout and trigger UI reactivity
        this.lastAppliedLayout = this.layoutType;
        this.store.graph.currentGraphData.nodes = [...nodes];
    }

    resetToInitialPositions() {
        const nodes = this.store.graph.currentGraphData.nodes;
        nodes.forEach(node => {
            node.longitude = node.initialLongitude;
            node.latitude = node.initialLatitude;
        });
    }
    // New6: Calculate the degree of each node based on links and adjust node sizes
    calculateNodeDegrees() {
        const nodes = this.store.graph.currentGraphData.nodes;
        const links = this.store.graph.currentGraphData.links;

        // New6: Initialize degrees for each node
        nodes.forEach(node => {
            node.degree = 0;  // Initialize node degree to zero
        });

        // New6: Count the number of connections for each node
        links.forEach(link => {
            if (link.source && link.target) {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);

                if (sourceNode) sourceNode.degree += 1;
                if (targetNode) targetNode.degree += 1;
            }
        });

        // New6: Set size based on the degree of each node
        nodes.forEach(node => {
            node.size = this.calculateNodeSize(node.degree);
        });
    }

    // New6: Calculate the size of a node based on its degree
    calculateNodeSize(degree) {
        const minSize = 5;  // Minimum node size
        const maxSize = 20; // Maximum node size
        const sizeScale = 0.5;  // Scale factor for degree

        // New6: Calculate size based on degree, ensuring it stays within min and max bounds
        return Math.min(maxSize, Math.max(minSize, minSize + degree * sizeScale));
    }

    findOverlappingNodes(nodes) {
        const locationMap = new Map();
        nodes.forEach(node => {
            const locationKey = `${node.latitude},${node.longitude}`;
            if (!locationMap.has(locationKey)) {
                locationMap.set(locationKey, []);
            }
            locationMap.get(locationKey).push(node);
        });
        return Array.from(locationMap.values()).filter(group => group.length > 1);
    }

    applyGridLayout(overlappingNodes) {
        overlappingNodes.forEach(group => {
            const gridSize = Math.ceil(Math.sqrt(group.length));
            const baseLongitude = group[0].longitude;
            const baseLatitude = group[0].latitude;

            group.forEach((node, index) => {
                const row = Math.floor(index / gridSize);
                const col = index % gridSize;
                const spacing = node.size * 0.00009; // Adjust spacing based on node size

                // Calculate position with spacing based on size
                node.longitude = baseLongitude + col * spacing;
                node.latitude = baseLatitude + row * spacing;
            });
        });
    }

    applyStackLayout(overlappingNodes) {
        overlappingNodes.forEach(group => {
            const baseLongitude = group[0].longitude;
            const baseLatitude = group[0].latitude;

            group.forEach((node, index) => {
                const spacing = node.size * 0.00009; // Adjust spacing based on node size

                // Stack vertically with spacing based on size
                node.longitude = baseLongitude;
                node.latitude = baseLatitude + index * spacing;
            });
        });
    }


}

export default GeoStore;
