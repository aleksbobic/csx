// new15: using mapbox for clustering
import { makeAutoObservable, action, autorun } from "mobx";

class MapClusterStore {
    clusterRadius = 50; // Default cluster radius in pixels
    maxZoom = 16; // Maximum zoom level for clustering
    clusteredNodes = []; // Nodes for the cluster layer
    nodeDistribution = []; // Distribution of nodes for the legend


    constructor(rootStore) {
        this.rootStore = rootStore; // Reference to RootStore for accessing GraphStore
        makeAutoObservable(this, {
            setClusterRadius: action,
            setMaxZoom: action,
            updateClusteredNodes: action,
            calculateNodeDistribution: action,
        });

        // Recalculate distribution whenever graph data changes
        autorun(() => {
            if (this.rootStore.graph.currentGraphData) {
                this.calculateNodeDistribution();
            }
        });
    }

    setClusterRadius(radius) {
        this.clusterRadius = radius;
        this.updateClusteredNodes(); // Update clustering whenever radius changes
    }

    setMaxZoom(zoom) {
        this.maxZoom = zoom;
        this.updateClusteredNodes(); // Update clustering whenever maxZoom changes
    }

    updateClusteredNodes() {
        const graphData = this.rootStore.graph.currentGraphData; // Access currentGraphData (overview or detail)
        // const nodes = graphData.nodes || [];
        //  Exclude hidden nodes AND (0,0) nodes
        const nodes = (graphData.nodes || []).filter(
            n => n.visible && !(n.latitude === 0 && n.longitude === 0)
        ); //new20: Modified to hidden nodes


        this.clusteredNodes = nodes.map((node) => ({
            id: node.id,
            position: [node.longitude, node.latitude], // Mapbox requires [lng, lat]
            properties: {
                size: node.size || 5,
                label: node.label || "Unknown",
                degree: node.degree || 0,
            },
        }));
        this.calculateNodeDistribution(); // Recalculate distribution whenever nodes are updated
    }
    // new15 - calculateNodeDistribution
    calculateNodeDistribution() {
        const graphData = this.rootStore.graph.currentGraphData;
        // const nodes = graphData.nodes || [];
        const nodes = (graphData.nodes || []).filter(n => n.visible); // new20: modified to consider hidden nodes


        // Group nodes by continent
        const continentCounts = nodes.reduce((acc, node) => {
            const continent = this.inferContinent(node.latitude, node.longitude);
            if (!acc[continent]) {
                acc[continent] = 0;
            }
            acc[continent]++;
            return acc;
        }, {});

        // Calculate percentages
        const totalNodes = nodes.length;
        this.nodeDistribution = Object.entries(continentCounts).map(
            ([continent, count]) => ({
                continent,
                percentage: totalNodes ? ((count / totalNodes) * 100).toFixed(1) : 0,
            })
        );
    }

    inferContinent(lat, lng) {
        if (lat >= -56 && lat <= 83) { // Between Antarctica and the Arctic
            if (lng >= -30 && lng <= 60) return "Europe";
            if ((lng > 60 && lng <= 180) || (lng >= -180 && lng <= -169)) return "Asia";
            if (lng >= -170 && lng <= -30) return "Americas";
            if (lng >= -20 && lng <= 55 && lat < 38) return "Africa";
            if (lat < 0 && (lng >= 110 && lng <= 180 || lng >= -180 && lng < -150)) return "Oceania";
        }
        if (lat < -56) return "Antarctica";
        return "Unknown";
    }

    getClusterLayer() {
        return {
            id: "cluster-layer",
            type: "circle",
            source: "clusters", // This needs to match the source name used in Mapbox/DeckGL layers
            paint: {
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#51bbd6",
                    100,
                    "#f28cb1",
                    750,
                    "#f1f075",
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    100,
                    30,
                    750,
                    40,
                ],
            },
        };
    }

    getClusterCountLayer() {
        return {
            id: "cluster-count-layer",
            type: "symbol",
            source: "clusters",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count}",
                "text-size": 14,
            },
            paint: {
                "text-color": "#ffffff",
                "text-halo-color": "#000000", // Add a black outline for contrast
                "text-halo-width": 1,
            },
        };
    }

    getUnclusteredPointLayer() {
        return {
            id: "unclustered-point-layer",
            type: "circle",
            source: "clusters",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#11b4da",
                "circle-radius": 5,
            },
        };
    }


}

export default MapClusterStore;
