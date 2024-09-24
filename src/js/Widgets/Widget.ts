export abstract class Widget {
    /**
     * The local storage tag specifying whether this widget is enabled.
     * @private
     */
    private readonly WIDGET_ENABLE_TAG = `betterra_w${this.getID()}_enabled`;

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
     * Load the given widget.
     */
    public abstract load(): Promise<void>;

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