import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { uniqueNamesGenerator, animals, colors } from 'unique-names-generator';

export class CoreStore {
    availableDatasets = [];
    demoMode = false;
    demoNavigationData = [];
    activeDemoIndex = 1;
    errorMessage = null;
    errorDetails = null;
    currentGraph = '';
    userUuid = null;
    studyUuid = null;
    studyName = null;
    studyDescription = '';
    studyIsSaved = false;
    studies = [];

    visibleDimensions = { overview: [], detail: [] };
    toastInfo = {
        message: '',
        type: 'info'
    };

    constructor(store) {
        this.store = store;
        this.userUuid = localStorage.getItem('useruuid');

        if (!this.userUuid) {
            this.generateUUID();
        }
        this.getSavedStudies();

        makeAutoObservable(this, {}, { deep: true });
    }

    updateIsStudySaved = val => (this.studyIsSaved = val);

    generateUUID = async () => {
        await axios.get('util/uuid').then(response => {
            localStorage.setItem('useruuid', response.data);
            this.userUuid = response.data;
        });
    };

    generateStudyUUID = async () => {
        this.studyName = uniqueNamesGenerator({
            dictionaries: [colors, animals],
            separator: ' ',
            length: 2,
            seed: this.studyUuid
        });

        const params = { user_uuid: this.userUuid, study_name: this.studyName };

        await axios.get('study/generate', { params }).then(response => {
            localStorage.setItem('studyuuid', response.data);
            console.log(`study id changed to ${response.data}`);
            this.studyUuid = response.data;
        });
    };

    deleteStudy = studyUuid => {
        if (!this.studyIsSaved || studyUuid) {
            const params = {
                study_uuid: studyUuid ? studyUuid : this.studyUuid,
                user_uuid: this.userUuid
            };

            if (studyUuid) {
                axios.get('study/delete', { params }).then(() => {
                    this.getSavedStudies();
                });
            } else {
                axios.get('study/delete', { params });
            }
        }
    };

    saveStudy = () => {
        const params = {
            study_uuid: this.studyUuid,
            user_uuid: this.userUuid
        };
        axios.get('study/save', { params });
        this.updateIsStudySaved(true);
    };

    getSavedStudies = async () => {
        const params = { user_uuid: this.userUuid };

        await axios.get('study/saved', { params }).then(response => {
            this.studies = response.data;
        });
    };

    setToastMessage = message => (this.toastInfo.message = message);
    setToastType = toastType => (this.toastInfo.type = toastType);

    setCurrentGraph = graphType => {
        this.currentGraph = graphType;
        this.store.graph.updateTableColumns();
    };

    setVisibleDimensions = dimensions => {
        this.visibleDimensions[this.currentGraph] = dimensions;
    };

    resetVisibleDimensions = () => {
        this.visibleDimensions = { overview: [], detail: [] };
    };

    setErrorMessage = message => {
        this.errorMessage = message;
    };

    setDemoMode = val => {
        this.demoMode = val;
    };

    setActiveDemoIndex = val => {
        this.activeDemoIndex = val;
    };

    setDemoNavigationData = data => {
        this.demoNavigationData = data;
    };

    toggleVisibleDimension = dimension => {
        if (this.visibleDimensions[this.currentGraph].includes(dimension)) {
            this.visibleDimensions[this.currentGraph].splice(
                this.visibleDimensions[this.currentGraph].indexOf(dimension),
                1
            );
        } else {
            this.visibleDimensions[this.currentGraph].push(dimension);
        }
    };

    get isOverview() {
        return this.currentGraph === 'overview';
    }
    get isDetail() {
        return this.currentGraph === 'detail';
    }

    handleError = error => {
        console.log(error);
        this.errorMessage = error;

        if (error.response) {
            this.errorDetails = `${error.response.data} ${error.response.status} ${error.response.headers}`;
            console.log('data ', error.response.data);
            console.log('status ', error.response.status);
            console.log('headers ', error.response.headers);
        }
    };
}
