import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowStore {
    shouldRunWorkflow = false;

    actionNodeTypes = [
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
        filterNode: '#31cebf',
        countsNode: '#31cebf',
        connectorNode: '#323232',
        resultsNode: '#4da344',
        keywordExtractionNode: '#31cebf'
    };

    actions = [];

    setShouldRunWorkflow = val => {
        this.shouldRunWorkflow = val;
    };

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
    }

    resetWorkflow = () => {
        this.actions = [];
    };

    addNewAction = (nodeType, position) => {
        const data = { children: [], parents: [] };

        if (nodeType === 'searchNode') {
            data.features = Object.keys(this.store.search.nodeTypes);
            data.feature = Object.keys(this.store.search.nodeTypes)[0];
            data.keyphrase = '';
        }

        if (nodeType === 'filterNode') {
            data.features = Object.keys(this.store.search.nodeTypes);
            data.feature = Object.keys(this.store.search.nodeTypes)[0];
            data.min = 0;
            data.max = 0;
        }

        if (['countsNode', 'keywordExtractionNode'].includes(nodeType)) {
            data.features = Object.keys(this.store.search.nodeTypes);
            data.feature = Object.keys(this.store.search.nodeTypes)[0];
            data.newFeatureName = '';
        }

        if (nodeType === 'connectorNode') {
            data.connector = 'or';
        }

        if (nodeType === 'resultsNode') {
            data.runWorkflow = this.runWorkFlow;
        }

        const newNode = {
            id: uuidv4(),
            type: nodeType,
            position,
            data,
            style: {
                backgroundColor: this.actionNodeColors[nodeType],
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
            if (node.type === 'searchNode') {
                return {
                    action: 'search',
                    feature: node.data.feature,
                    keyphrase: node.data.keyphrase
                };
            } else {
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
