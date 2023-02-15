import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { generateNodePositions } from 'schema.utils';

export class SchemaStore {
    nodes = [];
    edges = [];

    nodeLabelToID = {};
    useUploadData = false;
    features = [];
    featureTypes = {};
    relationshipMapping = {
        '1:1': 'oneToOne',
        '1:M': 'oneToMany',
        'M:N': 'manyToMany',
        'M:1': 'manyToOne'
    };

    updateNodes = nodes => (this.nodes = nodes);
    updateEdges = edges => (this.edges = edges);

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setUseUploadData = val => (this.useUploadData = val);

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
        if (!this.useUploadData) {
            this.store.search.updateCurrentDatasetSchema(
                this.getServerSchema()
            );
        }
    };

    getServerSchema = () => {
        return this.edges.map(edge => {
            const source = this.nodes.find(node => node.id === edge.source).data
                .label;

            const target = this.nodes.find(node => node.id === edge.target).data
                .label;

            let serverRelationship =
                this.relationshipMapping[edge.data.relationship];

            return {
                src: source,
                dest: target,
                relationship: serverRelationship
            };
        });
    };

    generateSchemaNode = label => {
        const isLink = this.store.search.links.includes(label);
        const isAnchor = label === this.store.search.anchor;
        const id = uuidv4();
        this.nodeLabelToID[label] = id;

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

    generateLink = link => {
        const relationMap = {
            oneToOne: '1:1',
            oneToMany: '1:M',
            manyToMany: 'M:N',
            manyToOne: 'M:1'
        };

        const source = this.nodeLabelToID[link.src];
        const target = this.nodeLabelToID[link.dest];

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

    populateStoreData = (useUploadData = false) => {
        this.setUseUploadData(useUploadData);
        let schema;

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

            const source = this.store.fileUpload.fileUploadData.anchor;
            const dest = this.store.fileUpload.fileUploadData.link;

            schema = [
                ...this.features.map(node => this.generateSchemaNode(node)),
                this.generateLink({
                    src: source,
                    dest: dest,
                    relationship:
                        this.relationshipMapping[
                            this.getPossibleRelations(source, dest)[0]
                        ]
                })
            ];
        } else {
            this.features = Object.keys(this.store.search.nodeTypes);
            this.featureTypes = this.store.search.nodeTypes;
            schema = [
                ...this.features.map(node => this.generateSchemaNode(node)),
                ...this.store?.search?.schema.map(entry =>
                    this.generateLink(entry)
                )
            ];
        }

        const nodePositions = generateNodePositions(schema);

        this.edges = nodePositions.filter(entry => 'source' in entry);
        this.nodes = nodePositions.filter(entry => !('source' in entry));
    };

    getNodeNameFromId = id => {
        return (
            Object.keys(this.nodeLabelToID).filter(
                key => this.nodeLabelToID[key] === id
            )[0] || ''
        );
    };

    getPossibleRelations = (source, target) => {
        const source_type = this.featureTypes[source];
        const target_type = this.featureTypes[target];

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

        if (!this.useUploadData) {
            this.store.search.updateCurrentDatasetSchema(
                this.getServerSchema()
            );
            this.store.core.updateVisibleDimensionsBasedOnSchema();
        }
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

        if (!this.useUploadData) {
            this.store.search.updateCurrentDatasetSchema(
                this.getServerSchema()
            );
        }
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

        if (!this.useUploadData) {
            this.store.search.updateCurrentDatasetSchema(
                this.getServerSchema()
            );
            this.store.core.updateVisibleDimensionsBasedOnSchema();
        }
    };
}
