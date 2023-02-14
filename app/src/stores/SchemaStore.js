import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { generateNodePositions, getSchemaElementPositions } from 'schema.utils';

export class SchemaStore {
    edgeRelationshipTypes = ['1:1', '1:M', 'M:N', 'M:1'];
    data = [];
    overviewData = [];

    nodes = [];
    edges = [];
    overviewNodes = [];
    overviewEdges = [];

    overviewDataNodeProperties = [];
    overviewHasLink = true;

    colors = {
        link: '#4da344',
        anchor: '#323232',
        normal: '#323232'
    };

    shortRelToRel = {
        '1:1': 'oneToOne',
        '1:M': 'oneToMany',
        'M:N': 'manyToMany',
        'M:1': 'manyToOne'
    };

    nameToId = {};

    updateNodes = nodes => (this.nodes = nodes);
    updateEdges = edges => (this.edges = edges);
    updateOverviewNodes = nodes => (this.overviewNodes = nodes);
    updateOverviewEdges = edges => (this.overviewEdges = edges);

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    resetOverviewNodeProperties = () => (this.overviewDataNodeProperties = []);

    toggleRelationship = (id, possibleRelationships) => {
        const edge = this.edges.find(edge => edge.id === id);

        const currentRelIndex = possibleRelationships.indexOf(
            edge.data.relationship
        );

        if (currentRelIndex < possibleRelationships.length - 1) {
            edge.data.relationship = possibleRelationships[currentRelIndex + 1];
        } else {
            edge.data.relationship = possibleRelationships[0];
        }

        this.store.track.trackEvent(
            'Schema Panel',
            `Edge - ${id}`,
            JSON.stringify({
                type: 'Click',
                value: `Change relationship to ${edge.data.relationship}`
            })
        );

        this.edges = [...this.edges];
        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
    };

    getServerSchema = () => {
        return this.edges.map(edge => {
            const source = this.nodes.find(node => node.id === edge.source).data
                .label;

            const target = this.nodes.find(node => node.id === edge.target).data
                .label;

            let serverRelationship = this.shortRelToRel[edge.data.relationship];

            return {
                src: source,
                dest: target,
                relationship: serverRelationship
            };
        });
    };

    schemaContainsLinks = schema =>
        schema.some(entry => Object.keys(entry).includes('source'));

    getOverviewNodeProperties = () => {
        if (this.store.search.nodeTypes[this.store.search.anchor] === 'list') {
            return [];
        }

        return Object.entries(this.store.search.nodeTypes)
            .filter(
                entry =>
                    entry[0] !== this.store.search.anchor &&
                    !['list', 'string'].includes(entry[1])
            )
            .map(entry => entry[0]);
    };

    generateSchemaNode = label => {
        const isLink = this.store.search.links.includes(label);
        const isAnchor = label === this.store.search.anchor;
        const id = uuidv4();
        this.nameToId[label] = id;

        return {
            id: `${id}`,
            type: 'schemaNode',
            position: { x: 0, y: 0 },
            targetPosition: 'top',
            sourcePosition: 'bottom',
            data: {
                label: label,
                isAnchor: isAnchor,
                setAnchor: this.setAnchor,
                isLink: isLink,
                setLink: this.setLink
            },
            style: {
                background: this.colors.normal,
                color: 'white',
                borderRadius: '8px',
                height: 'auto',
                borderWidth: 0,
                padding: '10px',
                minWidth: 50
            }
        };
    };

    generateOverviewSchemaNode = (label, id) => {
        const isLink = label ? this.store.search.links.includes(label) : true;
        const isAnchor = label ? label === this.store.search.anchor : false;

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
                features: Object.keys(this.store.search.nodeTypes).filter(
                    feature => !this.store.search.links.includes(feature)
                ),
                properties: this.getOverviewNodeProperties(),
                addedProperties: this.overviewDataNodeProperties,
                setAnchor: this.setAnchor,
                addProperty: this.addProperty,
                removeProperty: this.removeProperty,
                addLinkNode: this.addLinkNode,
                anchor: this.store.search.anchor,
                setLink: this.setLink,
                removeLink: this.removeLinkNode
            },
            style: {
                background: this.colors.normal,
                color: 'white',
                borderRadius: '8px',
                height: 'auto',
                borderWidth: 0,
                padding: '10px',
                minWidth: 50
            }
        };
    };

    generateOverviewLink = linkNodeID => {
        return {
            id: `${-1}${linkNodeID}`,
            source: `${-1}`,
            target: `${linkNodeID}`,
            arrowHeadType: 'none',
            data: {},
            type: 'overviewCustomEdge'
        };
    };

    generateLink = link => {
        const relationMap = {
            oneToOne: '1:1',
            oneToMany: '1:M',
            manyToMany: 'M:N',
            manyToOne: 'M:1'
        };

        const source = this.nameToId[link.src];
        const target = this.nameToId[link.dest];

        const possibleRelations = this.getPossibleRelations(
            link.src,
            link.dest
        );

        return {
            id: `${source}${target}`,
            source: `${source}`,
            target: `${target}`,
            type: 'schemaEdge',
            arrowHeadType: 'arrowclosed',
            data: {
                possibleRelationships: possibleRelations,
                relationship: link?.relationship
                    ? relationMap[link?.relationship]
                    : possibleRelations[0],
                changeRelationship: this.toggleRelationship,
                removeEdge: this.removeSchemaConnection
            }
        };
    };

    populateStoreData = () => {
        const features = Object.keys(this.store.search.nodeTypes);
        const anchor = this.store.search.anchor;

        this.overviewNodes = features
            .filter(
                node =>
                    node === anchor || this.store.search.links.includes(node)
            )
            .map(node => {
                if (node === anchor) {
                    return this.generateOverviewSchemaNode(node, -1);
                }

                return this.generateOverviewSchemaNode(node, uuidv4());
            });

        this.overviewEdges = this.overviewNodes
            .filter(node => node.data.isLink)
            .map(node => this.generateOverviewLink(node.id));

        const schema = [
            ...features.map(node => this.generateSchemaNode(node)),
            ...this.store?.search?.schema.map(entry => this.generateLink(entry))
        ];

        this.data = generateNodePositions(schema);

        this.edges = this.data.filter(entry => 'source' in entry);
        this.nodes = this.data.filter(entry => !('source' in entry));

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

        this.overviewNodes.push(
            this.generateOverviewSchemaNode(null, newNodeId)
        );

        this.overviewEdges.push(this.generateOverviewLink(newNodeId));

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

        this.overviewNodes = this.overviewNodes.filter(node => node.id !== id);

        this.overviewEdges = this.overviewEdges.filter(
            edge => edge.id !== `-1${id}`
        );

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

        this.store.search.anchor = anchor;

        if (this.store.search.nodeTypes[anchor] === 'list') {
            this.resetProperties();
        }

        const freeFeatures = Object.keys(this.store.search.nodeTypes).filter(
            feature =>
                feature === this.store.search.anchor ||
                !this.store.search.links.includes(feature)
        );

        this.overviewNodes = this.overviewNodes.map(entry => {
            if (entry?.data?.isAnchor) {
                entry.data = {
                    ...entry.data,
                    label: anchor,
                    properties: this.getOverviewNodeProperties()
                };

                if (this.store.search.nodeTypes[anchor] === 'list') {
                    entry.data.addedProperties =
                        this.overviewDataNodeProperties;
                }
            } else {
                entry.data = { ...entry.data, features: freeFeatures };
            }

            entry.data.anchor = this.store.search.anchor;
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

        if (this.store.search.links.includes(link)) {
            this.store.search.setLinks(
                this.store.search.links.filter(entry => entry !== link)
            );

            const freeFeatures = Object.keys(
                this.store.search.nodeTypes
            ).filter(
                feature =>
                    feature === this.store.search.anchor ||
                    !this.store.search.links.includes(feature)
            );

            const overviewLinkNodeId = this.overviewNodes.find(
                entry => entry.data.label === link
            ).id;

            this.overviewNodes = this.overviewNodes
                .filter(entry => entry.id !== overviewLinkNodeId)
                .map(entry => {
                    entry.data = { ...entry.data, features: freeFeatures };
                    return entry;
                });

            this.overviewEdges = this.overviewEdges.filter(
                entry => entry.id !== `${-1}${overviewLinkNodeId}`
            );
        } else {
            this.store.search.links.push(link);

            const freeFeatures = Object.keys(
                this.store.search.nodeTypes
            ).filter(
                feature =>
                    feature === this.store.search.anchor ||
                    !this.store.search.links.includes(feature)
            );

            this.overviewNodes = this.overviewNodes.map(entry => {
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
            Object.keys(this.nameToId).filter(
                key => this.nameToId[key] === id
            )[0] || ''
        );
    };

    getPossibleRelations = (source, target) => {
        const source_type = this.store.search.nodeTypes[source];
        const target_type = this.store.search.nodeTypes[target];

        if (source_type === 'list' && target_type === 'list') {
            return ['M:N', '1:1'];
        }

        if (source_type === 'list' && target_type !== 'list') {
            return ['M:1'];
        }

        if (source_type !== 'list' && target_type === 'list') {
            return ['1:M'];
        }

        return ['1:1'];
    };

    getConnectedNodes = () => {
        return this.edges
            .reduce((visibleNodes, edge) => {
                if (!visibleNodes.includes(edge.source)) {
                    visibleNodes.push(edge.source);
                }

                if (!visibleNodes.includes(edge.target)) {
                    visibleNodes.push(edge.target);
                }

                return visibleNodes;
            }, [])
            .map(nodeId => this.getNodeNameFromId(nodeId));
    };

    addSchemaConnection = edge => {
        this.store.track.trackEvent(
            'Schema Panel',
            `Edge ${edge['source']}${edge['target']}`,
            JSON.stringify({
                type: 'Create'
            })
        );

        this.edges = [
            ...this.edges,
            this.generateLink({
                src: this.getNodeNameFromId(edge.source),
                dest: this.getNodeNameFromId(edge.target)
            })
        ];

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
        this.store.core.updateVisibleDimensionsBasedOnSchema();
    };

    updateSchemaConnection = (oldEdge, newEdge) => {
        this.edges = this.edges.map(entry => {
            if (entry['id'] === oldEdge['id']) {
                entry['id'] = `${newEdge['source']}${newEdge['target']}`;
                entry['source'] = newEdge['source'];
                entry['target'] = newEdge['target'];
            }

            return entry;
        });

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
    };

    removeSchemaConnection = id => {
        this.store.track.trackEvent(
            'Schema Panel',
            `Edge ${id}`,
            JSON.stringify({
                type: 'Remove'
            })
        );

        this.edges = this.edges.filter(entry => entry['id'] !== id);

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
        this.store.core.updateVisibleDimensionsBasedOnSchema();
    };

    resetProperties = () => {
        this.overviewDataNodeProperties = [];
        this.overviewNodes = this.overviewNodes.map(node => {
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

        this.overviewDataNodeProperties.push(property);
        this.overviewNodes = this.overviewNodes.map(node => {
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

        const propIndex = this.overviewDataNodeProperties.indexOf(property);
        this.overviewDataNodeProperties.splice(propIndex, 1);
        this.overviewNodes = this.overviewNodes.map(node => {
            node.data = { ...node.data };
            return node;
        });
        this.generateLayout();
    };

    generateLayout = () => {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
            getSchemaElementPositions(
                this.overviewNodes,
                this.overviewEdges,
                this.overviewDataNodeProperties.length,
                'LR'
            );

        this.overviewNodes = [...layoutedNodes];
        this.overviewEdges = [...layoutedEdges];
    };
}
