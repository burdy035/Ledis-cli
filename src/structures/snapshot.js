class Snapshot {
    constructor() {
        this.snapshot = "";
    }

    save(data) {
        if (data) {
            var stringLength = data.length - "data:image/png;base64,".length;

            var sizeInBytes =
                4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
            var sizeInKb = sizeInBytes / 1000;

            console.log(sizeInKb, sizeInBytes);

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
