import axios from 'axios';
import { makeAutoObservable } from 'mobx';
import { uniqueNamesGenerator, animals, colors } from 'unique-names-generator';
import { isEnvSet, safeRequest } from 'general.utils';

export class CoreStore {
    availableDatasets = [];
    demoMode = false;
    demoNavigationData = [];
    activeDemoIndex = 1;
    errorDetails = null;
    currentGraph = '';
    userUuid = null;
    studyUuid = null;
    studyName = '';
    studyDescription = '';
    studyAuthor = '';
    studyHistory = [];
    studyIsEmpty = false;
    studyHistoryItemIndex = 0;
    studyIsSaved = false;
    isStudyPublic = false;
    studyPublicURL = '';
    showCommentModal = false;
    studies = [];
    dataIsLoading = false;
    hideCookieBanner = false;
    trackingEnabled = false;
    colorMode = null;
    showCookieInfo = false;
    isSchemaNodeTypeBound = true;
    isLeftSidePanelOpen = true;
    isRightSidePanelOpen = false;
    rightPanelType = '';
    rightPanelTypeToOpen = null;
    rightPanelWidth = 0;
    surveyHidden = false;
    surveyHistoryDepthTrigger = 3;
    dataModificationMessage = null;

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
        this.hideCookieBanner = this.getCookieBanner();
        this.trackingEnabled =
            localStorage.getItem('trackingenabled') === 'true';
        this.surveyHidden = localStorage.getItem('surveyhidden') === 'true';
        if (isEnvSet('REACT_APP_SURVEY_SHOW_AFTER_HISTORY_DEPTH')) {
            this.surveyHistoryDepthTrigger = parseInt(
                isEnvSet('REACT_APP_SURVEY_SHOW_AFTER_HISTORY_DEPTH')
            );
        }

        this.colorMode = localStorage.getItem('chakra-ui-color-mode');

        makeAutoObservable(this, {}, { deep: true });
    }

    addCommentToCurrentHistoryItem = comment => {
        this.studyHistory[this.studyHistoryItemIndex].comments.push(comment);
    };

    setDataModificationMessage = message =>
        (this.dataModificationMessage = message);

    deleteCommentFromCurrentHistoryItem = id => {
        const commentIndex = this.studyHistory[
            this.studyHistoryItemIndex
        ].comments.findIndex(comment => comment.id === id);

        this.studyHistory[this.studyHistoryItemIndex].comments.splice(
            commentIndex,
            1
        );
    };

    editCommentFromCurrentHistoryItem = (index, newComment) => {
        this.studyHistory[this.studyHistoryItemIndex].comments[index] =
            newComment;

        this.studyHistory[this.studyHistoryItemIndex].comments = [
            ...this.studyHistory[this.studyHistoryItemIndex].comments
        ];
    };

    setSurveyHidden = val => {
        this.surveyHidden = val;
        localStorage.setItem('surveyhidden', val);
    };

    setStudyIsEmpty = val => (this.studyIsEmpty = val);

    setRightPanelTypeToOpen = val => (this.rightPanelTypeToOpen = val);

    setIsStudyPublic = val => (this.isStudyPublic = val);

    toggleIsStudyPublic = async () => {
        this.setIsStudyPublic(!this.isStudyPublic);

        const params = {
            public: this.isStudyPublic
        };

        const { response, error } = await safeRequest(
            axios.patch(`studies/${this.studyUuid}`, params, {
                headers: { user_id: this.userUuid }
            })
        );

        if (error) {
            this.handleRequestError(error);
            return;
        }

        this.setStudyPublicURL(response.data);
    };

    setStudyPublicURL = val => (this.studyPublicURL = val);
    setIsLeftSidePanelOpen = val => (this.isLeftSidePanelOpen = val);
    setIsRightSidePanelOpen = val => (this.isRightSidePanelOpen = val);
    setRightPanelType = val => (this.rightPanelType = val);

    setIsSchemaNodeTypeBound = val => {
        this.isSchemaNodeTypeBound = val;
        if (val) {
            this.updateVisibleDimensionsBasedOnSchema();
            this.store.schema.refreshNodeStyles();
            this.store.schema.setSchemaHasChanges(true);
        }
    };

    setRightPanelWidth = val => (this.rightPanelWidth = val);

    setShowCookieInfo = val => (this.showCookieInfo = val);

    setDataIsLoading = val => (this.dataIsLoading = val);

    setShowCommentModal = val => (this.showCommentModal = val);

    updateIsStudySaved = val => (this.studyIsSaved = val);

    updateStudies = val => (this.studies = val);

    setStudyName = name => (this.studyName = name);

    setStudyAuthor = author => (this.studyAuthor = author);

    setColorMode = val => (this.colorMode = val);

    setErrorDetails = val => (this.errorDetails = val);

    setStudyDescription = description => (this.studyDescription = description);
    setStudyUuid = id => {
        this.studyUuid = id;
        localStorage.setItem('studyuuid', id);
    };

    setStudyQuery = () => {
        this.store.search.setSearchQuery(
            this.studyHistory[this.studyHistoryItemIndex].query
        );
    };

    setStudyHistory = history => (this.studyHistory = history);

    setStudyHistoryItemIndex = index => (this.studyHistoryItemIndex = index);

    setStudyHistoryItemIndexById = id => {
        for (let i = 0; i < this.studyHistory.length; i++) {
            if (this.studyHistory[i].id === id) {
                this.setStudyHistoryItemIndex(i);
                break;
            }
        }
    };

    updateStudyName = async name => {
        this.studyName = name;

        const params = {
            study_name: this.studyName
        };

        const { error } = await safeRequest(
            axios.patch(`studies/${this.studyUuid}`, params, {
                headers: { user_id: this.userUuid }
            })
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.updateIsStudySaved(true);
        this.getSavedStudies();
    };

    updateStudyAuthor = async author => {
        this.studyAuthor = author;

        const params = {
            study_author: this.studyAuthor
        };

        const { error } = await safeRequest(
            axios.patch(`studies/${this.studyUuid}`, params, {
                headers: { user_id: this.userUuid }
            })
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.updateIsStudySaved(true);
        this.getSavedStudies();
    };

    updateStudyDescription = async description => {
        this.studyDescription = description;

        const params = {
            study_description: this.studyDescription
        };

        const { error } = await safeRequest(
            axios.patch(`studies/${this.studyUuid}`, params, {
                headers: { user_id: this.userUuid }
            })
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.updateIsStudySaved(true);
        this.getSavedStudies();
    };

    setTrackingEnabled = val => {
        this.trackingEnabled = val;
        localStorage.setItem('trackingenabled', val);
        if (val) {
            this.store.track.initTracking();
        }
    };

    setHideCookieBanner = () => {
        this.hideCookieBanner = true;
        localStorage.setItem('hidecookiebanner', true);
    };

    getCookieBanner = () => {
        return localStorage.getItem('hidecookiebanner');
    };

    generateUUID = async () => {
        const { response, error } = await safeRequest(axios.get('utils/uuid'));

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        localStorage.setItem('useruuid', response.data);
        this.userUuid = response.data;
    };

    generateStudyUUID = async () => {
        this.studyName = uniqueNamesGenerator({
            dictionaries: [colors, animals],
            separator: ' ',
            length: 2,
            seed: this.studyUuid
        });

        this.studyDescription = '';

        const { response, error } = await safeRequest(
            axios.post(
                'studies',
                { study_name: this.studyName },
                {
                    headers: { user_id: this.userUuid }
                }
            )
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        localStorage.setItem('studyuuid', response.data);
        this.setStudyUuid(response.data);

        this.setStudyHistory([]);
        this.setStudyHistoryItemIndex(0);
    };

    deleteStudy = async studyUuid => {
        if ((!this.studyIsSaved && !studyUuid) || studyUuid) {
            const studyID = studyUuid ? studyUuid : this.studyUuid;

            if (studyID) {
                const { error } = await safeRequest(
                    axios.delete(`studies/${studyID}`, {
                        headers: { user_id: this.userUuid },
                        data: {}
                    })
                );

                if (error) {
                    this.store.core.handleRequestError(error);
                    return;
                }

                if (studyUuid) {
                    this.getSavedStudies();
                }
            }
        }
    };

    saveStudy = async () => {
        const params = {
            study_name: this.studyName,
            study_description: this.studyDescription,
            study_author: this.studyAuthor
        };

        const { error } = await safeRequest(
            axios.patch(`studies/${this.studyUuid}`, params, {
                headers: { user_id: this.userUuid }
            })
        );

        if (error) {
            this.store.core.handleRequestError(error);
            return;
        }

        this.updateIsStudySaved(true);
    };

    getSavedStudies = async () => {
        if (this.userUuid) {
            const { response, error } = await safeRequest(
                axios.get('studies', { headers: { user_id: this.userUuid } })
            );

            if (error) {
                this.store.core.handleRequestError(error);
                return;
            }

            this.updateStudies(response.data);
        }
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

    updateVisibleDimensionsBasedOnSchema = () => {
        if (this.isSchemaNodeTypeBound) {
            const connectedNodes = this.store.schema.getConnectedNodes();

            if (!connectedNodes.length) {
                this.visibleDimensions['detail'] = [
                    this.store.search.links,
                    this.store.search.anchor
                ].flat();
            } else {
                this.visibleDimensions['detail'] = connectedNodes;
            }
        }
    };

    get isOverview() {
        return this.currentGraph === 'overview';
    }
    get isDetail() {
        return this.currentGraph === 'detail';
    }

    handleRequestError = error => {
        this.setErrorDetails(error);

        switch (error['type']) {
            case 'response':
                this.store.track.trackEvent(
                    'Global',
                    'Response Error',
                    JSON.stringify({
                        url: error.url,
                        method: error.method,
                        statusCode: error.status,
                        message: error.data.detail[0].msg
                    })
                );

                break;
            case 'request':
                this.store.track.trackEvent(
                    'Global',
                    'Request Error',
                    JSON.stringify({
                        url: error.url,
                        method: error.method,
                        statusCode: error.status,
                        state: error.state
                    })
                );

                break;
            default:
                this.store.track.trackEvent(
                    'Global',
                    'Request setup error',
                    JSON.stringify({
                        url: error.url,
                        method: error.method,
                        message: error.message
                    })
                );

                break;
        }
    };
}
