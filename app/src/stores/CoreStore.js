import { makeAutoObservable } from 'mobx';

export class CoreStore {
    availableDatasets = [];
    demoMode = false;
    demoNavigationData = [];
    activeDemoIndex = 1;
    errorMessage = null;
    errorDetails = null;
    showSpinner = false;
    currentGraph = '';

    visibleDimensions = { overview: [], detail: [] };

    constructor(store) {
        this.store = store;
        makeAutoObservable(this, {}, { deep: true });
    }

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

    toggleSpinner = showSpinner => {
        this.showSpinner = showSpinner;
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
