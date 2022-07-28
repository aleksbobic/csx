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

    setNewWorkflowName = val => (this.newWorkflowName = val);

    saveNewWorkflow = () => {
        console.log(
            `Saving ${this.newWorkflowName} for ${this.store.search.currentDataset} with ${this.actions.length} actions`
        );

        if (!this.workflows[this.store.search.currentDataset]) {
            this.workflows[this.store.search.currentDataset] = {};
        }

        this.workflows[this.store.search.currentDataset][this.newWorkflowName] =
            this.actions;

        localStorage.setItem('workflows', JSON.stringify(this.workflows));
        this.newWorkflowName = '';
    };

    removeWorkflow = name => {
        delete this.workflows[this.store.search.currentDataset][name];

        localStorage.setItem('workflows', JSON.stringify(this.workflows));
    };

    loadWorkflow = name => {
        const loadedActions =
            this.workflows[this.store.search.currentDataset][name];

        const resultsNodes = loadedActions
            .filter(node => node.type === 'resultsNode')
            .map(node => {
                node.data.runWorkflow = this.runWorkFlow;
                return node;
            });

        const otherNodes = loadedActions.filter(
            node => node.type !== 'resultsNode'
        );

        this.actions = [...otherNodes, ...resultsNodes];
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
        this.actions = [];
    };

    getNodeTypesOfType = nodeTypes => {
        return Object.entries(this.store.search.nodeTypes)
            .filter(entry =>
                nodeTypes.includes(this.store.search.nodeTypes[entry[0]])
            )
            .map(entry => entry[0]);
    };

    deleteNode = nodeID => {
        this.actions = [
            ...this.actions.filter(
                node =>
                    (node.type !== 'searchEdge' && node.id !== nodeID) ||
                    (node.type === 'searchEdge' &&
                        node.source !== nodeID &&
                        node.target !== nodeID)
            )
        ];
    };

    addNewAction = (nodeType, position) => {
        const data = { children: [], parents: [] };

        if (nodeType === 'searchNode') {
            data.features = Object.keys(this.store.search.nodeTypes);
            data.feature = Object.keys(this.store.search.nodeTypes)[0];
            data.keyphrase = '';
        }

        if (nodeType === 'datasetNode') {
            data.dataset = this.store.search.currentDataset;
        }

        if (nodeType === 'filterNode') {
            data.features = this.getNodeTypesOfType(['integer', 'float']);
            data.feature = this.getNodeTypesOfType(['integer', 'float'])[0];
            data.min = 0;
            data.max = 0;
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
        this.actions.push(newNode);
        this.actions = [...this.actions];
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

        this.actions
            .find(node => node.id === connection.target)
            .data.parents.push(connection.source);

        this.actions
            .find(node => node.id === connection.source)
            .data.children.push(connection.target);

        this.actions = [...this.actions, newConnection];
    };

    removeEdge = id => {
        const connection = this.actions.find(element => element.id === id);

        const source = this.actions.find(
            element => element.id === connection.source
        );
        const target = this.actions.find(
            element => element.id === connection.target
        );

        // Remove child from source
        this.actions.find(node => node.id === source.id).data.children =
            this.actions
                .find(node => node.id === source.id)
                .data.children.filter(id => id !== target.id);

        // Remove parent from target
        this.actions.find(node => node.id === target.id).data.parents =
            this.actions
                .find(node => node.id === target.id)
                .data.parents.filter(id => id !== source.id);

        this.actions = this.actions.filter(element => element.id !== id);
    };

    runWorkFlow = resultsNodeId => {
        this.actions = [...this.actions];
        const generatedQuery = this.getQuery(resultsNodeId, this.actions);

        this.store.search.setAdvancedSearchQuery(generatedQuery);
        this.shouldRunWorkflow = true;
    };

    getQuery = (id, actions) => {
        const node = actions.find(element => element.id === id);

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
                    this.getQuery(parent, actions)
                )
            };
        }

        if (node.type === 'resultsNode') {
            return {
                action: 'visualise',
                query: this.getQuery(node.data.parents[0], actions)
            };
        }

        if (node.type === 'countsNode') {
            return {
                action: 'count array',
                feature: node.data.feature,
                newFeatureName: node.data.newFeatureName,
                query: this.getQuery(node.data.parents[0], actions)
            };
        }

        if (node.type === 'keywordExtractionNode') {
            return {
                action: 'extract keywords',
                feature: node.data.feature,
                newFeatureName: node.data.newFeatureName,
                query: this.getQuery(node.data.parents[0], actions)
            };
        }

        return null;
    };
}
