import { makeAutoObservable } from "mobx";

class GeoStore {
    layoutType = "default"; // Default layout type
    initialPositionsOverview = null; // Separate initial positions for overview
    initialPositionsDetail = null; // Separate initial positions for detail

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setLayoutType(type) {
        this.layoutType = type;
        this.applyLayout();
        this.store.graph.currentGraphData.nodes = [...this.store.graph.currentGraphData.nodes]; // Trigger reactivity 
    }

    applyLayout() {
        const nodes = this.store.graph.currentGraphData.nodes;
        const isOverview = this.store.core.isOverview; // Track if we're in overview or detail view

        // Avoid applying layout if nodes are undefined or empty
        if (!nodes || nodes.length === 0) {
            console.warn("No nodes to layout");
            return;
        }

        // Save initial positions for the current view if not already saved
        if (isOverview && !this.initialPositionsOverview) {
            this.initialPositionsOverview = nodes.map(node => ({
                id: node.id,
                longitude: node.longitude,
                latitude: node.latitude,
            }));
        } else if (!isOverview && !this.initialPositionsDetail) {
            this.initialPositionsDetail = nodes.map(node => ({
                id: node.id,
                longitude: node.longitude,
                latitude: node.latitude,
            }));
        }

        // Reset to initial positions for the current view if layoutType is "default"
        if (this.layoutType === "default") {
            const initialPositions = isOverview
                ? this.initialPositionsOverview
                : this.initialPositionsDetail;

            nodes.forEach(node => {
                const initialPos = initialPositions?.find(pos => pos.id === node.id);
                if (initialPos) {
                    node.longitude = initialPos.longitude;
                    node.latitude = initialPos.latitude;
                }
            });

            this.store.graph.currentGraphData.nodes = [...nodes]; // Trigger reactivity
            return; // Skip further layout adjustment for "default"
        }

        // Apply the layout based on the selected type
        if (this.layoutType === "grid") {
            this.applyGridLayout(nodes);
        } else if (this.layoutType === "stack") {
            this.applyStackLayout(nodes);
        }

        // Trigger reactivity after applying grid or stack layout
        this.store.graph.currentGraphData.nodes = [...nodes];
    }

    applyGridLayout(nodes) {
        const gridSize = Math.ceil(Math.sqrt(nodes.length));
        nodes.forEach((node, index) => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;
            node.longitude = col * 1; // sample offset
            node.latitude = row * 1;  // sample offset
        });
    }

    applyStackLayout(nodes) {
        nodes.forEach((node, index) => {
            node.longitude = 0;  // Fixed longitude
            node.latitude = index * 1;  // Offset each node vertically
        });
    }
}

export default GeoStore;
