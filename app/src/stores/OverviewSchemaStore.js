import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { getSchemaElementPositions } from 'schema.utils';

export class OverviewSchemaStore {
    nodes = [];
    edges = [];

    anchorProperties = [];
    schemaHasLink = true;
    useUploadData = false;
    features = [];
    featureTypes = {};
    anchor = null;
    links = [];
    nodeLabelToID = {};

    updateNodes = nodes => (this.nodes = nodes);
    updateEdges = edges => (this.edges = edges);

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setAnchorProperties = properties => (this.anchorProperties = properties);
    setUseUploadData = val => (this.useUploadData = val);
    setSchemaHasLink = val => (this.schemaHasLink = val);

    getNodeProperties = () => {
        if (this.featureTypes[this.anchor] === 'list') {
            return [];
        }

        return Object.entries(this.featureTypes)
            .filter(
                entry =>
                    entry[0] !== this.anchor &&
                    !['list', 'string'].includes(entry[1])
            )
            .map(entry => entry[0]);
    };

    generateNode = (label, id) => {
        const isLink = label ? this.links.includes(label) : true;
        const isAnchor = label ? label === this.anchor : false;

        return {
            id: `${id}`,
            type: 'overviewSchemaNode',
            position: isLink ? { x: 250, y: 200 } : { x: 5, y: 200 },
            targetPosition: 'top',
            sourcePosition: 'bottom',
            data: {
                label: label,
                isAnchor: isAnchor,
                isLink: isLink,
                position: isLink ? 'both' : 'left',
                features: this.features.filter(
                    feature => !this.links.includes(feature)
                ),
                properties: this.getNodeProperties(),
                addedProperties: this.anchorProperties,
                setAnchor: this.setAnchor,
                addProperty: this.addProperty,
                removeProperty: this.removeProperty,
                addLinkNode: this.addLinkNode,
                anchor: this.anchor,
                setLink: this.setLink,
                removeLink: this.removeLinkNode
            },
            style: {
                background: '#323232',
                color: 'white',
                borderRadius: '8px',
                height: 'auto',
                borderWidth: 0,
                padding: '10px',
                minWidth: 50
            }
        };
    };

    generateLink = linkNodeID => {
        return {
            id: `${-1}${linkNodeID}`,
            source: `${-1}`,
            target: `${linkNodeID}`,
            arrowHeadType: 'none',
            data: {},
            type: 'overviewCustomEdge'
        };
    };

    populateStoreData = (useUploadData = false) => {
        this.setUseUploadData(useUploadData);
        this.resetProperties();

        if (useUploadData) {
            this.features = Object.keys(
                this.store.fileUpload.fileUploadData.defaults
            );
            this.featureTypes = {};
            Object.keys(this.store.fileUpload.fileUploadData.defaults).forEach(
                feature => {
                    this.featureTypes[feature] =
                        this.store.fileUpload.fileUploadData.defaults[
                            feature
                        ].dataType;
                }
            );

            this.anchor = this.store.fileUpload.fileUploadData.anchor;
            this.links = [this.store.fileUpload.fileUploadData.link];
        } else {
            this.features = Object.keys(this.store.search.nodeTypes);
            this.featureTypes = this.store.search.nodeTypes;
            this.anchor = this.store.search.anchor;
            this.links = this.store.search.links;
        }

        this.nodes = this.features
            .filter(node => node === this.anchor || this.links.includes(node))
            .map(node => {
                if (node === this.anchor) {
                    return this.generateNode(node, -1);
                }

                return this.generateNode(node, uuidv4());
            });

        this.setSchemaHasLink(this.nodes.length > 1);

        this.edges = this.nodes
            .filter(node => node.data.isLink)
            .map(node => this.generateLink(node.id));

        this.generateLayout();
    };

    addLinkNode = () => {
        const newNodeId = uuidv4();

        this.store.track.trackEvent(
            'Schema Panel',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `Add new link node ${newNodeId}`
            })
        );

        this.nodes.push(this.generateNode(null, newNodeId));

        this.edges.push(this.generateLink(newNodeId));

        this.generateLayout();
    };

    removeLinkNode = id => {
        this.store.track.trackEvent(
            'Schema Panel',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `Remove link node ${id}`
            })
        );

        this.nodes = this.nodes.filter(node => node.id !== id);

        this.edges = this.edges.filter(edge => edge.id !== `-1${id}`);

        if (this.nodes.length === 1) {
            this.setSchemaHasLink(false);
        }

        this.generateLayout();
    };

    setAnchor = anchor => {
        this.store.track.trackEvent(
            'Schema Panel - Anchor Node',
            'Select Element - Anchor Propertu',
            JSON.stringify({
                type: 'Change selection',
                value: anchor
            })
        );

        this.anchor = anchor;
        if (!this.useUploadData) {
            this.store.search.setAnchor(anchor);
        }

        if (this.featureTypes[anchor] === 'list') {
            this.resetProperties();
        }

        const freeFeatures = this.features.filter(
            feature => feature === this.anchor || !this.links.includes(feature)
        );

        this.nodes = this.nodes.map(entry => {
            if (entry?.data?.isAnchor) {
                entry.data = {
                    ...entry.data,
                    label: anchor,
                    properties: this.getNodeProperties()
                };

                if (this.featureTypes[anchor] === 'list') {
                    entry.data.addedProperties = this.anchorProperties;
                }
            } else {
                entry.data = { ...entry.data, features: freeFeatures };
            }

            entry.data.anchor = this.anchor;
            return entry;
        });
    };

    setLink = (link, nodeId) => {
        this.store.track.trackEvent(
            `Schema Panel - Link Node - ${nodeId}`,
            'Select Element - Link Property',
            JSON.stringify({
                type: 'Change selection',
                value: link
            })
        );

        if (this.links.includes(link)) {
            this.links = this.links.filter(entry => entry !== link);
            if (!this.useUploadData) {
                this.store.search.setLinks(this.links);
            }

            const freeFeatures = this.features.filter(
                feature =>
                    feature === this.anchor || !this.links.includes(feature)
            );

            const overviewLinkNodeId = this.nodes.find(
                entry => entry.data.label === link
            ).id;

            this.nodes = this.nodes
                .filter(entry => entry.id !== overviewLinkNodeId)
                .map(entry => {
                    entry.data = { ...entry.data, features: freeFeatures };
                    return entry;
                });

            if (this.nodes.length === 1) {
                this.setSchemaHasLink(false);
            }

            this.edges = this.edges.filter(
                entry => entry.id !== `${-1}${overviewLinkNodeId}`
            );
        } else {
            this.links.push(link);

            this.setSchemaHasLink(true);

            if (!this.useUploadData) {
                this.store.search.setLinks(this.links);
            }

            const freeFeatures = this.features.filter(
                feature =>
                    feature === this.anchor || !this.links.includes(feature)
            );

            this.nodes = this.nodes.map(entry => {
                if (entry.id === nodeId) {
                    entry.data = { ...entry.data, label: link };
                }

                entry.data = { ...entry.data, features: freeFeatures };

                return entry;
            });
        }

        this.generateLayout();
    };

    getNodeNameFromId = id => {
        return (
            Object.keys(this.nodeLabelToID).filter(
                key => this.nodeLabelToID[key] === id
            )[0] || ''
        );
    };

    resetProperties = () => {
        this.anchorProperties = [];
        this.nodes = this.nodes.map(node => {
            node.data = { ...node.data };
            return node;
        });
    };

    addProperty = property => {
        this.store.track.trackEvent(
            'Schema Panel - Anchor Node',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `Add node property ${property}`
            })
        );

        this.anchorProperties.push(property);
        this.nodes = this.nodes.map(node => {
            node.data = { ...node.data };
            return node;
        });
        this.generateLayout();
    };

    removeProperty = property => {
        this.store.track.trackEvent(
            'Schema Panel - Anchor Node',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `Remove node property ${property}`
            })
        );

        const propIndex = this.anchorProperties.indexOf(property);
        this.anchorProperties.splice(propIndex, 1);
        this.nodes = this.nodes.map(node => {
            node.data = { ...node.data };
            return node;
        });
        this.generateLayout();
    };

    generateLayout = () => {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getSchemaElementPositions(
                this.nodes,
                this.edges,
                this.anchorProperties.length,
                'LR'
            );

        this.nodes = [...layoutedNodes];
        this.edges = [...layoutedEdges];
    };
}
