import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { generateNodePositions } from 'schema.utils';
import { MarkerType } from 'react-flow-renderer';
import { safeRequest } from 'general.utils';
import axios from 'axios';

export class SchemaStore {
    nodes = [];
    edges = [];

    nodeLabelToID = {};
    useUploadData = false;
    features = [];
    featureTypes = {};
    schemaHasChanges = false;
    schemaHasErrors = false;
    schemaError = null;
    relationshipMapping = {
        '1:1': 'oneToOne',
        '1:M': 'oneToMany',
        'M:N': 'manyToMany',
        'M:1': 'manyToOne'
    };

    pastSchemas = [];
    recommendedSchemas = [];

    pushCurrentSchemaToPastSchemas = () => {
        // you need: {"src": "author_institutions", "dst": "concepts_lv_2", "rel": "M:N"}
        this.pastSchemas.push(
            JSON.stringify(
                this.edges.map(edge => {
                    return {
                        src: this.nodes.find(node => node.id === edge.source)
                            .data.label,
                        dst: this.nodes.find(node => node.id === edge.target)
                            .data.label,
                        rel: edge.data.relationship
                    };
                })
            )
        );
        if (this.pastSchemas.length > 10) {
            this.pastSchemas.pop();
        }
    };

    getSchemaRecommendations = async () => {
        const params = {
            schematype: 'detail',
            rectype: 'schema',
            recinput: this.pastSchemas
        };

        const { error, response } = await safeRequest(
            axios.post('utils/recommendation', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.recommendedSchemas = [];

        this.recommendedSchemas = response.data.map((schema, index) => {
            const parsedSchema = JSON.parse(schema);

            return {
                id: index,
                name: `${parsedSchema[0]['src']} and ${parsedSchema[0]['dst']}`,
                schema: parsedSchema
            };
        });
    };

    getActionRecommendations = async () => {
        const params = {
            schematype: 'detail',
            rectype: 'action',
            recinput: this.pastSchemas
        };

        const { error, response } = await safeRequest(
            axios.post('utils/recommendation', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        console.log(response.data);
    };

    updateNodes = nodes => (this.nodes = nodes);
    updateEdges = edges => (this.edges = edges);

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    setUseUploadData = val => (this.useUploadData = val);
    setSchemaHasChanges = val => (this.schemaHasChanges = val);
    setSchemaHasErrors = val => (this.schemaHasErrors = val);
    resetSchema = () => {
        this.nodes = [];
        this.edges = [];
        this.nodeLabelToID = {};
        this.setSchemaHasChanges(false);
        this.setSchemaHasErrors(false);
        this.schemaError = null;
    };

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
            JSON.stringify({
                area: 'Schema panel',
                sub_area: 'Schema'
            }),
            JSON.stringify({
                item_type: 'Edge',
                item_id: id
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Change relationship',
                event_value: edge.data.relationship
            })
        );

        this.edges = [...this.edges];
        if (!this.useUploadData) {
            this.store.search.updateCurrentDatasetSchema(
                this.getServerSchema()
            );
        }

        this.setSchemaHasChanges(true);
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
                isVisible:
                    this.store.core.visibleDimensions['detail'].includes(label),
                toggleVisibility: this.toggleVisibility
            },
            style: {
                background: this.store.core.visibleDimensions[
                    'detail'
                ].includes(label)
                    ? '#283b57'
                    : '#323232',
                color: 'white',
                borderRadius: '10px',
                height: 'auto',
                borderWidth: 0,
                padding: '10px',
                minWidth: 50
            }
        };
    };

    toggleVisibility = feature => {
        this.store.core.toggleVisibleDimension(feature);
        this.refreshNodeStyles();
        this.checkForSchemaErrors();
        this.setSchemaHasChanges(true);
    };

    makeVisibleOnConnect = (nodelabel, nodeId) => {
        if (
            !this.store.core.visibleDimensions['detail'].includes(nodelabel) &&
            !this.edges.find(
                edge => edge.source === nodeId || edge.target === nodeId
            )
        ) {
            this.toggleVisibility(nodelabel);
        }
    };

    generateLink = link => {
        const relationMap = {
            onetoone: '1:1',
            onetomany: '1:M',
            manytomany: 'M:N',
            manytoone: 'M:1'
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
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 26,
                height: 26
            },
            data: {
                possibleRelationships: possibleRelations,
                relationship: link?.relationship
                    ? relationMap[link?.relationship.toLowerCase()]
                    : possibleRelations[0],
                changeRelationship: this.toggleRelationship,
                removeEdge: this.removeSchemaConnection
            }
        };
    };

    loadRecommendedSchema = id => {
        const schema_to_load = this.recommendedSchemas.find(
            schema => schema.id === id
        ).schema;

        const schema_nodes = [
            ...new Set(schema_to_load.map(edge => [edge.dst, edge.src]).flat())
        ];

        this.edges = [];

        for (let i = 0; i < schema_to_load.length; i++) {
            const edge = schema_to_load[i];

            const source = edge.src;
            const dest = edge.dst;

            this.makeVisibleOnConnect(source, this.nodeLabelToID[source]);
            this.makeVisibleOnConnect(dest, this.nodeLabelToID[dest]);

            this.edges.push(
                this.generateLink({
                    src: source,
                    dest: dest,
                    relationship: this.relationshipMapping[edge.rel]
                })
            );
        }

        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());

        this.store.core.setArrayAsVisibleDimensions(schema_nodes);
        this.refreshNodeStyles();
        this.checkForSchemaErrors();
        this.setSchemaHasChanges(true);
    };

    loadDefaultSchema = id => {
        const schema_to_load = this.store.search.default_schemas.detail.find(
            schema => schema.id === id
        );

        const schema_nodes = [
            ...new Set(
                schema_to_load.edges
                    .map(edge => [edge.source, edge.target])
                    .flat()
            )
        ].map(
            node_id =>
                schema_to_load.nodes.find(node => node.id === node_id).data
                    .label
        );

        this.edges = schema_to_load.edges.map(edge => {
            edge.data.changeRelationship = this.toggleRelationship;
            edge.data.removeEdge = this.removeSchemaConnection;
            edge.markerEnd = {
                type: MarkerType.ArrowClosed,
                width: 26,
                height: 26
            };

            return edge;
        });

        this.nodes = schema_to_load.nodes.map(node => {
            node.data = {
                ...node.data,
                isVisible: this.store.core.visibleDimensions['detail'].includes(
                    node.data.label
                ),
                toggleVisibility: this.toggleVisibility
            };

            return node;
        });
        this.nodeLabelToID = {};

        this.nodes.forEach(node => {
            this.nodeLabelToID[node.data.label] = node.id;
        });
        this.store.search.updateCurrentDatasetSchema(this.getServerSchema());

        this.store.core.setArrayAsVisibleDimensions(schema_nodes);
        this.refreshNodeStyles();
        this.checkForSchemaErrors();
        this.setSchemaHasChanges(true);
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

        this.edges = nodePositions.filter(entry => entry.type === 'schemaEdge');

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
            JSON.stringify({
                area: 'Schema panel',
                sub_area: 'Schema'
            }),
            JSON.stringify({
                item_type: null
            }),
            JSON.stringify({
                event_type: 'Connect',
                event_action: 'Create new edge',
                event_value: `${edge['source']}${edge['target']}`
            })
        );

        const src = this.getNodeNameFromId(edge.source);
        const dest = this.getNodeNameFromId(edge.target);

        this.makeVisibleOnConnect(src, edge.source);
        this.makeVisibleOnConnect(dest, edge.target);

        this.edges = [
            ...this.edges,
            this.generateLink({
                src: src,
                dest: dest
            })
        ];

        if (!this.useUploadData) {
            this.store.search.updateCurrentDatasetSchema(
                this.getServerSchema()
            );
        }

        this.refreshNodeStyles();
        this.checkForSchemaErrors();
        this.setSchemaHasChanges(true);
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

        this.checkForSchemaErrors();
        this.setSchemaHasChanges(true);
    };

    removeSchemaConnection = id => {
        this.store.track.trackEvent(
            JSON.stringify({
                area: 'Schema panel',
                sub_area: 'Schema',
                sub_sub_area: 'Edge',
                sub_sub_area_id: id
            }),
            JSON.stringify({
                item_type: 'Button'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Remove edge'
            })
        );

        this.edges = this.edges.filter(entry => entry['id'] !== id);

        if (!this.useUploadData) {
            this.store.search.updateCurrentDatasetSchema(
                this.getServerSchema()
            );
        }

        this.refreshNodeStyles();
        this.checkForSchemaErrors();
        this.setSchemaHasChanges(true);
    };

    refreshNodeStyles = () => {
        this.nodes = [
            ...this.nodes.map(node => {
                node.data.isVisible = this.store.core.visibleDimensions[
                    'detail'
                ].includes(node.data.label);
                node.style = {
                    ...node.style,
                    background: this.store.core.visibleDimensions[
                        'detail'
                    ].includes(node.data.label)
                        ? '#283b57'
                        : '#323232'
                };

                return node;
            })
        ];
    };

    checkForSchemaErrors = () => {
        if (this.store.core.visibleDimensions['detail'].length) {
            this.setSchemaHasErrors(false);
            this.schemaError = null;
        } else {
            this.setSchemaHasErrors(true);
            this.schemaError = 'Schema must have at least one visible feature.';
        }
    };
}
