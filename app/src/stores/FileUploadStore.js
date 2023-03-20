import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { safeRequest } from 'general.utils';
import { v4 as uuidv4 } from 'uuid';

export class FileUploadStore {
    fileUploadData = {
        name: '',
        originalName: '',
        anchor: '',
        link: '',
        defaults: {},
        schemas: {
            overview: [],
            detail: []
        }
    };
    fileUploadErrors = {
        defaultVisible: false,
        defaultSearchable: false,
        defaultLinks: false
    };
    showFileUploadError = false;
    showFileUploadModal = false;
    showConfigChangeModal = false;
    isPopulating = false;

    constructor(store) {
        this.store = store;
        makeAutoObservable(this, {}, { deep: true });
    }

    setIsPopulating = val => (this.isPopulating = val);

    changeFileUploadModalVisiblity = val => (this.showFileUploadModal = val);

    changeConfigChangeModalVisiblity = val =>
        (this.showConfigChangeModal = val);

    resetFileUploadData = () =>
        (this.fileUploadData = {
            name: '',
            originalName: '',
            anchor: '',
            link: '',
            defaults: {},
            schemas: {
                overview: [],
                detail: []
            }
        });

    uploadFile = async files => {
        this.changeFileUploadModalVisiblity(true);

        const formData = new FormData();
        formData.append('file', files[0]);
        const requestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const { response, error } = await safeRequest(
            axios.post('datasets', formData, requestConfig)
        );

        if (error) {
            this.store.core.handleRequestError(error);
            this.changeFileUploadModalVisiblity(false);
        } else {
            Object.keys(response.data.columns).forEach((column, index) => {
                this.fileUploadData.defaults[column] = {
                    name: column,
                    isDefaultVisible: false,
                    isDefaultSearch: false,
                    isDefaultLink: index === 1,
                    dataType: response.data.columns[column],
                    removeIfNull: false
                };

                if (index === 1) {
                    this.changeDefaultLink(column);
                }

                if (
                    this.isDefaultSarchNotSelected() &&
                    ['string', 'integer'].includes(
                        response.data.columns[column]
                    )
                ) {
                    this.changeDefaultSearch(column);
                }
            });

            this.changeOriginalName(response.data.name);
            this.changeFileUplodAnchor(Object.keys(response.data.columns)[0]);
            this.changeDatasetName(response.data.name);
        }
    };

    addDefaultSchema = (name, graphType) => {
        if (graphType === 'overview') {
            this.fileUploadData.schemas[graphType].push({
                id: uuidv4(),
                name: name,
                links: this.store.overviewSchema.links,
                anchor: this.store.overviewSchema.anchor,
                anchorProperties: this.store.overviewSchema.anchorProperties
            });
        } else {
            this.fileUploadData.schemas[graphType].push({
                id: uuidv4(),
                name: name,
                nodes: this.store.schema.nodes,
                edges: this.store.schema.edges
            });
        }
    };

    deleteDefaultSchema = (id, graphType) => {
        this.fileUploadData.schemas[graphType] = this.fileUploadData.schemas[
            graphType
        ].filter(schema => schema.id !== id);
    };

    changeOriginalName = val => (this.fileUploadData.originalName = val);

    changeFileUplodColumnType = (column, columnType) => {
        this.fileUploadData.defaults[column].dataType = columnType;
    };

    changeFileUplodAnchor = val => {
        if (this.fileUploadData.anchor !== '') {
            this.fileUploadData.defaults[this.fileUploadData.anchor][
                'isDefaultVisible'
            ] = false;
        }

        this.fileUploadData.defaults[val]['isDefaultVisible'] = true;
        this.fileUploadData.anchor = val;
    };

    changeDefaultLink = val => {
        if (this.fileUploadData.link !== '') {
            this.fileUploadData.defaults[this.fileUploadData.link][
                'isDefaultLink'
            ] = false;
            this.fileUploadData.defaults[this.fileUploadData.link][
                'isDefaultVisible'
            ] = false;
        }

        this.fileUploadData.defaults[val]['isDefaultVisible'] = true;
        this.fileUploadData.defaults[val]['isDefaultLink'] = true;
        this.fileUploadData.link = val;
    };

    changeDefaultSearch = column => {
        Object.keys(this.fileUploadData.defaults).forEach(
            col =>
                (this.fileUploadData.defaults[col]['isDefaultSearch'] = false)
        );

        this.fileUploadData.defaults[column]['isDefaultSearch'] = true;
    };

    changeColumnName = (column, val) => {
        this.fileUploadData.defaults[column].name = val;
    };

    changeDatasetName = val => (this.fileUploadData.name = val);

    isDefaultSarchNotSelected = () =>
        (this.fileUploadErrors.defaultSearchable = !Object.keys(
            this.fileUploadData.defaults
        ).some(column => this.fileUploadData.defaults[column].isDefaultSearch));

    setDefaults = async () => {
        if (this.showFileUploadError) {
            return false;
        }

        this.setIsPopulating(true);

        let params = {
            original_name: this.fileUploadData.originalName,
            name: this.fileUploadData.name,
            anchor: this.fileUploadData.anchor,
            defaults: this.fileUploadData.defaults,
            default_schemas: this.fileUploadData.schemas
        };

        const { error } = await safeRequest(
            axios.post('datasets/settings', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
        }

        this.resetFileUploadData();
        this.changeFileUploadModalVisiblity(false);
        this.setIsPopulating(false);
        this.store.search.getDatasets();
        this.store.core.setToastType('success');
        this.store.core.setToastMessage('New dataset added 🥳');
    };

    cancelFileUpload = async () => {
        // const params = { name: this.fileUploadData.originalName };

        // const { error } = await safeRequest(
        //     axios.get('file/cancel', { params })
        // );
        const { error } = await safeRequest(
            axios.delete(`datasets/${this.fileUploadData.originalName}`)
        );

        if (error) {
            this.changeFileUploadModalVisiblity(false);
            this.store.core.handleRequestError(error);
        } else {
            this.resetFileUploadData();
            this.changeFileUploadModalVisiblity(false);
            this.store.core.setToastType('info');
            this.store.core.setToastMessage('File upload canceled 😢');
        }
    };

    populateDataFromConfig = (dataset, config) => {
        Object.keys(config.dimension_types).forEach(dim => {
            this.fileUploadData.defaults[dim] = {
                name: dim,
                isDefaultVisible:
                    config.default_visible_dimensions.includes(dim),
                isDefaultSearch: config.default_search_fields.includes(dim),
                isDefaultLink: config.links.includes(dim),
                dataType: config.dimension_types[dim]
            };
        });

        this.fileUploadData.link = config.links[0];
        this.fileUploadData.anchor = config.anchor;
        this.changeDatasetName(dataset);
        this.changeConfigChangeModalVisiblity(true);
    };

    updateConfig = async () => {
        const params = {
            name: this.fileUploadData.name,
            anchor: this.fileUploadData.anchor,
            defaults: this.fileUploadData.defaults
        };

        const { error } = await safeRequest(
            axios.put('datasets/settings', params)
        );

        if (error) {
            this.store.core.handleRequestError(error);
        }

        this.resetFileUploadData();
        this.changeConfigChangeModalVisiblity(false);
        this.store.search.getDatasets();

        this.store.core.setToastType('success');
        this.store.core.setToastMessage('Config successfully updated 🥳');
    };
}
