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
        th.appendChild(s);
    }
}

new Injector(chrome.runtime.getURL('/build/js/Main.js'), 'body');