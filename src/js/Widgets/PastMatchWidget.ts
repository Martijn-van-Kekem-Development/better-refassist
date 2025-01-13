import {API, Assignment, Form} from "../API.js";
import {Helpers} from "../Helpers.js";
import {Widget} from "./Widget.js";

export class PastMatchWidget extends Widget {
    /**
     * The local storage tag for the widget data.
     * @private
     */
    private readonly LS_DATA_TAG = `betterra_w${this.getID()}_data`;

    /**
     * The retrieved assignments.
     * @protected
     */
    protected assignments: Assignment[];

    /**
     * The amount of loaded forms.
     * @protected
     */
    protected formsToLoad: number = 5;

    /**
     * The last loaded form index.
     * @protected
     */
    protected lastLoaded: number = 0;

    /**
     * The forms per assignment.
     * @protected
     */
    protected forms: Map<string, Form[]>;

    /**
     * Load the items for the container.
     */
    public async loadItems() {
        await this.getData();

        const assignmentContainer = this.rootElement.querySelector(".card-body .scroll-y");
        const firstAssignment = this.lastLoaded;
        const lastAssignment = firstAssignment + this.formsToLoad;

        // Remove existing load more element
        const loadMoreEl = assignmentContainer.querySelector(".load-more-link");
        if (loadMoreEl) loadMoreEl.remove();

        for (let i = firstAssignment; i < Math.min(this.assignments.length, lastAssignment); i++) {
            const assignment = this.assignments[i];

            if (i > 0) assignmentContainer.append(this.getSeparatorElement());
            assignmentContainer.append(this.getMatchRowElement(assignment));
        }

        // Add load more matches link
        if (lastAssignment < this.assignments.length) {
            assignmentContainer.append(this.getLoadMoreElement());
        }

        // Insert detail view into body
        document.body.append(this.getDetailViewRootElement());
        this.lastLoaded = lastAssignment;
    }

    /**
     * When this widget is loaded.
     */
    public async prepare() {
        this.assignments = (await API.getAssignments(true));
        this.forms = new Map();
        await this.loadItems();
    }

    /**
     * Get the data for this widget.
     * @protected
     */
    protected async getData() {
        let promises = [];
        const firstAssignment = this.lastLoaded;
        const lastAssignment = firstAssignment + this.formsToLoad;
        const assignments = this.assignments.slice(firstAssignment, lastAssignment);
        for (let assignment of assignments) {
            const matchID = String(assignment.MatchId);

            // No forms, so nothing to retrieve.
            if (!assignment.HasFilledForms) {
                this.forms.set(matchID, []);
                continue;
            }

            const promise = API.getAvailableForms(matchID);
            promise.then(forms => {
                this.forms.set(matchID, forms);
            })
            promises.push(promise);
        }

        await Promise.all(promises);
    }

    /**
     * Get a separator element.
     */
    getSeparatorElement(): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("separator", "separator-dashed", "my-3");
        return element;
    }

    /**
     * Open the detail view
     * @param rootElement The root element for this match.
     * @param matchID The match ID.
     */
    openDetailView(rootElement: HTMLElement, matchID: string) {
        const forms = this.forms.get(matchID);
        const modalContainer = document.getElementById("betterra-form-modal");
        const itemsContainer = document.getElementById("betterra-form-modal-items");

        this.saveFormCount(matchID, forms.length);
        rootElement.classList.remove("has-new-forms");

        itemsContainer.innerHTML = "";
        for (let form of forms) {
            const element = this.getFormLinkElement(form);
            itemsContainer.append(element);
        }

        document.body.classList.add("modal-open");
        document.getElementById("betterra-backdrop").style.display = "block";
        modalContainer.classList.add("show");
        modalContainer.style.display = "block";
    }

    /**
     * Close the detail view.
     */
    closeDetailView() {
        const modalContainer = document.getElementById("betterra-form-modal");
        document.body.classList.remove("modal-open");
        document.getElementById("betterra-backdrop").style.display = "none";
        modalContainer.classList.remove("show");
        modalContainer.style.display = "none";
    }

    /**
     * Check if there are new forms available for this assignment
     * @param assignment The assignment to check the new forms for.
     * @param formCount The amount of forms currently available.
     */
    checkNewForms(assignment: Assignment, formCount: number): boolean {
        const data = JSON.parse(localStorage.getItem(this.LS_DATA_TAG) ?? "{}");
        const previousAvailable = data[assignment.MatchId] ?? 0;

        return previousAvailable < formCount;
    }

    /**
     * Save the available amount of forms.
     * @param matchID The match ID.
     * @param formCount The form count to save.
     */
    saveFormCount(matchID: string, formCount: number) {
        const data = JSON.parse(localStorage.getItem(this.LS_DATA_TAG) ?? "{}");
        data[matchID] = formCount;
        localStorage.setItem(this.LS_DATA_TAG, JSON.stringify(data));
    }

    /**
     * Get the load more element
     */
    getLoadMoreElement(): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("load-more-link");

        const linkEl = document.createElement("a");
        linkEl.setAttribute("href", "#");
        linkEl.innerText = "Meer wedstrijden laden.";
        linkEl.addEventListener("click", () => this.loadItems());
        element.append(linkEl);

        return element;
    }

    /**
     * Get a match row element.
     */
    getMatchRowElement(assignment: Assignment): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("d-flex", "flex-stack");

        const date = Helpers.parseDate(assignment.StartDate);
        const formCount = this.forms.get(String(assignment.MatchId)).length;

        if (this.checkNewForms(assignment, formCount)) {
            element.classList.add("has-new-forms");
        }

        element.innerHTML = `
            <div class="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                <div class="me-5 w-75">
                    <a href="#" class="text-gray-800 fw-bold text-hover-primary fs-6">${assignment.Match}</a>
                    <span class="text-gray-700 fs-7 d-block text-start ps-0">${assignment.Division} | ${date}</span>
                </div>
                <div class="d-flex align-items-center">
                    <span class="text-gray-800 fw-bold fs-6 me-3">${formCount}</span>
                </div>
            </div>
        `;

        element.addEventListener("click",
            () => this.openDetailView(element, String(assignment.MatchId)));
        return element;
    }

    /**
     * @override
     */
    getWidgetContentHTML(): string {
        return `
            <div class="card-body card-body-small h-xl-200px not-saved-error">
                Bezoek eerst de 'Aanwijzingen scheids' pagina om deze widget te activeren.
            </div>
            <div class="card-body card-body-small h-xl-200px">
                <div class="scroll-y h-xl-173px" style="padding-right: 5px;">
                     
                </div>
            </div>
        `;
    }

    /**
     * Get the detail view element
     */
    getDetailViewRootElement(): HTMLElement {
        const element = document.createElement("div");
        element.setAttribute("data-betterra-widget-container", `${this.getID()}`);
        element.innerHTML = `
            <div class="modal fade" id="betterra-form-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-modal="true" role="dialog">
                <div class="modal-dialog modal-dialog-scrollable modal-s">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${this.getTitle()}</h5>
                            <div class="btn btn-icon btn-sm btn-light-primary ms-2" data-bs-dismiss="modal" aria-label="Close">
                                <span class="fa-regular fs-4 fa-times" aria-hidden="true"></span>
                            </div>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-lg-12">
                                    <div class="mb-5 fw-bold">Overzicht van alle goedgekeurde formulieren</div>

                                    <span id="betterra-form-modal-items"></span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Sluiten</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-backdrop fade show" id="betterra-backdrop" style="display: none"></div>
        `;
        element.querySelectorAll(`.btn[data-bs-dismiss="modal"]`)
            .forEach(item =>
                item.addEventListener("click", () => this.closeDetailView()));
        return element;
    }

    /**
     * Get the form link element.
     * @param form The form.
     */
    getFormLinkElement(form: Form): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("mb-5", "d-flex");
        element.innerHTML = `
            <div class="w-75">
                <a href="#" class="download-filledform">
                    ${form.name}   
                </a>
            </div>
        `;
        element.querySelector("a").addEventListener("click", async () => {
            window.location.href = await API.getFormURL(form.id);
        });

        return element;
    }

    /**
     * @override
     */
    public getID(): number {
        return 1;
    }

    /**
     * @override
     */
    public getTitle(): string {
        return "Beschikbare formulieren";
    }

    /**
     * @override
     */
    public getDescription(): string {
        return "Toont het aantal beschikbare feedbackformulieren voor de laatste 5 aanwijzingen.";
    }
}