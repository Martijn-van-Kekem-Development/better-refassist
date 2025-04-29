import {Page} from "./Page.js";
import {API} from "../API.js";

export class RefereeAppPage extends Page {
    /**
     * @override
     */
    init() {
        this.saveSeasonData();
        this.initNoFormDownload();
    }

    /**
     * Initialize RA to open forms in a new tab instead of downloading.
     * @protected
     */
    protected initNoFormDownload() {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.classList.contains('open-filled-forms')) return;

            this.onOpenFormButtonClick();
        })
    }

    /**
     * When the open form button has been clicked
     * @protected
     */
    protected onOpenFormButtonClick() {
        const modal = document.getElementById("filled-forms-modal");
        const contentContainer = modal.querySelector(".modal-body");
        const observer = new MutationObserver((changes, observer) => {
            this.interceptFormOpenButton();
            observer.disconnect();
        });

        observer.observe(contentContainer, {
            childList: true,
            subtree: true
        })
    }

    /**
     * Intercept the open form request by our custom action.
     * @protected
     */
    protected interceptFormOpenButton() {
        const modal = document.getElementById("filled-forms-modal");
        const links = modal.querySelectorAll("a.download-filledform");
        links.forEach(link => {
            link.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const id = link.getAttribute("data-id");
                const url = await API.getFormURL(id);
                window.open(url, "_blank");
            });
        })
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