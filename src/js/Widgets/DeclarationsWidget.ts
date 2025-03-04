import {Widget} from "./Widget.js";
import {API, Expense} from "../API.js";

export class DeclarationsWidget extends Widget {
    /**
     * The expense data.
     */
    private data: Expense[] = [];

    /**
     * @override
     */
    public async prepare() {
        document.getElementById("button_toAccept").addEventListener("click",
            () => this.acceptAllClick());

        this.prepareConfirmAcceptAllDialog();
        await this.getData();
    }

    /**
     * Prepare the accept all declarations dialog.
     * @protected
     */
    protected prepareConfirmAcceptAllDialog() {
        document.body.append(this.getConfirmAcceptAllPopupElement());
        const container = document.getElementById("betterra_popup_acceptAllDeclarations");
        container.querySelector("button.btn-primary").addEventListener("click", async () => {
            await this.acceptAllDeclarations();
            container.style.display = "none";
        });
        container.querySelector("button.btn-secondary").addEventListener("click", () => {
            container.style.display = "none";
        })
    }

    /**
     * Accept all pending declarations.
     * @protected
     */
    protected async acceptAllDeclarations() {
        const proposedRows =
            this.data.filter(row => row.Status === 15 && row.Manageable);

        let promises = [];
        for (let row of proposedRows) {
            promises.push(API.acceptExpense(row.Id));
        }

        if (proposedRows.length > 0) {
            await Promise.all(promises);
            await this.getData();
        }
    }

    /**
     * When the accept all link is clicked.
     * @protected
     */
    protected async acceptAllClick() {
        document.getElementById("betterra_popup_acceptAllDeclarations").style.display = "";
    }

    /**
     * Get the data for this widget.
     * @protected
     */
    protected async getData() {
        this.data = await API.getExpenses();

        const acceptedRows = this.data.filter(row => row.Status === 30);
        const proposedRows = this.data.filter(row => row.Status === 15 && row.Manageable);
        const paidRows = this.data.filter(row => row.Status === 40);
        const maxDate = paidRows.reduce((a, b) => {
            return new Date(a.DatePaid) > new Date(b.DatePaid) ? a : b;
        }).DatePaid;

        let acceptedAmount =
            acceptedRows.reduce((sum, curr) => sum + curr.Amount, 0).toFixed(2);

        let proposedAmount =
            proposedRows.reduce((sum, curr) => sum + curr.Amount, 0).toFixed(2);

        let paidAmount = paidRows
                .filter(item => item.DatePaid === maxDate)
                .reduce((sum, curr) => sum + curr.Amount, 0).toFixed(2);

        document.getElementById(`betterra-widget-${this.getID()}-accepted`).innerHTML =
            `&euro; ${String(acceptedAmount).replace(".", ",")}`;

        document.getElementById(`betterra-widget-${this.getID()}-proposed`).innerHTML =
            `&euro; ${String(proposedAmount).replace(".", ",")}`;

        document.getElementById(`betterra-widget-${this.getID()}-paid`).innerHTML =
            `&euro; ${String(paidAmount).replace(".", ",")}`;

        const paymentDate = new Date(maxDate);
        document.getElementById(`betterra-widget-${this.getID()}-date`).innerHTML =
            `${paymentDate.getDate()}-${paymentDate.getMonth() + 1}-${paymentDate.getFullYear()}`;
    }

    protected getWidgetContentHTML(): string {
        return `
            <div class="card-body card-body-small h-xl-200px not-saved-error">
                Bezoek eerst de 'Aanwijzingen scheids' pagina om deze widget te activeren.
            </div>
            <div class="card-body card-body-small h-xl-200px">
                <div class="scroll-y h-xl-185px" style="padding-right: 5px;">
                    <div class="d-flex flex-stack">
                        <div class="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                            <div class="me-5 w-75">
                                <a href="#" id="button_toAccept" class="text-gray-800 fw-bold text-hover-primary fs-6">Nog te accepteren</a>
                                <span class="text-gray-700 fs-7 d-block text-start ps-0">Het totaalbedrag aan nog goed te keuren declaraties.</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="text-gray-800 fw-bold fs-6 me-3" id="betterra-widget-${this.getID()}-proposed">&euro; 0,00</span>
                            </div>
                        </div>
                    </div>
                    <div class="separator separator-dashed my-3"></div>
                    <div class="d-flex flex-stack">
                        <div class="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                            <div class="me-5 w-75">
                                <a href="/expensesforofficials" class="text-gray-800 fw-bold text-hover-primary fs-6">Goedgekeurd</a>
                                <span class="text-gray-700 fs-7 d-block text-start ps-0">Het totaalbedrag aan goedgekeurde declaraties.</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="text-gray-800 fw-bold fs-6 me-3" id="betterra-widget-${this.getID()}-accepted">&euro; 0,00</span>
                            </div>
                        </div>
                    </div>
                    <div class="separator separator-dashed my-3"></div>
                    <div class="d-flex flex-stack">
                        <div class="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                            <div class="me-5 w-75">
                                <a href="/expensesforofficials" class="text-gray-800 fw-bold text-hover-primary fs-6">Laatste uitbetaling</a>
                                <span class="text-gray-700 fs-7 d-block text-start ps-0">Het totaalbedrag uitbetaald op <span id="betterra-widget-${this.getID()}-date"></span>.</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="text-gray-800 fw-bold fs-6 me-3" id="betterra-widget-${this.getID()}-paid">&euro; 0,00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get the confirm popup element
     * @protected
     */
    protected getConfirmAcceptAllPopupElement(): HTMLElement {
        const element = document.createElement("div");
        element.classList.add("k-dialog-wrapper");
        element.id = "betterra_popup_acceptAllDeclarations";
        element.style.display = "none";
        element.innerHTML = `
            <div class="k-overlay"></div>
            <div class="k-window k-dialog" role="dialog">
                <div class="k-window-titlebar k-dialog-titlebar" id="e2c41b54-5cd6-496c-9ad5-150938afea75_title">
                    <span class="k-window-title k-dialog-title">Alle declaraties goedkeuren</span>
                    <div class="k-window-titlebar-actions k-dialog-titlebar-actions">
                        <button class="k-window-titlebar-action k-dialog-titlebar-action k-button k-button-md k-button-flat k-button-flat-base k-rounded-md k-icon-button" data-role="close" title="Sluiten" aria-label="Sluiten" tabindex="0">
                            <span class="k-icon k-svg-icon k-svg-i-x k-button-icon" aria-hidden="true">
                                <svg viewBox="0 0 512 512" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M416 141.3 301.3 256 416 370.7 370.7 416 256 301.3 141.3 416 96 370.7 210.7 256 96 141.3 141.3 96 256 210.7 370.7 96z"></path></svg>
                            </span>
                        </button>
                    </div>
                </div>
                <div id="dialogApprove" name="dialogApprove" style="min-width: 320px;" data-role="dialog" class="k-window-content k-dialog-content" tabindex="0">Weet je zeker dat je alle declaraties wilt goedkeuren?</div>
                <div class="k-dialog-actions k-actions k-actions-horizontal k-window-actions k-actions-end">
                    <button type="button" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base btn btn-sm btn-secondary font-weight-bold" tabindex="0">
                        <span class="k-button-text">Nee</span>
                    </button>
                    <button type="button" class="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base btn btn-sm btn-primary font-weight-bold" tabindex="0">
                        <span class="k-button-text">Ja</span>
                    </button>
                </div>
            </div>
        `;
        return element;
    }

    /**
     * @override
     */
    public getID(): number {
        return 2;
    }

    /**
     * @override
     */
    public getTitle(): string {
        return "Declaraties";
    }

    /**
     * @override
     */
    public getDescription(): string {
        return "Een overzicht van jouw laatste en toekomstige declaraties."
    }

}