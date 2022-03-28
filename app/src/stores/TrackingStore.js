import { makeAutoObservable } from 'mobx';

export class TrackingStore {
    constructor(store) {
        this.store = store;
        makeAutoObservable(this);

        window._paq = window._paq || [];
        window._paq.push(['trackPageView']);
        window._paq.push(['enableLinkTracking']);

        this.initTracking();
    }

    initTracking = () => {
        const url = `//${window.location.hostname}:8883/`;

        window._paq.push(['setTrackerUrl', url + 'matomo.php']);
        window._paq.push(['setSiteId', '1']);

        const script = document.createElement('script');

        script.type = 'text/javascript';
        script.async = true;
        script.src = url + 'matomo.js';

        document.body.appendChild(script);
    };

    trackPageChange = () => {
        const title =
            window.location.pathname.slice(1) === ''
                ? 'home'
                : window.location.pathname.slice(1);

        window._paq.push(['setCustomUrl', window.location.href]);
        window._paq.push(['setDocumentTitle', title]);
        window._paq.push(['deleteCustomVariables', 'page']);
        window._paq.push(['trackPageView']);
    };

    trackEvent = (event_category, event_action, event_data) => {
        window._paq.push([
            'trackEvent',
            event_category,
            event_action,
            event_data
        ]);
    };
}
