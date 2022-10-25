import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowStore {
    shouldRunWorkflow = false;
    newWorkflowName = '';
    workflows = {};

    actionNodeTypes = [
        {
            nodeType: 'datasetNode',
            label: 'Dataset',
            tooltip: 'Retrieve an entire dataset'
        },
        {
            nodeType: 'searchNode',
            label: 'Search',
            tooltip: 'Represents a single search keyword.'
        },
        {
            nodeType: 'connectorNode',
            label: 'Connector',
            tooltip: 'Serves as a connection between differnt keywords.'
        },
        {
            nodeType: 'filterNode',
            label: 'Filter',
            tooltip:
                'Serves as an advanced search node which enables more elaborate filtering of values.'
        },
        {
            nodeType: 'countsNode',
            label: 'Counts',
            tooltip:
                'Serves as a node for counting the occurance of array values in a feature.'
        },
        {
            nodeType: 'keywordExtractionNode',
            label: 'Keyword Extraction',
            tooltip:
                'Serves as a keyword extraction node which enables extracting keywords from longer texts and adding them to a new column.'
        },
        {
            nodeType: 'resultsNode',
            label: 'Results',
            tooltip:
                'Serves as an exit node which indicates that everything connected to it should be executed and visualised as a network.'
        }
    ];

    actionNodeColors = {
        searchNode: '#3182ce',
        datasetNode: '#3182ce',
        filterNode: '#ce8631',
        countsNode: '#ce8631',
        connectorNode: '#323232',
        resultsNode: '#3cd824',
        keywordExtractionNode: '#ce8631',
        background: '#161616'
    };

    actions = [];
    nodes = [];
    edges = [];

    updateNodes = nodes => (this.nodes = nodes);
    updateEdges = edges => (this.edges = edges);

    setNewWorkflowName = val => (this.newWorkflowName = val);

    saveNewWorkflow = () => {
        console.log(
            `Saving ${this.newWorkflowName} for ${this.store.search.currentDataset} with ${this.nodes.length} nodes and with ${this.edges.length}`
        );

        if (!this.workflows[this.store.search.currentDataset]) {
            this.workflows[this.store.search.currentDataset] = {};
        }

        this.workflows[this.store.search.currentDataset][this.newWorkflowName] =
            { edges: this.edges, nodes: this.nodes };

        localStorage.setItem('workflows', JSON.stringify(this.workflows));
        this.newWorkflowName = '';
    };

    removeWorkflow = name => {
        delete this.workflows[this.store.search.currentDataset][name];

        localStorage.setItem('workflows', JSON.stringify(this.workflows));
    };

    loadWorkflow = name => {
        const loadedEdges =
            this.workflows[this.store.search.currentDataset][name]['edges'];

        const loadedNodes =
            this.workflows[this.store.search.currentDataset][name]['nodes'];

        const resultsNodes = loadedNodes
            .filter(node => node.type === 'resultsNode')
            .map(node => {
                node.data.runWorkflow = this.runWorkFlow;
                node.data.deleteNode = this.deleteNode;
                return node;
            });

        this.edges = loadedEdges
            .filter(entry => entry.type === 'searchEdge')
            .map(edge => {
                edge.data.removeEdge = this.removeEdge;
                return edge;
            });

        const searchNodes = loadedNodes
            .filter(node => node.type === 'searchNode')
            .map(node => {
                node.data.deleteNode = this.deleteNode;
                node.data.updateSearchNodeData = this.updateSearchNodeData;
                return node;
            });

        const otherNodes = loadedNodes
            .filter(
                node =>
                    !['resultsNode', 'searchNode', 'searchEdge'].includes(
                        node.type
                    )
            )
            .map(node => {
                node.data.deleteNode = this.deleteNode;
                return node;
            });

        this.nodes = [...otherNodes, ...resultsNodes, ...searchNodes];

        this.nodes = this.nodes.map(node => {
            if (node.type === 'searchNode') {
                node.data.updateActions = this.updateActions;
                node.data.getSuggestions = this.store.search.suggest;
            }
            return node;
        });
    };

    setShouldRunWorkflow = val => {
        this.shouldRunWorkflow = val;
    };

    constructor(store) {
        this.store = store;

        const workflowString = localStorage.getItem('workflows');
        if (workflowString) {
            this.workflows = JSON.parse(workflowString);
        }

        makeAutoObservable(this);
    }

    resetWorkflow = () => {
        this.edges = [];
        this.nodes = [];
    };

    getNodeTypesOfType = nodeTypes => {
        return Object.entries(this.store.search.nodeTypes)
            .filter(entry =>
                nodeTypes.includes(this.store.search.nodeTypes[entry[0]])
            )
            .map(entry => entry[0]);
    };

    deleteNode = nodeID => {
        this.nodes = [...this.nodes.filter(node => node.id !== nodeID)];

        this.edges = [
            ...this.edges.filter(
                node =>
                    node.type === 'searchEdge' &&
                    node.source !== nodeID &&
                    node.target !== nodeID
            )
        ];
    };

    updateFilterNodeValues = (nodeID, feature) => {
        this.nodes = this.nodes.map(node => {
            if (node.id === nodeID) {
                node = {
                    ...node,
                    data: {
                        ...node.data,
                        min: this.store.search.getSearchHintsByFeature(feature)[
                            'min'
                        ],
                        max: this.store.search.getSearchHintsByFeature(feature)[
                            'max'
                        ],
                        min_value:
                            this.store.search.getSearchHintsByFeature(feature)[
                                'min'
                            ],
                        max_value:
                            this.store.search.getSearchHintsByFeature(feature)[
                                'max'
                            ]
                    }
                };
            }

            return node;
        });
    };

    updateFilterNodeData = (nodeID, dataKey, dataValue) => {
        this.nodes = this.nodes.map(node => {
            if (node.id === nodeID) {
                node.data = {
                    ...node.data
                };
                node.data[dataKey] = dataValue;
            }

            return node;
        });
    };

    updateSearchNodeData = (nodeID, dataValue) => {
        this.nodes = this.nodes.map(node => {
            if (node.id === nodeID) {
                node.data = {
                    ...node.data
                };
                node.data['keyphrase'] = dataValue;
            }
            return node;
        });
    };

    updateActions = () => {
        this.nodes = [...this.nodes];
        this.edges = [...this.edges];
    };

    getDefaultValue = feature => {
        switch (this.store.search.nodeTypes[feature]) {
            case 'string':
            case 'list':
                return '';
            case 'category':
                return this.store.search.searchHints[feature].values[0];
            default:
                return this.store.search.searchHints[feature].min;
        }
    };

    addNewAction = (nodeType, position) => {
        const data = { children: [], parents: [] };

        if (nodeType === 'searchNode') {
            data.features = Object.keys(this.store.search.nodeTypes);
            data.feature = Object.keys(this.store.search.nodeTypes)[0];
            data.featureHints = this.store.search.searchHints;
            data.featureTypes = this.store.search.nodeTypes;
            data.updateActions = this.updateActions;
            data.getSuggestions = this.store.search.suggest;
            data.updateSearchNodeData = this.updateSearchNodeData;
            data.keyphrase = this.getDefaultValue(data.feature);
            data.getDefaultValue = this.getDefaultValue;
        }

        if (nodeType === 'datasetNode') {
            data.dataset = this.store.search.currentDataset;
        }

        if (nodeType === 'filterNode') {
            data.features = this.getNodeTypesOfType(['integer', 'float']);
            data.feature = this.getNodeTypesOfType(['integer', 'float'])[0];
            data.updateFilterNodeValues = this.updateFilterNodeValues;
            data.updateFilterNodeData = this.updateFilterNodeData;
            data.min = this.store.search.getSearchHintsByFeature(data.feature)[
                'min'
            ];
            data.max = this.store.search.getSearchHintsByFeature(data.feature)[
                'max'
            ];
            data.min_value = this.store.search.getSearchHintsByFeature(
                data.feature
            )['min'];
            data.max_value = this.store.search.getSearchHintsByFeature(
                data.feature
            )['max'];
        }

        if (nodeType === 'countsNode') {
            data.features = this.getNodeTypesOfType(['list']);
            data.feature = this.getNodeTypesOfType(['list'])[0];
            data.newFeatureName = '';
        }

        if (nodeType === 'keywordExtractionNode') {
            data.features = this.getNodeTypesOfType(['string']);
            data.feature = this.getNodeTypesOfType(['string'])[0];
            data.newFeatureName = '';
        }

        if (nodeType === 'connectorNode') {
            data.connector = 'or';
        }

        if (nodeType === 'resultsNode') {
            data.runWorkflow = this.runWorkFlow;
        }

        data.deleteNode = this.deleteNode;

        const newNode = {
            id: uuidv4(),
            type: nodeType,
            position,
            data,
            style: {
                border: `1px solid ${this.actionNodeColors[nodeType]}`,
                backgroundColor: this.actionNodeColors['background'],
                borderRadius: '10px',
                padding: '3px'
            }
        };
        this.nodes.push(newNode);
        this.nodes = [...this.nodes];
    };

    onConnect = connection => {
        const newConnection = {
            id: `e${connection.source}-${connection.target}`,
            source: connection.source,
            target: connection.target,
            type: 'searchEdge',
            data: {
                removeEdge: this.removeEdge
            }
        };

        this.nodes
            .find(node => node.id === connection.target)
            .data.parents.push(connection.source);

        this.nodes
            .find(node => node.id === connection.source)
            .data.children.push(connection.target);

        this.edges = [...this.edges, newConnection];
    };

    removeEdge = id => {
        const connection = this.edges.find(element => element.id === id);

        const source = this.nodes.find(
            element => element.id === connection.source
        );
        const target = this.nodes.find(
            element => element.id === connection.target
        );

        // Remove child from source
        this.nodes.find(node => node.id === source.id).data.children =
            this.nodes
                .find(node => node.id === source.id)
                .data.children.filter(id => id !== target.id);

        // Remove parent from target
        this.nodes.find(node => node.id === target.id).data.parents = this.nodes
            .find(node => node.id === target.id)
            .data.parents.filter(id => id !== source.id);

        this.edges = this.edges.filter(element => element.id !== id);
    };

    runWorkFlow = resultsNodeId => {
        this.nodes = [...this.nodes];
        const generatedQuery = this.getQuery(resultsNodeId, this.nodes);

        this.store.search.setAdvancedSearchQuery(generatedQuery);
        this.shouldRunWorkflow = true;
    };

    getQuery = (id, nodes) => {
        const node = nodes.find(element => element.id === id);

        if (node.data.parents.length === 0) {
            switch (node.type) {
                case 'searchNode':
                    return {
                        action: 'search',
                        feature: node.data.feature,
                        keyphrase: node.data.keyphrase
                    };
                case 'datasetNode':
                    return {
                        action: 'get dataset',
                        dataset: node.data.dataset
                    };
                default:
                    return {
                        action: 'filter',
                        feature: node.data.feature,
                        min: node.data.min,
                        max: node.data.max
                    };
            }
        }

        if (node.type === 'connectorNode') {
            return {
                action: 'connect',
                connector: node.data.connector,
                queries: node.data.parents.map(parent =>
                    this.getQuery(parent, nodes)
                )
            };
        }

        if (node.type === 'resultsNode') {
            return {
                action: 'visualise',
                query: this.getQuery(node.data.parents[0], nodes)
            };
        }

        if (node.type === 'countsNode') {
            return {
                action: 'count array',
                feature: node.data.feature,
                newFeatureName: node.data.newFeatureName,
                query: this.getQuery(node.data.parents[0], nodes)
            };
        }

        if (node.type === 'keywordExtractionNode') {
            return {
                action: 'extract keywords',
                feature: node.data.feature,
                newFeatureName: node.data.newFeatureName,
                query: this.getQuery(node.data.parents[0], nodes)
            };
        }

        return null;
    };
}
