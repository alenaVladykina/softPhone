export default class Navigation {
    constructor(root) {
        this.pages = {};
        this.activePage = '';

        for (let page of root.getElementsByClassName("js-page")) {
            const {name} = page.dataset;
            if (name) {
                this.pages[name] = page;
            }
        }
    }

    go(value) {
        for (let key in this.pages) {
            const page = this.pages[key];
            const {name} = page.dataset;
            page.classList.toggle('hidden', name !== value);
        }
        this.activePage = value;
    }
}