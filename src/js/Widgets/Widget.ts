export abstract class Widget {
    /**
     * The local storage tag specifying whether this widget is enabled.
     * @private
     */
    private readonly WIDGET_ENABLE_TAG = `betterra_w${this.getID()}_enabled`;

    /**
     * The root element for this widget.
     * @protected
     */
    protected rootElement: HTMLElement = null;

    /**
     * Get whether the user has enabled this widget.
     */
    public isEnabled(): boolean {
        return (localStorage.getItem(this.WIDGET_ENABLE_TAG) ?? "true") === "true";
    }

    /**
     * Set whether the user has enabled this widget.
     * @param enabled Whether the widget should be enabled.
     */
    public setEnabled(enabled: boolean) {
        localStorage.setItem(this.WIDGET_ENABLE_TAG, enabled ? "true" : "false");
    }

    /**
     * Prepare the widget before showing.
     */
    public abstract prepare(): Promise<void>;

    /**
     * Load the given widget.
     */
    public async load(): Promise<void> {
        this.rootElement = this.getRootElement();

        // Insert widget into dashboard
        const container = document.getElementById("dashboard");
        container.insertBefore(this.rootElement, container.firstChild);

        await this.prepare();
    }

    /**
     * Get the root element.
     * @protected
     */
    protected getRootElement(): HTMLElement {
        const element = document.createElement("div");
        element.id = `widget-bra${this.getID()}`;
        element.setAttribute("data-id", `bra${this.getID()}`);
        element.classList.add("col-xl-4", "widget");
        element.innerHTML = `
            <div class="card card-flush mb-5" data-custom-card="${this.getID()}">
                <div class="card-header card-header-small border-bottom">
                    <div class="card-title">
                        <h3 class="card-label">
                            <span class="card-label fw-bolder fs-4">${this.getTitle()}</span>
                        </h3>
                    </div>
                    <div class="card-toolbar me-2">
                        <div class="better-ra-icon"></div>
                    </div>
                </div>
                ${this.getWidgetContentHTML()}
            </div>
        `;

        return element;
    }

    /**
     * Get the HTML content of this widget.
     * @protected
     */
    protected abstract getWidgetContentHTML(): string;

    /**
     * Get the ID of this widget.
     * @protected
     */
    public abstract getID(): number;

    /**
     * Get the title of this widget.
     * @protected
     */
    public abstract getTitle(): string;

    /**
     * Get the description of this widget.
     * @protected
     */
    public abstract getDescription(): string;
}