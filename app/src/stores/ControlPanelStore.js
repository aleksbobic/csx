import { makeAutoObservable } from "mobx";

export class ControlPanelStore {
  isVisible = false;

  navigationValues = {
    perspectives: [],
    references: [],
  };

  constructor(store) {
    this.store = store;
    makeAutoObservable(this);
  }

  setSelectedNavigationPerspectives = (perspectives) => {
    this.navigationValues.perspectives = perspectives;
  };

  setSelectedNavigationReferences = (references) => {
    this.navigationValues.references = references;
  };

  toggleVisiblity = () => {
    this.isVisible = !this.isVisible;
  };

  resetNavigationValues = () => {
    this.navigationValues = {
      perspectives: [],
      references: [],
    };
  };
}
