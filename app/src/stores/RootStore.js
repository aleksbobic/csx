import axios from 'axios';
import { createContext } from 'react';
import { ControlPanelStore } from './ControlPanelStore';
import { DataPanelStore } from './DataPanelStore';
import { SchemaStore } from './SchemaStore';
import { SearchStore } from './SearchStore';
import { GraphStore } from './GraphStore';
import { TrackingStore } from './TrackingStore';
import { ContextMenuStore } from './ContextMenuStore';
import { GraphInstanceStore } from './GraphInstanceStore';
import { CoreStore } from './CoreStore';
import { WorkflowStore } from './WorkflowStore';
import { FileUploadStore } from './FileUploadStore';
import { StatsStore } from './StatsStore';
import { HistoryStore } from './HistoryStore';

export class RootStore {
    surveyLink = null;

    constructor() {
        this.initAxios();
        this.graphInstance = new GraphInstanceStore(this);
        this.core = new CoreStore(this);
        this.schema = new SchemaStore(this);
        this.graph = new GraphStore(this);
        this.dataPanel = new DataPanelStore(this);
        this.controlPanel = new ControlPanelStore(this);
        this.search = new SearchStore(this);
        this.contextMenu = new ContextMenuStore(this);
        this.track = new TrackingStore(this);
        this.workflow = new WorkflowStore(this);
        this.fileUpload = new FileUploadStore(this);
        this.stats = new StatsStore(this);
        this.history = new HistoryStore(this);
        this.getSurveyLink();
    }

    initAxios = () => {
        if (process?.env.REACT_APP_SERVER_PORT) {
            axios.defaults.baseURL = `http://localhost:${process?.env.REACT_APP_SERVER_PORT}`;
        } else {
            axios.defaults.baseURL = `${window.location.origin}/api`;
        }
    };

    getSurveyLink = () => {
        axios.get('util/uuid').then(response => {
            this.surveyLink =
                'https://survey.tugraz.at/index.php/555429?lang=en&uuid=' +
                response.data;
            this.track.trackEvent('init', 'uuid', response.data);
        });
    };
}

export const RootStoreContext = createContext(new RootStore());
