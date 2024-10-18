import {
  capitaliseFirstLetter,
  isEnvFalse,
  stringifyIfObject,
} from "utils/general.utils";

import { makeAutoObservable } from "mobx";

export class TrackingStore {
  constructor(store) {
    this.store = store;
    makeAutoObservable(this);

    if (this.isTrackingEnabled()) {
      this.initTracking();
    }
  }

  isTrackingEnabled = () => {
    return (
      isEnvFalse("VITE_DISABLE_TRACKING") && this.store.core.trackingEnabled
    );
  };

  initTracking = () => {
    window._paq = window._paq || [];
    window._paq.push(["trackPageView"]);
    window._paq.push(["enableLinkTracking"]);

    const url =
      import.meta.env.NODE_ENV === "production"
        ? `//${window.location.hostname}/analytics/`
        : `//${window.location.hostname}:8883/`;

    window._paq.push(["setTrackerUrl", url + "matomo.php"]);
    window._paq.push(["setSiteId", "1"]);

    const script = document.createElement("script");

    script.type = "text/javascript";
    script.async = true;
    script.src = url + "matomo.js";

    document.body.appendChild(script);
  };

  trackPageChange = () => {
    if (this.isTrackingEnabled()) {
      const title =
        window.location.pathname.slice(1) === ""
          ? "home"
          : window.location.pathname.slice(1);

      window._paq.push(["setCustomUrl", window.location.href]);
      window._paq.push(["setDocumentTitle", title]);
      window._paq.push(["deleteCustomVariables", "page"]);
      window._paq.push(["trackPageView"]);
    }
  };

  trackEvent = (eventCategory, eventAction, eventData) => {
    if (this.isTrackingEnabled()) {
      const strEventCategory = stringifyIfObject(eventCategory);
      const strEventAction = capitaliseFirstLetter(
        stringifyIfObject(eventAction)
      );
      const strEventData = stringifyIfObject(eventData);

      window._paq.push([
        "trackEvent",
        strEventCategory,
        strEventAction,
        strEventData,
      ]);
    }
  };
}
