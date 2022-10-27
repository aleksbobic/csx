import { makeAutoObservable } from 'mobx';
import dagre from 'dagre';
import { v4 as uuidv4 } from 'uuid';

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
        anchor: '#3182ce',
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
        this.edges = this.edges.map(entry => {
            if (entry['id'] === id) {
                const currentRelIndex = possibleRelationships.indexOf(
                    entry['data']['relationship']
                );

                if (currentRelIndex < possibleRelationships.length - 1) {
                    entry['data']['relationship'] =
                        possibleRelationships[currentRelIndex + 1];
                } else {
                    entry['data']['relationship'] = possibleRelationships[0];
                }
            }

            return entry;
        });

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
    };

    getServerSchema = () => {
        const serverSchema = [];

        this.edges.forEach(entry => {
            if ('source' in entry && 'target' in entry) {
                const source = this.nodes.find(
                    node => node['id'] === entry['source']
                )['data']['label'];

                const target = this.nodes.find(
                    node => node['id'] === entry['target']
                )['data']['label'];

                let serverRelationship =
                    this.shortRelToRel[entry['data']['relationship']];

                serverSchema.push({
                    src: source,
                    dest: target,
                    relationship: serverRelationship
                });
            }
        });

        return serverSchema;
    };

    schemaContainsLinks = schema =>
        schema.some(entry => Object.keys(entry).includes('source'));

    generateNodePositions = schema => {
        const graph = new dagre.graphlib.Graph()
            .setDefaultEdgeLabel(() => ({}))
            .setGraph({
                rankdir: 'LR',
                align: 'UL'
            });

        schema.forEach(entry => {
            if (!Object.keys(entry).includes('source')) {
                graph.setNode(entry.id, {
                    width: 208,
                    height: 32,
                    position: {
                        x: 0,
                        y: 0
                    }
                });
            } else {
                graph.setEdge(entry.source, entry.target);
            }
        });

        dagre.layout(graph);

        return schema.map(entry => {
            if (!Object.keys(entry).includes('source')) {
                const nodeWithPosition = graph.node(entry.id);
                entry.targetPosition = 'top';
                entry.sourcePosition = 'bottom';

                entry.position = {
                    y: nodeWithPosition.y - 32 / 2,
                    x: nodeWithPosition.x - 208 / 2
                };
            }

            return entry;
        });
    };

    getOverviewNodeProperties = () => {
        const data = {
            ...this.store.search.newNodeTypes,
            ...this.store.search.nodeTypes
        };

        if (data[this.store.search.anchor] !== 'list') {
            return Object.entries(data)
                .filter(
                    entry =>
                        entry[0] !== this.store.search.anchor &&
                        !['list', 'string'].includes(data[entry[0]])
                )
                .map(entry => entry[0]);
        }

        return [];
    };

    populateStoreData = () => {
        const schema = [];
        const overviewSchema = [];
        const overviewSchemaLinks = [];

        const relToShortRel = {
            oneToOne: '1:1',
            oneToMany: '1:M',
            manyToMany: 'M:N',
            manyToOne: 'M:1'
        };

        const features = [
            ...Object.keys(this.store.search.nodeTypes),
            ...Object.keys(this.store.search.newNodeTypes)
        ];
        const anchor = this.store.search.anchor;

        features.forEach(node => {
            const schemaNode = {
                id: `${schema.length}`,
                type: 'schemaNode',
                data: {
                    label: node,
                    isAnchor: node === anchor,
                    setAnchor: this.setAnchor,
                    isLink: this.store.search.links.includes(node),
                    setLink: this.setLink
                },
                position: { x: 0, y: 0 },
                targetPosition: 'top',
                sourcePosition: 'bottom',
                style: {
                    background:
                        node === anchor
                            ? this.colors.anchor
                            : this.colors.normal,
                    color: 'white',
                    borderRadius: '10px',
                    height: 'auto',
                    borderWidth: 0,
                    padding: '5px',
                    minWidth: 50
                }
            };

            schema.push({
                ...schemaNode,
                style: { ...schemaNode.style, background: this.colors.normal }
            });

            if (node === anchor) {
                overviewSchema.push({
                    ...schemaNode,
                    position: { x: 5, y: 200 },
                    data: {
                        ...schemaNode.data,
                        position: 'left',
                        features: [
                            ...Object.keys(this.store.search.nodeTypes),
                            ...Object.keys(this.store.search.newNodeTypes)
                        ].filter(
                            feature =>
                                !this.store.search.links.includes(feature)
                        ),
                        properties: [...this.getOverviewNodeProperties()],
                        addedProperties: this.overviewDataNodeProperties,
                        setAnchor: this.setAnchor,
                        addProperty: this.addProperty,
                        removeProperty: this.removeProperty,
                        addLinkNode: this.addLinkNode,
                        anchor: this.store.search.anchor
                    },
                    style: {
                        ...schemaNode.style,
                        borderRadius: '10px',
                        height: 'auto'
                    },
                    id: '-1',
                    type: 'overviewSchemaNode'
                });
                overviewSchema.push({
                    ...schemaNode,
                    position: { x: 500, y: 200 },
                    data: {
                        ...schemaNode.data,
                        position: 'right',
                        features: [
                            ...Object.keys(this.store.search.nodeTypes),
                            ...Object.keys(this.store.search.newNodeTypes)
                        ].filter(
                            feature =>
                                !this.store.search.links.includes(feature)
                        ),
                        properties: [
                            ...Object.keys(this.store.search.nodeTypes),
                            ...Object.keys(this.store.search.newNodeTypes)
                        ],
                        addedProperties: this.overviewDataNodeProperties,
                        setAnchor: this.setAnchor,
                        addProperty: this.addProperty,
                        removeProperty: this.removeProperty,
                        addLinkNode: this.addLinkNode,
                        anchor: this.store.search.anchor
                    },
                    style: {
                        ...schemaNode.style,
                        borderRadius: '10px',
                        height: 'auto',
                        background: 'rgba(100,100,100,0.5)'
                    },
                    id: '-2',
                    type: 'overviewSchemaNode'
                });
            } else if (this.store.search.links.includes(node)) {
                overviewSchema.push({
                    ...schemaNode,
                    position: { x: 250, y: 200 },
                    id: uuidv4(),
                    data: {
                        ...schemaNode.data,
                        position: 'both',
                        setLink: this.setLink,
                        removeLink: this.removeLinkNode,
                        anchor: this.store.search.anchor
                    },
                    type: 'overviewSchemaNode'
                });
            }

            this.nameToId[node] = schema.length - 1;
        });

        overviewSchema.forEach(node => {
            if (node.data.isLink) {
                overviewSchemaLinks.push({
                    id: `${-1}${node.id}`,
                    source: `${-1}`,
                    target: `${node.id}`,
                    arrowHeadType: 'none',
                    data: {},
                    type: 'overviewCustomEdge'
                });
                overviewSchemaLinks.push({
                    id: `${node.id}${-2}`,
                    source: `${node.id}`,
                    target: `${-2}`,
                    arrowHeadType: 'none',
                    data: {},
                    type: 'overviewCustomEdge'
                });
            }
        });

        this.store?.search?.schema.forEach(edge => {
            const possibleConnections = this.getPossibleConnections(
                edge['src'],
                edge['dest']
            );

            schema.push({
                id: `${this.nameToId[edge['src']]}${
                    this.nameToId[edge['dest']]
                }`,
                source: `${this.nameToId[edge['src']]}`,
                target: `${this.nameToId[edge['dest']]}`,
                type: 'schemaEdge',
                arrowHeadType: 'arrowclosed',
                data: {
                    possibleRelationships: possibleConnections,
                    relationship: relToShortRel[edge['relationship']],
                    changeRelationship: this.toggleRelationship,
                    removeEdge: this.removeSchemaConnection
                }
            });
        });

        this.data = this.generateNodePositions(schema);

        const nodes = [];
        const edges = [];
        this.data.forEach(entry => {
            if (Object.keys(entry).includes('source')) {
                edges.push(entry);
            } else {
                nodes.push(entry);
            }
        });

        this.edges = edges;
        this.nodes = nodes;

        this.overviewNodes = [...overviewSchema];
        this.overviewEdges = [...overviewSchemaLinks];
    };

    //TODO: implement a way to update schema when new values show up

    addLinkNode = () => {
        const newNodeId = uuidv4();

        this.overviewNodes.push({
            id: newNodeId,
            position: { x: 250, y: 200 },
            type: 'overviewSchemaNode',
            data: {
                label: null,
                isAnchor: false,
                setAnchor: this.setAnchor,
                addProperty: this.addProperty,
                removeProperty: this.removeProperty,
                addedProperties: this.overviewDataNodeProperties,
                isLink: true,
                setLink: this.setLink,
                removeLink: this.removeLinkNode,
                position: 'both',
                features: [
                    ...Object.keys(this.store.search.nodeTypes),
                    ...Object.keys(this.store.search.newNodeTypes)
                ].filter(feature => !this.store.search.links.includes(feature)),
                anchor: this.store.search.anchor
            },
            targetPosition: 'top',
            sourcePosition: 'bottom',
            style: {
                background: this.colors.normal,
                color: 'white',
                borderRadius: '10px',
                height: 'auto',
                borderWidth: 0,
                padding: '5px',
                minWidth: 50
            }
        });

        this.overviewEdges.push({
            id: `${-1}${newNodeId}`,
            source: `${-1}`,
            target: `${newNodeId}`,
            arrowHeadType: 'none',
            data: {},
            type: 'overviewCustomEdge'
        });
        this.overviewEdges.push({
            id: `${newNodeId}${-2}`,
            source: `${newNodeId}`,
            target: `${-2}`,
            arrowHeadType: 'none',
            data: {},
            type: 'overviewCustomEdge'
        });

        this.overviewNodes = [...this.overviewNodes];
        this.overviewEdges = [...this.overviewEdges];
    };

    removeLinkNode = id => {
        this.overviewNodes = this.overviewNodes.filter(entry => {
            return entry.id !== id;
        });

        this.overviewEdges = this.overviewEdges.filter(entry => {
            return entry.id !== `${-1}${id}` && entry.id !== `${id}${-2}`;
        });
    };

    setAnchor = anchor => {
        this.store.search.anchor = anchor;

        if (this.store.search.nodeTypes[anchor] === 'list') {
            this.resetProperties();
        }

        this.overviewNodes = this.overviewNodes.map(entry => {
            if ('isAnchor' in entry.data && entry.data.isAnchor) {
                entry.data.label = anchor;
                entry.data.properties = this.getOverviewNodeProperties();

                if (this.store.search.nodeTypes[anchor] === 'list') {
                    entry.data.addedProperties =
                        this.overviewDataNodeProperties;
                }

                entry.style = {
                    background:
                        entry.data.isAnchor && entry.data.position === 'left'
                            ? this.colors.anchor
                            : 'rgba(100,100,100,0.5)',
                    color: 'white',
                    borderRadius: '10px',
                    height: 'auto',
                    borderWidth: 0,
                    padding: '5px',
                    minWidth: 50,
                    opacity: 1
                };
            }

            entry.data.anchor = this.store.search.anchor;
            return entry;
        });

        this.overviewEdges = this.overviewEdges.map(entry => {
            return {
                id: `${entry.id}`,
                source: `${entry.source}`,
                target: `${entry.target}`,
                arrowHeadType: 'none',
                data: {},
                type: 'overviewCustomEdge'
            };
        });
    };

    setLink = (link, nodeId) => {
        if (this.store.search.links.includes(link)) {
            this.store.search.links = this.store.search.links.filter(
                entry => entry !== link
            );

            this.data = this.data.map(entry => {
                if ('isAnchor' in entry.data) {
                    if (entry.data.label === link) {
                        entry.data.isLink = false;
                    }

                    entry.style = {
                        background:
                            entry.data.label === link
                                ? this.colors.normal
                                : entry.style.background,
                        color: 'white',
                        borderRadius: '10px',
                        height: 'auto',
                        borderWidth: 0,
                        padding: '5px',
                        minWidth: 50
                    };
                }
                return entry;
            });

            const overviewLinkNodeId = this.overviewNodes.find(
                entry => entry.data.label === link
            ).id;

            this.overviewNodes = this.overviewNodes
                .filter(entry => entry.id !== overviewLinkNodeId)
                .map(entry => {
                    if (
                        (entry.data.isLink && !entry.data.label) ||
                        entry.data.isAnchor
                    ) {
                        entry.data.features = Object.keys(
                            this.store.search.nodeTypes
                        ).filter(
                            feature =>
                                !this.store.search.links.includes(feature)
                        );
                    }

                    return entry;
                });

            this.overviewEdges = this.overviewEdges
                .filter(
                    entry =>
                        entry.id !== `${-1}${overviewLinkNodeId}` &&
                        entry.id !== `${overviewLinkNodeId}${-2}`
                )
                .map(entry => {
                    if (
                        (entry.data.isLink && !entry.data.label) ||
                        entry.data.isAnchor
                    ) {
                        entry.data.features = Object.keys(
                            this.store.search.nodeTypes
                        ).filter(
                            feature =>
                                !this.store.search.links.includes(feature)
                        );
                    }

                    return {
                        id: `${entry.id}`,
                        source: `${entry.source}`,
                        target: `${entry.target}`,
                        arrowHeadType: 'none',
                        data: {},
                        type: 'overviewCustomEdge'
                    };
                });
        } else {
            this.store.search.links.push(link);

            this.data = this.data.map(entry => {
                if ('isAnchor' in entry.data) {
                    if (entry.data.label === link) {
                        entry.data.isLink = true;
                    }

                    entry.style = {
                        background: entry.style.background,
                        color: 'white',
                        borderRadius: '10px',
                        height: 'auto',
                        borderWidth: 0,
                        padding: '5px',
                        minWidth: 50
                    };
                }
                return entry;
            });

            let nodeValueChanged = false;

            if (
                !nodeId &&
                !this.overviewNodes.find(
                    node => node.data.isLink && !node.data.label
                )
            ) {
                this.addLinkNode();
            }

            this.overviewNodes = this.overviewNodes.map(entry => {
                if (nodeId) {
                    if (
                        'isLink' in entry.data &&
                        entry.data.isLink &&
                        entry.id === nodeId
                    ) {
                        entry.data.label = link;
                        nodeValueChanged = true;

                        entry.style = {
                            background: entry.data.isAnchor
                                ? this.colors.anchor
                                : this.colors.normal,
                            color: 'white',
                            borderRadius: '10px',
                            height: 'auto',
                            borderWidth: 0,
                            padding: '5px',
                            minWidth: 50,
                            opacity: 1
                        };
                    }
                } else {
                    if (
                        'isLink' in entry.data &&
                        entry.data.isLink &&
                        !entry.data.label &&
                        !nodeValueChanged
                    ) {
                        entry.data.label = link;
                        nodeValueChanged = true;

                        entry.style = {
                            background: entry.data.isAnchor
                                ? this.colors.anchor
                                : this.colors.normal,
                            color: 'white',
                            borderRadius: '10px',
                            height: 'auto',
                            borderWidth: 0,
                            padding: '5px',
                            minWidth: 50,
                            opacity: 1
                        };
                    }
                }

                if (
                    (entry.data.isLink && !entry.data.label) ||
                    entry.data.isAnchor
                ) {
                    entry.data.features = Object.keys(
                        this.store.search.nodeTypes
                    ).filter(
                        feature => !this.store.search.links.includes(feature)
                    );
                }

                return entry;
            });

            this.overviewEdges = this.overviewEdges.map(entry => {
                return {
                    id: `${entry.id}`,
                    source: `${entry.source}`,
                    target: `${entry.target}`,
                    arrowHeadType: 'none',
                    data: {},
                    type: 'overviewCustomEdge'
                };
            });
        }
    };

    getNodeNameFromId = id => {
        let name = '';

        Object.keys(this.nameToId).forEach(key => {
            if (this.nameToId[key] === Number(id)) {
                name = key;
            }
        });

        return name;
    };

    getPossibleConnections = (source, target) => {
        const types = {
            ...this.store.search.nodeTypes,
            ...this.store.search.newNodeTypes
        };

        const src_type = types[source];
        const tar_type = types[target];

        if (src_type === 'list' && tar_type === 'list') {
            return ['M:N', '1:1'];
        } else if (src_type === 'list' && tar_type !== 'list') {
            return ['M:1'];
        } else if (src_type !== 'list' && tar_type === 'list') {
            return ['1:M'];
        } else {
            return ['1:1'];
        }
    };

    addSchemaConnection = edge => {
        const possibleConnections = this.getPossibleConnections(
            this.getNodeNameFromId(edge['source']),
            this.getNodeNameFromId(edge['target'])
        );

        this.edges = [
            ...this.edges,
            {
                id: `${edge['source']}${edge['target']}`,
                source: edge['source'],
                target: edge['target'],
                type: 'schemaEdge',
                arrowHeadType: 'arrowclosed',
                data: {
                    possibleRelationships: possibleConnections,
                    relationship: possibleConnections[0],
                    changeRelationship: this.toggleRelationship,
                    removeEdge: this.removeSchemaConnection
                }
            }
        ];

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
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
        this.edges = this.edges.filter(entry => entry['id'] !== id);

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
    };

    resetProperties = () => {
        this.overviewDataNodeProperties = [];
        this.overviewNodes = [...this.overviewNodes];
        this.overviewEdges = [...this.overviewEdges];
    };

    addProperty = property => {
        this.overviewDataNodeProperties.push(property);
        this.overviewNodes = [...this.overviewNodes];
        this.overviewEdges = [...this.overviewEdges];
    };

    removeProperty = property => {
        const propIndex = this.overviewDataNodeProperties.indexOf(property);
        this.overviewDataNodeProperties.splice(propIndex, 1);
        this.overviewNodes = [...this.overviewNodes];
        this.overviewEdges = [...this.overviewEdges];
    };
}
