import axios from 'axios';
import { makeAutoObservable } from 'mobx';

export class FileUploadStore {
    fileUploadData = {
        name: '',
        originalName: '',
        anchor: '',
        link: '',
        defaults: {}
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
            defaults: {}
        });

    uploadFile = async files => {
        const formData = new FormData();
        formData.append('file', files[0]);

        const response = await axios.post('file/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        Object.keys(response.data.columns).forEach(
            column =>
                (this.fileUploadData.defaults[column] = {
                    name: column,
                    isDefaultVisible: false,
                    isDefaultSearch: false,
                    isDefaultLink: false,
                    dataType: response.data.columns[column],
                    removeIfNull: false
                })
        );

        this.changeOriginalName(response.data.name);
        this.changeFileUplodAnchor(Object.keys(response.data.columns)[0]);
        this.changeDatasetName(response.data.name);

        return true;
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

    changeDefaultBoolToggle = (column, feature) => {
        this.fileUploadData.defaults[column][feature] =
            !this.fileUploadData.defaults[column][feature];

        if (feature === 'isDefaultLink') {
            this.fileUploadData.defaults[column]['isDefaultVisible'] =
                !this.fileUploadData.defaults[column]['isDefaultVisible'];
        }
    };

    changeColumnName = (column, val) => {
        this.fileUploadData.defaults[column].name = val;
    };

    changeDatasetName = val => (this.fileUploadData.name = val);

    isVisibleByDefaultSelected = () =>
        (this.fileUploadErrors.defaultVisible = !Object.keys(
            this.fileUploadData.defaults
        ).some(
            column => this.fileUploadData.defaults[column].isDefaultVisible
        ));

    isDefaultLinkSelected = () =>
        (this.fileUploadErrors.defaultLinks = !Object.keys(
            this.fileUploadData.defaults
        ).some(column => this.fileUploadData.defaults[column].isDefaultLink));

    isDefaultSarchSelected = () =>
        (this.fileUploadErrors.defaultSearchable = !Object.keys(
            this.fileUploadData.defaults
        ).some(column => this.fileUploadData.defaults[column].isDefaultSearch));

    setDefaults = async () => {
        this.isVisibleByDefaultSelected();
        this.isDefaultLinkSelected();
        this.isDefaultSarchSelected();
        this.showFileUploadError = Object.keys(this.fileUploadErrors).some(
            errorCode => this.fileUploadErrors[errorCode]
        );

        if (this.showFileUploadError) {
            return false;
        }

        this.setIsPopulating(true);

        const params = {
            original_name: this.fileUploadData.originalName,
            name: this.fileUploadData.name,
            anchor: this.fileUploadData.anchor,
            defaults: JSON.stringify(this.fileUploadData.defaults)
        };

        try {
            await axios.get('file/settings', { params });
        } catch (error) {
            this.store.core.handleError(error);
        }

        this.resetFileUploadData();
        this.changeFileUploadModalVisiblity(false);
        this.setIsPopulating(false);
        this.store.search.getDatasets();
        this.store.core.setToastType('success');
        this.store.core.setToastMessage('New dataset added 🥳');
    };

    cancelFileUpload = async () => {
        const params = { name: this.fileUploadData.originalName };

        try {
            await axios.get('file/cancel', { params });
            this.resetFileUploadData();
            this.changeFileUploadModalVisiblity(false);
            this.store.core.setToastType('info');
            this.store.core.setToastMessage('File upload canceled 😢');
        } catch (error) {
            this.store.core.handleError(error);
            this.changeFileUploadModalVisiblity(false);
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
        this.isVisibleByDefaultSelected();
        this.isDefaultLinkSelected();
        this.isDefaultSarchSelected();
        this.showFileUploadError = Object.keys(this.fileUploadErrors).some(
            errorCode => this.fileUploadErrors[errorCode]
        );

        if (this.showFileUploadError) {
            return false;
        }

        const params = {
            name: this.fileUploadData.name,
            anchor: this.fileUploadData.anchor,
            defaults: JSON.stringify(this.fileUploadData.defaults)
        };

        try {
            await axios.get('file/settingsupdate', { params });
        } catch (error) {
            this.store.core.handleError(error);
        }

        this.resetFileUploadData();
        this.changeConfigChangeModalVisiblity(false);
        this.store.search.getDatasets();

        this.store.core.setToastType('success');
        this.store.core.setToastMessage('Config successfully updated 🥳');
    };
}
