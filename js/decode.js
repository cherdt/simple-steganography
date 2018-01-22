/*jslint
    bitwise: false,
    browser: true
*/
var THEYLIVE = {
    keyImage: [],

    processDrop: function (event) {
        "use strict";
        var dt = event.dataTransfer;
        var files = dt.files;
        var count = files.length;
        var i;
        this.output("Processing " + count + " files...\n", event.target, true);

        for (i = 0; i < count; i += 1) {
            this.appendText(files[i].name + "\n", event.target);
            this.loadImage(files[i], event.target.id);
        }
    },

    appendText: function (text, target) {
        "use strict";
        this.output(text, target, false);
    },

    output: function (text, target, clear) {
        "use strict";
        var newTarget = document.getElementById((target.id).replace("Drop", "Data"));
        if (clear) {
            newTarget.textContent = text;
        } else {
            newTarget.textContent += text;
        }
        newTarget.textContent += "\n";
    },

    getKey: function (width, height) {
        "use strict";
        var imgData = [];
        var i;

        if (this.keyImage.length > 0) {
            imgData = this.keyImage[0].getContext("2d").getImageData(0, 0, width, height).data;
        } else {
            for (i = 0; i < width * height; i = i + 4) {
                imgData[i] = 0; // red
                imgData[i + 1] = 255; // green
                imgData[i + 2] = 255; // blue
                imgData[i + 3] = 255; // alpha
            }
        }
        return imgData;
    },

    revealHiddenImage: function (canvas, container) {
        "use strict";
        var canvas1 = canvas;
        var canvas2 = document.createElement("canvas");
        var context1 = canvas1.getContext("2d");
        var context2 = canvas2.getContext("2d");
        var data1;
        var data2;
        var i;
        var red;
        var green;
        var blue;
        var alpha;
        var key = this.getKey(canvas1.width, canvas1.height);

        canvas2.width = canvas1.width;
        canvas2.height = canvas1.height;
        canvas2.className = "decoded";
        container.appendChild(canvas2);
        data1 = context1.getImageData(0, 0, canvas1.width, canvas1.height);
        data2 = context1.getImageData(0, 0, canvas2.width, canvas2.height);

        for (i = 0; i < data1.data.length; i = i + 4) {
            red = i;
            green = i + 1;
            blue = i + 2;
            alpha = i + 3;

            if ((data1.data[i] & 1) ^ (key[i] & 1)) {
                data2.data[red] = 255;
            } else {
                data2.data[red] = 0;
            }
            data2.data[green] = data2.data[red];
            data2.data[blue] = data2.data[red];
            data2.data[alpha] = 255; // alpha = 100%
        }
        context2.putImageData(data2, 0, 0);
    },

    loadImage: function (file, id) {
        "use strict";
        var self = this;
        var iid = id;
        var reader = new FileReader();
        var header = document.createElement("h3");
        var container = document.createElement("div");
        var img = document.createElement("img");

        img.file = file;
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        }(img));
        reader.readAsDataURL(file);

        // we need to wait for the image to load to continue processing
        img.onload = function () {
            var canvas = document.createElement("canvas");
            var context;
            canvas.width = img.width;
            canvas.height = img.height;
            context = canvas.getContext("2d");
            context.drawImage(img, 0, 0);

            if (iid.indexOf("input") >= 0) {
                header.innerHTML = file.name;
                container.className = "imagePair";
                document.body.appendChild(header);
                document.body.appendChild(container);
                canvas.className = "coded";
                container.appendChild(canvas);
                self.revealHiddenImage(canvas, container);
            } else {
                // for now, assume the latest key is immediately active
                self.keyImage = [];
                self.keyImage.push(canvas);
            }
        };

    }

};