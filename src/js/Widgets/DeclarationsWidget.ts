import {Widget} from "./Widget.js";
import {API} from "../API.js";

export class DeclarationsWidget extends Widget {
    /**
     * @override
     */
    public async prepare() {
        await this.getData();
    }

    /**
     * Get the data for this widget.
     * @protected
     */
    protected async getData() {
        const data = await API.getExpenses();

        const acceptedRows = data.filter(row => row.Status === 30);
        const proposedRows = data.filter(row => row.Status === 15);
        const paidRows = data.filter(row => row.Status === 40);

        let acceptedAmount =
            acceptedRows.reduce((sum, curr) => sum + curr.Amount, 0).toFixed(2);

        let proposedAmount =
            proposedRows.reduce((sum, curr) => sum + curr.Amount, 0).toFixed(2);

        let paidAmount =
            paidRows.reduce((sum, curr) => sum + curr.Amount, 0).toFixed(2);

        document.getElementById(`betterra-widget-${this.getID()}-accepted`).innerHTML =
            `&euro; ${String(acceptedAmount).replace(".", ",")}`;

        document.getElementById(`betterra-widget-${this.getID()}-proposed`).innerHTML =
            `&euro; ${String(proposedAmount).replace(".", ",")}`;

        document.getElementById(`betterra-widget-${this.getID()}-paid`).innerHTML =
            `&euro; ${String(paidAmount).replace(".", ",")}`;
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
                                <a href="#" class="text-gray-800 fw-bold text-hover-primary fs-6">Voorgesteld</a>
                                <span class="text-gray-700 fs-7 d-block text-start ps-0">Het totaalbedrag aan voorgestelde declaraties.</span>
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
                                <a href="#" class="text-gray-800 fw-bold text-hover-primary fs-6">Goedgekeurd</a>
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
                                <a href="#" class="text-gray-800 fw-bold text-hover-primary fs-6">Betaald</a>
                                <span class="text-gray-700 fs-7 d-block text-start ps-0">Het totaalbedrag aan uitbetaalde declaraties.</span>
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