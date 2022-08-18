import axios from 'axios';
import { makeAutoObservable } from 'mobx';

export class SearchStore {
    nodeTypes = {};
    newNodeTypes = {};
    anchor = '';
    links = [];
    schema = [];
    schemas = [];
    datasets = [];
    searchHints = {};

    currentDataset = null;
    currentDatasetIndex = 0;
    searchIsEmpty = false;
    advancedSearchQuery = '';
    datasetEdit = false;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
        this.getDatasets();
    }

    setAdvancedSearchQuery = val => (this.advancedSearchQuery = val);

    setSearchIsEmpty = searchIsEmpty => (this.searchIsEmpty = searchIsEmpty);

    getNodeTypeByFeature = feature => this.nodeTypes[feature];

    getSearchHintsByFeature = feature => this.searchHints[feature];

    useDataset = index => {
        if (!this.datasets.length) {
            return;
        }
        this.currentDataset = this.datasets[index];
        this.currentDatasetIndex = index;

        localStorage.setItem('currentDataset', this.currentDataset);
        localStorage.setItem('currentDatasetIndex', this.currentDatasetIndex);

        const dataset_config = JSON.parse(
            this.getLocalStorageDataset(this.datasets[index])
        );

        this.links = dataset_config.links;

        this.schema = dataset_config.schemas[0]['relations'];
        this.schemas = dataset_config.schemas;
        this.searchHints = dataset_config.search_hints;

        this.nodeTypes = dataset_config.types;
        this.anchor = dataset_config.anchor;
        this.store.schema.populateStoreData();
    };

    changeSelectedSchema = selectedSchema => {
        this.schema =
            this.schemas[
                this.schemas.findIndex(entry => entry.name === selectedSchema)
            ]['relations'];
        this.store.schema.populateStoreData();
    };

    getLocalStorageDataset = dataset_name =>
        localStorage.getItem(`index_${dataset_name}`);

    setLocalStorageDataset = (dataset_name, dataset) =>
        localStorage.setItem(`index_${dataset_name}`, JSON.stringify(dataset));

    initDatasets = datasets => {
        this.datasets = [];

        for (let dataset_name in datasets) {
            this.setLocalStorageDataset(dataset_name, datasets[dataset_name]);

            if (!this.datasets.includes(dataset_name)) {
                this.datasets.push(dataset_name);
            }
        }
    };

    updateCurrentDatasetSchema = schema => {
        const dataset_config = JSON.parse(
            this.getLocalStorageDataset(this.currentDataset)
        );

        dataset_config['schema'] = schema;

        this.setLocalStorageDataset(this.currentDataset, dataset_config);
    };

    getDatasets = () => {
        axios
            .get('search/datasets')
            .then(response => {
                // Initialise dataset locally and set the current dataset
                this.initDatasets(response.data);

                const currentDataset = localStorage.getItem('currentDataset');

                if (currentDataset && this.datasets.includes(currentDataset)) {
                    this.useDataset(this.datasets.indexOf(currentDataset));
                } else {
                    this.useDataset(0);
                }
            })
            .catch(error => this.store.core.handleError(error));
    };

    search = async (query, nodeTypes, schema, graphType, search_uuid) => {
        // Set search parameters

        const params = {
            search_uuid: search_uuid,
            query: query,
            anchor: this.anchor,
            graph_type: graphType,
            visible_entries: [],
            user_id: this.store.core.userUuid
        };

        if (graphType === 'overview') {
            params.anchor_properties = JSON.stringify(
                this.store.schema.overviewDataNodeProperties
            );
        }

        if (
            graphType === 'detail' &&
            this.store.graph.graphData.selectedComponents.length
        ) {
            const entryArray = this.store.graph.graphData.components
                .filter(component =>
                    this.store.graph.graphData.selectedComponents.includes(
                        component.id
                    )
                )
                .reduce(
                    (entries, component) => entries.concat(component.entries),
                    []
                );

            params.visible_entries = JSON.stringify([...new Set(entryArray)]);
        }

        params['links'] = JSON.stringify(this.links);

        // Set schema by using the provided schema or reading from store
        if (schema && schema.length) {
            params['schema'] = JSON.stringify(schema);
        } else if (localStorage.getItem('schema')) {
            params['schema'] = JSON.stringify(
                this.store.schema.getServerSchema()
            );
        }

        // Set the node types the user wants to view
        if (nodeTypes && Object.keys(nodeTypes).length) {
            params['visible_dimensions'] = JSON.stringify(nodeTypes);
        }

        // Set selected index
        params['index'] = localStorage.getItem('currentDataset');

        try {
            const response = await axios.get('search', { params });
            return response.data;
        } catch (error) {
            return this.store.core.handleError(error);
        }
    };

    deleteDataset = async dataset => {
        const params = {
            name: dataset
        };

        try {
            await axios.get('file/delete', { params });
            this.store.core.setToastType('info');
            this.store.core.setToastMessage(
                `${dataset.charAt(0).toUpperCase()}${dataset.slice(
                    1
                )} dataset deleted 🙂`
            );
            localStorage.removeItem(`index_${dataset}`);
            this.getDatasets();
        } catch (error) {
            this.store.core.handleError(error);
        }
    };

    getConifg = async dataset => {
        const params = {
            name: dataset
        };

        try {
            const results = await axios.get('file/config', { params });
            this.store.fileUpload.populateDataFromConfig(
                dataset,
                results.data.config
            );
        } catch (error) {
            this.store.core.handleError(error);
        }
    };
}
