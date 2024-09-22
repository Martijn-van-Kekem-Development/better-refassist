class Injector {
    /**
     * Constructor for Injector
     * @param file
     * @param node
     */
    constructor(file: string, node: string) {
        let th = document.getElementsByTagName(node)[0];
        let s = document.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.setAttribute("type", "module");
        s.setAttribute('src', file);
        s.addEventListener("load", () => this.init());
        th.appendChild(s);
    }

    /**
     * Init the injector
     */
    init() {
        // // Listen for requests from plugin
        // window.addEventListener("message", async e => {
        //     if (!e.data.type) return;
        //
        //     if (e.data.type === "load_feedback") {
        //         // Get feedback items
        //         chrome.storage.local.get("saved_feedback").then(data => window.postMessage(data));
        //     } else if (e.data.type === "clear_feedback") {
        //         await chrome.storage.local.set({"saved_feedback": "{}"});
        //         chrome.storage.local.get("saved_feedback").then(data => window.postMessage(data));
        //     } else if (e.data.type === "remove_feedback") {
        //         let saved = await chrome.storage.local.get("saved_feedback");
        //         if (saved.saved_feedback) {
        //             let feedback = JSON.parse(saved.saved_feedback);
        //             if (typeof e.data.id === "string")
        //                 delete feedback[e.data.id];
        //             else {
        //                 for (let id of e.data.id)
        //                     delete feedback[id];
        //             }
        //
        //             await chrome.storage.local.set({"saved_feedback": JSON.stringify(feedback)});
        //             chrome.storage.local.get("saved_feedback").then(data => window.postMessage(data));
        //         }
        //     }
        // })
    }
}

new Injector(chrome.runtime.getURL('/build/js/Main.js'), 'body');