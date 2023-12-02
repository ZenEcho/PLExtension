// gamePlatform.js
class gamePlatform {
    constructor(options) {
        this.left = options.left || "0px";
        this.width = options.width || "0px";
        this.height = options.height || "10px";
        this.bottom = options.bottom || "10px";
        this.class = options.class;
        this.imgsrc = options.imgsrc || "images/diamond.png";
    }

    create() {
        let platform = document.createElement("div");
        if (this.class === "diamond") {
            let img = document.createElement("img")
            img.src = this.imgsrc
            img.style.width = "100%"
            img.style.height = "100%"
            platform.appendChild(img);
        }
        platform.className = this.class;
        platform.style.left = this.left;
        platform.style.width = this.width;
        platform.style.height = this.height;
        platform.style.bottom = this.bottom;
        return platform;
    }
}

