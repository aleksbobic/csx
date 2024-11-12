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
                node.longitude = baseLongitude + col * 0.04;
                node.latitude = baseLatitude + row * 0.04;
            });
        });
    }

    applyStackLayout(overlappingNodes) {
        overlappingNodes.forEach(group => {
            const baseLongitude = group[0].longitude;
            const baseLatitude = group[0].latitude;
            group.forEach((node, index) => {
                node.longitude = baseLongitude;  // Keep the same longitude to align vertically
                node.latitude = baseLatitude + index * 0.03;  // Adjust latitude increment to stack vertically
            });
        });
    }
}

export default GeoStore;
