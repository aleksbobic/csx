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
        this.applyNodeSizes();  // new8: Apply node sizes directly from GraphStore
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

    // new8: Function to apply node sizes directly from GraphStore
    // new13: update to be sure that node size is recalculated if it is not valid and make it compatble with graph store
    applyNodeSizes() {
        const nodes = this.store.graph.currentGraphData.nodes;

        if (!nodes || nodes.length === 0) {
            console.warn("No nodes available to apply sizes.");
            return;
        }

        // Ensure node degrees and sizes are calculated before applying sizes
        this.store.graph.calculateNodeDegreesAndSizes();

        // Validate and set sizes
        nodes.forEach(node => {
            if (node.size === undefined || node.size <= 0) {
                node.size = this.store.graph.calculateNodeSize(node.degree || 0);
                // console.log(`geo Node ID: ${node.id}, Degree: ${node.degree}, Size Applied: ${node.size}`);
            }
        });
    }

    applyLayout() {
        // this.store.graph.currentGraphData.nodes = [...nodes];  // New5: Trigger reactivity for UI update
        const nodes = this.store.graph.currentGraphData.nodes;
        if (!nodes || nodes.length === 0) {
            console.warn("No nodes to layout");
            return;
        }

        //new13: Check if degrees or sizes need to be recalculated
        this.applyNodeSizes();

        // new7: Generalized reset logic for any direct transitions between custom layouts
        const nonDefaultLayouts = ["grid", "stack", "circular", "doubleCircle", "sunflower"];
        const requiresReset = nonDefaultLayouts.includes(this.lastAppliedLayout) &&
            nonDefaultLayouts.includes(this.layoutType) &&
            this.lastAppliedLayout !== this.layoutType;

        if (requiresReset) {
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
            else if (this.layoutType === "circular") {
                this.applyCircularLayout(overlappingNodes); // new7: Call the circular layout function if layoutType is circular
            } else if (this.layoutType === "doubleCircle") {  // new7: Double-Circle layout condition
                this.applyDoubleCircleLayout(overlappingNodes); // new7: Call the double-circle layout function
            } else if (this.layoutType === "sunflower") {  // new7: Condition for sunflower layout
                this.applySunflowerPackingLayout(overlappingNodes);  // new7: Call sunflower packing function
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
                const spacing = node.size * 0.00033; // Adjust spacing based on node size

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
    // new7: Circular layout for overlapping nodes
    applyCircularLayout(overlappingNodes) {
        overlappingNodes.forEach(group => {
            const baseLongitude = group[0].longitude;
            const baseLatitude = group[0].latitude;
            const radius = 0.0002 * group[0].size; // new7: Adjust radius based on node size or a fixed value
            const angleStep = (2 * Math.PI) / group.length; // new7: Calculate equal angle spacing around the circle

            group.forEach((node, index) => {
                const angle = index * angleStep;
                node.longitude = baseLongitude + radius * Math.cos(angle); // new7: Position each node on the circle
                node.latitude = baseLatitude + radius * Math.sin(angle);   // new7: Position each node on the circle
            });
        });
    }
    // new7: Updated Double-Circle layout for multiple concentric circles
    applyDoubleCircleLayout(overlappingNodes) {
        overlappingNodes.forEach(group => {
            const baseLongitude = group[0].longitude;
            const baseLatitude = group[0].latitude;

            const numRings = Math.ceil(group.length / 6);  // new7: Estimate number of rings based on node count
            const angleStep = (2 * Math.PI) / 6;           // Fixed angle step per ring
            const initialRadius = 0.0001 * group[0].size;  // Radius for the first (inner) circle

            group.forEach((node, index) => {
                // Determine the ring (inner, outer, next outer, etc.)
                const ringIndex = Math.floor(index / 6);   // new7: Calculate which ring this node belongs to
                const angle = (index % 6) * angleStep;     // Position around the ring

                // Increase the radius for each successive ring
                const radius = initialRadius + ringIndex * 0.0001 * group[0].size;  // new7: Expand radius for outer circles

                node.longitude = baseLongitude + radius * Math.cos(angle);
                node.latitude = baseLatitude + radius * Math.sin(angle);
            });
        });
    }
    // new7: Sunflower packing layout for overlapping nodes
    applySunflowerPackingLayout(overlappingNodes) {
        const goldenAngle = 2.399963;  // Approximately 137.5 degrees in radians, creates optimal spiral

        overlappingNodes.forEach(group => {
            const baseLongitude = group[0].longitude;
            const baseLatitude = group[0].latitude;
            const spacing = 0.00005 * group[0].size; // new7: Adjust spacing factor for radial spread

            group.forEach((node, index) => {
                // Calculate radius and angle for each node
                const radius = spacing * Math.sqrt(index);   // new7: Increase radius based on index
                const angle = index * goldenAngle;           // new7: Spread nodes using the golden angle

                node.longitude = baseLongitude + radius * Math.cos(angle);
                node.latitude = baseLatitude + radius * Math.sin(angle);

                // console.log(`Node ${node.label}: radius=${radius}, angle=${angle}`);
            });
        });
    }







}

export default GeoStore;
