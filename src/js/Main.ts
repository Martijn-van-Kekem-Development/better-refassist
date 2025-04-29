import {WidgetManager} from "./Widgets/WidgetManager.js";
import {RefereeAppPage} from "./PageScripts/RefereeAppPage.js";

export class Main {
    /**
     * Main entry point when the RefAssist page is loaded.
     */
    constructor() {
        const path = window.location.pathname.trim().toLowerCase();
        if (path === '/')
            WidgetManager.load().then();
        else if (path === '/refereeapp') {
            (new RefereeAppPage()).init();
        }
    }
}

window.addEventListener('load', () => {
    (new Main());
})
