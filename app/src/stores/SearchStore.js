import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { format } from 'date-fns';
import { safeRequest } from 'general.utils';

export class SearchStore {
    nodeTypes = {};
    newNodeTypes = {};
    anchor = '';
    links = [];
    schema = [];
    schemas = [];
    default_schemas = {};
    datasets = [];
    searchHints = {};
    query = '';
    advancedSearchQuery = '';
    searchID = '';
    default_search_features = [];

    currentDataset = null;
    currentDatasetIndex = 0;
    searchIsEmpty = false;
    datasetEdit = false;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
        this.getDatasets();
    }

    setSearchID = val => (this.searchID = val);

    setSearchQuery = val => (this.query = val);

    setAnchor = val => (this.anchor = val);

    setAdvancedSearchQuery = val => (this.advancedSearchQuery = val);

    setSearchIsEmpty = searchIsEmpty => (this.searchIsEmpty = searchIsEmpty);

    getNodeTypeByFeature = feature => this.nodeTypes[feature];

    getSearchHintsByFeature = feature => this.searchHints[feature];

    setLinks = val => {
        this.links = val;
    };

    useDataset = index => {
        if (!this.datasets.length) {
            return;
        }

        try {
            this.currentDataset = this.datasets[index];
            this.currentDatasetIndex = index;

            localStorage.setItem('currentDataset', this.currentDataset);
            localStorage.setItem(
                'currentDatasetIndex',
                this.currentDatasetIndex
            );

            const dataset_config = JSON.parse(
                this.getLocalStorageDataset(this.datasets[index])
            );

            this.links = dataset_config.links;

            this.schema = dataset_config.schemas[0]['relations'];

            this.schemas = dataset_config.schemas;

            this.default_schemas = dataset_config.default_schemas;
            this.searchHints = dataset_config.search_hints;
            this.default_search_features = dataset_config.default_search_fields;

            this.nodeTypes = dataset_config.types;
            this.anchor = dataset_config.anchor;
            this.store.schema.populateStoreData();
            this.store.overviewSchema.populateStoreData();
        } catch (error) {
            this.store.core.setErrorDetails(
                `There seems to be an issue loading the dataset ${
                    this.datasets[index]
                }. The following error was returned: ${error.toString()}`
            );
        }
    };

    changeSelectedSchema = selectedSchema => {
        this.schema =
            this.schemas[
                this.schemas.findIndex(entry => entry.name === selectedSchema)
            ]['relations'];
        this.store.schema.populateStoreData();
        this.store.overviewSchema.populateStoreData();
    };

    getLocalStorageDataset = dataset_name =>
        localStorage.getItem(`index_${dataset_name}`);

    setLocalStorageDataset = (dataset_name, dataset) => {
        localStorage.setItem(`index_${dataset_name}`, JSON.stringify(dataset));
    };

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

    getDatasets = async () => {
        const { response, error } = await safeRequest(axios.get('datasets/'));

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        // Initialise dataset locally and set the current dataset
        this.initDatasets(response.data);

        const currentDataset = localStorage.getItem('currentDataset');

        if (currentDataset && this.datasets.includes(currentDataset)) {
            this.useDataset(this.datasets.indexOf(currentDataset));
        } else {
            this.useDataset(0);
        }
    };

    search = async (query, nodeTypes, schema, graphType, search_uuid) => {
        // Set search parameters

        const params = {
            search_uuid: search_uuid,
            query: query,
            anchor: this.anchor,
            graph_type: graphType,
            visible_entries: [],
            user_id: this.store.core.userUuid,
            study_id: this.store.core.studyUuid,
            action_time: format(new Date(), 'H:mm do MMM yyyy OOOO')
        };

        if (graphType === 'overview') {
            params.anchor_properties =
                this.store.overviewSchema.anchorProperties;
        } else {
            params.anchor_properties = [];
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

            params.visible_entries = [...new Set(entryArray)];
        } else {
            params.visible_entries = [];
        }

        params['links'] = this.links;

        // Set schema by using the provided schema or reading from store
        if (schema && schema.length) {
            params['graph_schema'] = schema;
        } else if (localStorage.getItem('schema')) {
            params['graph_schema'] = this.store.schema.getServerSchema();
        } else {
            params['graph_schema'] = [];
        }

        // Set the node types the user wants to view
        if (nodeTypes && Object.keys(nodeTypes).length) {
            params['visible_dimensions'] = nodeTypes;
        } else {
            params['visible_dimensions'] = [];
        }

        // Set selected index
        params['index'] = localStorage.getItem('currentDataset');

        const { response, error } = await safeRequest(
            axios.post('search/', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        return response.data;
    };

    deleteDataset = async dataset => {
        const { error } = await safeRequest(
            axios.delete(`datasets/${dataset}`)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.store.core.setToastType('info');
        this.store.core.setToastMessage(
            `${dataset.charAt(0).toUpperCase()}${dataset.slice(
                1
            )} dataset deleted 🙂`
        );
        localStorage.removeItem(`index_${dataset}`);
        this.getDatasets();
    };

    getConifg = async dataset => {
        const { response, error } = await safeRequest(
            axios.get(`datasets/${dataset}/settings`)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.store.fileUpload.populateDataFromConfig(
            dataset,
            response.data.config
        );
    };

    suggest = async (feature, input) => {
        const { response, error } = await safeRequest(
            axios.get(
                `datasets/${this.currentDataset}/search/suggest?feature=${feature}&value=${input}`
            )
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return [];
        }

        return response.data;
    };

    getRandomImage = async () => {
        const { response, error } = await safeRequest(axios.get('utils/image'));

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        return response.data;
    };
}
