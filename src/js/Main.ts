import {PastMatchWidget} from "./Widgets/PastMatchWidget.js";
import {WidgetManager} from "./Widgets/WidgetManager.js";

export class Main {
    /**
     * Main entry point when the RefAssist page is loaded.
     */
    constructor() {
        const path = window.location.pathname.trim().toLowerCase();
        if (path === '/')
            WidgetManager.load().then();
        else if (path === '/refereeapp') {
            this.saveSeasonData();
        }
    }

    /**
     * Save the data for the current season
     * @protected
     */
    protected saveSeasonData() {
        const officialID = document.getElementById("OfficialId") as HTMLInputElement;
        const seasonID = document.getElementById("Season") as HTMLInputElement;
        localStorage.setItem("season_data", JSON.stringify({
            official: officialID.value,
            season: seasonID.value
        }));
    }
}

window.addEventListener('load', () => {
    (new Main());
})
