import { makeAutoObservable } from 'mobx';
import dagre from 'dagre';
import { v4 as uuidv4 } from 'uuid';

export class SchemaStore {
    edgeRelationshipTypes = ['1:1', '1:M', 'M:N', 'M:1'];
    data = [];
    overviewData = [];
    overviewDataNodeProperties = [];

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

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    resetOverviewNodeProperties = () => (this.overviewDataNodeProperties = []);

    toggleRelationship = id => {
        this.data = this.data.map(entry => {
            if (entry['id'] === id) {
                const currentRelIndex = this.edgeRelationshipTypes.indexOf(
                    entry['data']['relationship']
                );

                if (currentRelIndex < this.edgeRelationshipTypes.length - 1) {
                    entry['data']['relationship'] =
                        this.edgeRelationshipTypes[currentRelIndex + 1];
                } else {
                    entry['data']['relationship'] =
                        this.edgeRelationshipTypes[0];
                }
            }

            return entry;
        });

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
    };

    getServerSchema = () => {
        const serverSchema = [];

        this.data.forEach(entry => {
            if ('source' in entry && 'target' in entry) {
                const source = this.data.find(
                    node => node['id'] === entry['source']
                )['data']['label'];

                const target = this.data.find(
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
                rankdir: this.schemaContainsLinks(schema) ? 'TB' : 'LR',
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

    populateStoreData = () => {
        const schema = [];
        const overviewSchema = [];
        const overviewSchemaLinks = [];

        const nameToId = {};
        const relToShortRel = {
            oneToOne: '1:1',
            oneToMany: '1:M',
            manyToMany: 'M:N',
            manyToOne: 'M:1'
        };

        const features = [
            ...this.store.search.nodeTypes,
            ...this.store.search.newNodeTypes
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
                            : this.store.search.links.includes(node)
                            ? this.colors.link
                            : this.colors.normal,
                    color: 'white',
                    borderRadius: '10px',
                    height: 'auto',
                    borderWidth: 0,
                    padding: '5px',
                    minWidth: 50
                }
            };

            schema.push(schemaNode);

            if (node === anchor) {
                overviewSchema.push({
                    ...schemaNode,
                    position: { x: 5, y: 200 },
                    data: {
                        ...schemaNode.data,
                        position: 'left',
                        features: [
                            ...this.store.search.nodeTypes,
                            ...this.store.search.newNodeTypes
                        ].filter(
                            feature =>
                                !this.store.search.links.includes(feature)
                        ),
                        properties: [
                            ...this.store.search.nodeTypes,
                            ...this.store.search.newNodeTypes
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
                            ...this.store.search.nodeTypes,
                            ...this.store.search.newNodeTypes
                        ].filter(
                            feature =>
                                !this.store.search.links.includes(feature)
                        ),
                        properties: [
                            ...this.store.search.nodeTypes,
                            ...this.store.search.newNodeTypes
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
                        height: 'auto'
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

            nameToId[node] = schema.length - 1;
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
            schema.push({
                id: `${nameToId[edge['src']]}${nameToId[edge['dest']]}`,
                source: `${nameToId[edge['src']]}`,
                target: `${nameToId[edge['dest']]}`,
                type: 'schemaEdge',
                arrowHeadType: 'arrowclosed',
                data: {
                    relationship: relToShortRel[edge['relationship']],
                    changeRelationship: this.toggleRelationship,
                    removeEdge: this.removeSchemaConnection
                }
            });
        });

        this.data = this.generateNodePositions(schema);

        this.overviewData = [...overviewSchema, ...overviewSchemaLinks];
    };

    //TODO: implement a way to update schema when new values show up

    addLinkNode = () => {
        const newNodeId = uuidv4();

        this.overviewData.push({
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
                    ...this.store.search.nodeTypes,
                    ...this.store.search.newNodeTypes
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

        this.overviewData.push({
            id: `${-1}${newNodeId}`,
            source: `${-1}`,
            target: `${newNodeId}`,
            arrowHeadType: 'none',
            data: {},
            type: 'overviewCustomEdge'
        });
        this.overviewData.push({
            id: `${newNodeId}${-2}`,
            source: `${newNodeId}`,
            target: `${-2}`,
            arrowHeadType: 'none',
            data: {},
            type: 'overviewCustomEdge'
        });

        // this.overviewData = this.generateNodePositions(this.overviewData);
        this.overviewData = [...this.overviewData];
    };

    removeLinkNode = id => {
        this.overviewData = this.overviewData.filter(entry => {
            return (
                entry.id !== id &&
                entry.id !== `${-1}${id}` &&
                entry.id !== `${id}${-2}`
            );
        });
    };

    setAnchor = anchor => {
        this.store.search.anchor = anchor;

        this.data = this.data.map(entry => {
            if ('isAnchor' in entry.data) {
                entry.data.isAnchor = entry.data.label === anchor;
                if (entry.data.label === anchor) {
                    entry.data.isLink = false;

                    this.store.search.links = this.store.search.links.filter(
                        entry => entry !== anchor
                    );
                }

                entry.style = {
                    background: entry.data.isAnchor
                        ? this.colors.anchor
                        : entry.data.isLink
                        ? this.colors.link
                        : this.colors.normal,
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

        this.overviewData = this.overviewData.map(entry => {
            if ('isAnchor' in entry.data && entry.data.isAnchor) {
                entry.data.label = anchor;

                entry.style = {
                    background: entry.data.isAnchor
                        ? this.colors.anchor
                        : entry.data.isLink
                        ? this.colors.link
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

            if (entry.data.isAnchor || entry.data.isLink) {
                entry.data.anchor = this.store.search.anchor;
                return entry;
            } else {
                return {
                    id: `${entry.id}`,
                    source: `${entry.source}`,
                    target: `${entry.target}`,
                    arrowHeadType: 'none',
                    data: {},
                    type: 'overviewCustomEdge'
                };
            }
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

            const overviewLinkNodeId = this.overviewData.find(
                entry => entry.data.label === link
            ).id;

            this.overviewData = this.overviewData
                .filter(entry => {
                    return (
                        entry.id !== overviewLinkNodeId &&
                        entry.id !== `${-1}${overviewLinkNodeId}` &&
                        entry.id !== `${overviewLinkNodeId}${-2}`
                    );
                })
                .map(entry => {
                    if (
                        (entry.data.isLink && !entry.data.label) ||
                        entry.data.isAnchor
                    ) {
                        entry.data.features =
                            this.store.search.nodeTypes.filter(
                                feature =>
                                    !this.store.search.links.includes(feature)
                            );
                    }

                    if (entry.data.isAnchor || entry.data.isLink) {
                        return entry;
                    } else {
                        return {
                            id: `${entry.id}`,
                            source: `${entry.source}`,
                            target: `${entry.target}`,
                            arrowHeadType: 'none',
                            data: {},
                            type: 'overviewCustomEdge'
                        };
                    }
                });
        } else {
            this.store.search.links.push(link);

            this.data = this.data.map(entry => {
                if ('isAnchor' in entry.data) {
                    if (entry.data.label === link) {
                        entry.data.isLink = true;
                    }

                    entry.style = {
                        background:
                            entry.data.label === link
                                ? this.colors.link
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

            let nodeValueChanged = false;

            if (
                !nodeId &&
                !this.overviewData.find(
                    node => node.data.isLink && !node.data.label
                )
            ) {
                this.addLinkNode();
            }

            this.overviewData = this.overviewData.map(entry => {
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
                                : entry.data.isLink
                                ? this.colors.link
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
                                : entry.data.isLink
                                ? this.colors.link
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
                    entry.data.features = this.store.search.nodeTypes.filter(
                        feature => !this.store.search.links.includes(feature)
                    );
                }

                if (entry.data.isAnchor || entry.data.isLink) {
                    return entry;
                } else {
                    return {
                        id: `${entry.id}`,
                        source: `${entry.source}`,
                        target: `${entry.target}`,
                        arrowHeadType: 'none',
                        data: {},
                        type: 'overviewCustomEdge'
                    };
                }
            });
        }
    };

    addSchemaConnection = edge => {
        this.data = [
            ...this.data,
            {
                id: `${edge['source']}${edge['target']}`,
                source: edge['source'],
                target: edge['target'],
                type: 'schemaEdge',
                arrowHeadType: 'arrowclosed',
                data: {
                    relationship: '1:1',
                    changeRelationship: this.toggleRelationship,
                    removeEdge: this.removeSchemaConnection
                }
            }
        ];

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
    };

    updateSchemaConnection = (oldEdge, newEdge) => {
        this.data = this.data.map(entry => {
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
        this.data = this.data.filter(entry => entry['id'] !== id);

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());
    };

    addProperty = property => {
        this.overviewDataNodeProperties.push(property);
        this.overviewData = [...this.overviewData];
    };

    removeProperty = property => {
        const propIndex = this.overviewDataNodeProperties.indexOf(property);
        this.overviewDataNodeProperties.splice(propIndex, 1);
        this.overviewData = [...this.overviewData];
    };
}
