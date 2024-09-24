import {Widget} from "./Widget.js";
import {PastMatchWidget} from "./PastMatchWidget.js";

export class WidgetManager {
    /**
     * Load the available widgets.
     */
    public static async loadWidgets() {
        const promises = [];
        for (let widget of this.getAvailableWidgets())
            if (widget.isEnabled())
                promises.push(widget.load());

        await Promise.all(promises);
    }

    /**
     * Load the widget manager.
     */
    public static async load() {
        await this.loadManager();
        await this.loadWidgets();
    }

    /**
     * Get the available widgets for a given
     */
    static getAvailableWidgets(): Widget[] {
        return [new PastMatchWidget()]
    }

    /**
     * Load the widget manager.
     */
    static async loadManager() {
        const container = document.getElementById("widgets");
        container.append(this.getTitleHTML());

        for (let widget of this.getAvailableWidgets()) {
            const el = this.getWidgetEnableRowHTML(widget);
            container.append(el);
        }
    }

    static getTitleHTML() {
        const el = document.createElement("div");
        el.classList.add("betterra-widget-select-title");
        el.innerHTML = `
            <span class="fw-bold text-dark fs-4 cursor-pointer">BetterRefAssist widgets</span>
        `;
        return el;
    }

    /**
     * Get the row HTML to enable/disable a given widget
     * @param widget
     */
    static getWidgetEnableRowHTML(widget: Widget) {
        const el = document.createElement("div");
        el.innerHTML = `
            <div id="container-betterra-widget-${widget.getID()}">
                <div class="form-group d-flex flex-stack">
                    <div class="d-flex flex-column">
                        <label class="fw-bold text-dark fs-4 cursor-pointer" for="betterra-widget-switch-${widget.getID()}">${widget.getTitle()}</label>
                        <div class="fs-7 text-gray-700 pe-10">
                            ${widget.getDescription()}
                        </div>
                    </div>
                    <div class="d-flex justify-content-end">
                        <div class="form-check form-switch form-check-custom form-check-solid">
                            <input class="form-check-input h-25px w-45px widget-switch" type="checkbox" value="" id="betterra-widget-switch-${widget.getID()}" data-betterra-widgetid="${widget.getID()}">
                            <label class="form-check-label" for="betterra-widget-switch-${widget.getID()}">
                            </label>
                        </div>
                    </div>
                </div>
                <div class="separator separator-dashed my-5"></div>
            </div>
        `;

        const checkbox = el.querySelector<HTMLInputElement>("input[data-betterra-widgetid]");
        checkbox.addEventListener("change", () => this.updateWidgetEnabled(checkbox, widget));
        checkbox.checked = widget.isEnabled();

        return el;
    }

    /**
     * Update the enabled state for the given widget.
     * @param el The toggled element.
     * @param widget The corresponding widget.
     */
    static async updateWidgetEnabled(el: HTMLInputElement, widget: Widget) {
        widget.setEnabled(el.checked);

        if (el.checked) {
            await widget.load();
        } else {
            for (let el of document.querySelectorAll("[data-betterra-widget-container]"))
                el.remove();
        }
    }
}