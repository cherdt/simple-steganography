/*jslint
    bitwise, browser
*/
var THEYLIVE = {
    processDrop: function (event) {
        "use strict";
        var dt = event.dataTransfer;
        var files = dt.files;
        var count = files.length;
        var i;
        this.output("Processing " + count + " files...\n", event.target);

        for (i = 0; i < count; i += 1) {
            this.loadImage(files[i]);
        }
    },

    output: function (text, target) {
        "use strict";
        target.textContent += text;
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

            if (data1.data[i] & 1) {
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

    loadImage: function (file) {
        "use strict";
        var self = this;
        var sprite;
        var canvas;
        var context;
        var header = document.createElement("h3");
        var container = document.createElement("div");

        header.innerHTML = file.name;
        container.className = "imagePair";
        document.body.appendChild(header);
        document.body.appendChild(container);

        Promise.all([
            createImageBitmap(file)
        ]).then(function (sprites) {
            sprite = sprites[0];
            canvas = document.createElement("canvas");
            canvas.className = "coded";
            canvas.width = sprite.width;
            canvas.height = sprite.height;
            context = canvas.getContext("2d");
            context.drawImage(sprite, 0, 0);
            container.appendChild(canvas);
            self.revealHiddenImage(canvas, container);
        });
    }
};