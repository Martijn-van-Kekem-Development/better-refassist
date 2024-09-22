import {API, Assignment, Form} from "../API.js";
import {Helpers} from "../Helpers.js";

export class PastMatchWidget {
    /**
     * The retrieved assignments.
     * @protected
     */
    protected static assignments: Assignment[];

    /**
     * The forms per assignment.
     * @protected
     */
    protected static forms: Map<string, Form[]>;

    /**
     * When this widget is loaded.
     */
    public static async load() {
        await this.getData();

        const element = this.getRootElement();
        const assignmentContainer = element.querySelector(".card-body .scroll-y");
        for (let i = 0; i < Math.min(this.assignments.length, 5); i++) {
            const assignment = this.assignments[i];

            if (i > 0) assignmentContainer.append(this.getSeparatorElement());
            assignmentContainer.append(this.getMatchRowElement(assignment));
        }

        // Insert widget into dashboard
        const container = document.getElementById("dashboard");
        container.insertBefore(element, container.firstChild);

        // Insert detail view into body
        document.body.append(this.getDetailViewRootElement());
    }

    /**
     * Get the data for this widget.
     * @protected
     */
    protected static async getData() {
        this.assignments = (await API.getAssignments(true)).slice(0, 5);
        this.forms = new Map();

        let promises = [];
        for (let assignment of this.assignments) {
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
        console.log(Array.from(this.forms.entries()));
    }

    /**
     * Get a separator element.
     */
    static getSeparatorElement(): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("separator", "separator-dashed", "my-3");
        return element;
    }

    /**
     * Open the detail view
     * @param matchID The match ID.
     */
    static openDetailView(matchID: string) {
        const forms = this.forms.get(matchID);
        const modalContainer = document.getElementById("betterra-form-modal");
        const itemsContainer = document.getElementById("betterra-form-modal-items");

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
    static closeDetailView() {
        const modalContainer = document.getElementById("betterra-form-modal");
        document.body.classList.remove("modal-open");
        document.getElementById("betterra-backdrop").style.display = "none";
        modalContainer.classList.remove("show");
        modalContainer.style.display = "none";
    }

    /**
     * Get a match row element.
     */
    static getMatchRowElement(assignment: Assignment): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("d-flex", "flex-stack");

        const date = Helpers.parseDate(assignment.StartDate);
        const formCount = this.forms.get(String(assignment.MatchId)).length;

        element.innerHTML = `
            <div class="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                <div class="me-5 w-75">
                    <a href="#" class="text-gray-800 fw-bold text-hover-primary fs-6">${assignment.HomeTeam} - ${assignment.AwayTeam}</a>
                    <span class="text-gray-700 fw-semibold fs-7 d-block text-start ps-0">${assignment.Division} | ${date}</span>
                </div>
                <div class="d-flex align-items-center">
                    <span class="text-gray-800 fw-bold fs-6 me-3">${formCount}</span>
                </div>
            </div>
        `;

        element.addEventListener("click", () => this.openDetailView(String(assignment.MatchId)));
        return element;
    }

    /**
     * Get the HTML to inject for this widget.
     */
    static getRootElement(): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("col-xl-4", "widget");
        element.innerHTML = `
            <div class="card card-flush mb-5" data-custom-card="1">
                <div class="card-header card-header-small border-bottom">
                    <div class="card-title">
                        <h3 class="card-label">
                            <span class="card-label fw-bolder fs-4">Beschikbare formulieren</span>
                        </h3>
                    </div>
                    <div class="card-toolbar me-2">
                    </div>
                </div>
                <div class="card-body card-body-small h-xl-200px not-saved-error">
                    Bezoek eerst de 'Aanwijzingen scheids' pagina om deze plugin te activeren.
                </div>
                <div class="card-body card-body-small h-xl-200px">
                    <div class="scroll-y h-xl-185px" style="padding-right: 5px;">
                         
                    </div>
                </div>
            </div>
        `;
        return element;
    }

    /**
     * Get the detail view element
     */
    static getDetailViewRootElement(): HTMLElement {
        const element = document.createElement("div");
        element.innerHTML = `
            <div class="modal fade" id="betterra-form-modal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-modal="true" role="dialog">
                <div class="modal-dialog modal-dialog-scrollable modal-s">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Beschikbare formulieren</h5>
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
        element.querySelector(`button[data-bs-dismiss="modal"]`).addEventListener("click", () => this.closeDetailView());
        return element;
    }

    /**
     * Get the form link element.
     * @param form The form.
     */
    static getFormLinkElement(form: Form): HTMLElement {
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
}