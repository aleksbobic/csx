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
import { CommentStore } from './CommentStore';
import { OverviewSchemaStore } from './OverviewSchemaStore';
import { PresentStore } from './PresentStore';
import { isEnvSet } from 'general.utils';

export class RootStore {
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
        this.comment = new CommentStore(this);
        this.overviewSchema = new OverviewSchemaStore(this);
        this.present = new PresentStore(this);
    }

    initAxios = () => {
        if (isEnvSet('REACT_APP_SERVER_PORT')) {
            axios.defaults.baseURL = `http://localhost:${isEnvSet(
                'REACT_APP_SERVER_PORT'
            )}`;
        } else {
            axios.defaults.baseURL = `${window.location.origin}/api`;
        }
    };
}

export const RootStoreContext = createContext(new RootStore());
