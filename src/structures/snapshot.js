class Snapshot {
    constructor() {
        this.snapshot = "";
    }

    save(data) {
        if (data) {
            this.snapshot = data;

            return "OK";
        } else {
            return "(error) no image data";
        }
    }

    restore() {
        if (this.snapshot) {
            return `<div class="snapshot-image-container"><img src="${
                this.snapshot
            }" class="snapshot-image" width="600" height="400"/></div>`;
        } else {
            return "(error) no image data";
        }
    }
}

export default new Snapshot();
