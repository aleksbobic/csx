import { CommentStore } from "./CommentStore";
import { ContextMenuStore } from "./ContextMenuStore";
import { ControlPanelStore } from "./ControlPanelStore";
import { CoreStore } from "./CoreStore";
import { DataPanelStore } from "./DataPanelStore";
import { FileUploadStore } from "./FileUploadStore";
import { GraphInstanceStore } from "./GraphInstanceStore";
import { GraphStore } from "./GraphStore";
import { HistoryStore } from "./HistoryStore";
import { OverviewSchemaStore } from "./OverviewSchemaStore";
import { PresentStore } from "./PresentStore";
import { SchemaStore } from "./SchemaStore";
import { SearchStore } from "./SearchStore";
import { StatsStore } from "./StatsStore";
import { TrackingStore } from "./TrackingStore";
import { WorkflowStore } from "./WorkflowStore";
import axios from "axios";
import { createContext } from "react";
import { isEnvSet } from "@/general.utils";

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
    if (isEnvSet("VITE_SERVER_PORT")) {
      axios.defaults.baseURL = `http://localhost:${isEnvSet(
        "VITE_SERVER_PORT"
      )}`;
    } else {
      axios.defaults.baseURL = `${window.location.origin}/api`;
    }
  };
}

export const RootStoreContext = createContext(new RootStore());
