/*jslint
    bitwise, browser
*/

var THEYLIVE = {
    codeImage: null,
    facadeImage: null,

    hasCodeImage: function () {
        "use strict";
        return (this.codeImage !== null);
    },

    hasFacadeImage: function () {
        "use strict";
        return (this.facadeImage !== null);
    },

    codedrop: function (event) {
        "use strict";
        this.dodrop(event);
    },

    facadedrop: function (event) {
        "use strict";
        this.dodrop(event);
    },

    dodrop: function (event) {
        "use strict";
        var dt = event.dataTransfer;
        var files = dt.files;

        var count = files.length;
        var i;
        if (count !== 1) {
            console.log("Expected just 1 file.");
        }
        console.log(event);

        this.output("File Count: " + count + "\n", event.target);

        for (i = 0; i < files.length; i += 1) {
            console.log("Type of " + i + ": " + dt.types[i]);
            console.log("Item of " + i + ": " + dt.items[i]);

            this.loadimg(files[i], event.target.id);

            this.output(" File " + i + ":\n(" + (typeof files[i]) + ") : <" + files[i] + " > " +
                    files[i].name + " " + files[i].size + "\n", event.target);

        }
    },

    output: function (text, target) {
        "use strict";
        target.textContent += text;
        //dump(text);
    },

    onebit: function (cnvs) {
        "use strict";
        var imgData = cnvs.getContext("2d").getImageData(0, 0, cnvs.width, cnvs.height);
        var i, colorVal, red, green, blue;
        for (i = 0; i < imgData.data.length; i = i + 4) {
            if (((imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3) > 127) {
                colorVal = 255;
            } else {
                colorVal = 0;
            }
            red = i;
            green = i + 1;
            blue = i + 2;
            imgData.data[red] = colorVal;
            imgData.data[green] = colorVal;
            imgData.data[blue] = colorVal;
        }
        cnvs.getContext("2d").putImageData(imgData, 0, 0);
    },

    combineImages: function (canvasCode, canvasFacade) {
        "use strict";
        console.log("combine");
        var canvas = document.createElement("canvas");
        // The new canvas needs to be the size of the facade
        canvas.width = canvasFacade.width;
        canvas.height = canvasFacade.height;


        var context = canvas.getContext('2d');
        var i;
        context.drawImage(canvasFacade, 0, 0);
        document.getElementById("result").appendChild(canvas);

        var hiddenData = canvasCode.getContext('2d').getImageData(0, 0, 200, 200);
        var imgData = canvasFacade.getContext('2d').getImageData(0, 0, 200, 200);

        for (i = 0; i < imgData.data.length; i = i + 4) {
            // If the hiddenData value is 0 (black) we want the 1-bit to be black
            // If the hiddenData value is 1 (white) we want the 1-bit to be white
            if (hiddenData.data[i] & 1) {
                imgData.data[i] = imgData.data[i] | 1;
            } else {
                imgData.data[i] = imgData.data[i] & 254;
            }
        }
        context.putImageData(imgData, 0, 0);
    },

    loadimg: function (file, id) {
        "use strict";
        var self = this;
        var iid = id;
        Promise.all([
            createImageBitmap(file)
        ]).then(function (sprites) {
            console.log(sprites[0]);
            var canvasTemp;
            canvasTemp = document.createElement("canvas");
            canvasTemp.id = iid.replace("drop", "Canvas");
            canvasTemp.width = sprites[0].width;
            canvasTemp.height = sprites[0].height;
            var ctxTemp = canvasTemp.getContext('2d');
            ctxTemp.drawImage(sprites[0], 0, 0);
            if (iid.indexOf("code") >= 0) {
                document.getElementById("code").appendChild(canvasTemp);
                // convert to black and white
                self.onebit(canvasTemp);
                self.codeImage = canvasTemp;
            }
            if (iid.indexOf("facade") >= 0) {
                document.getElementById("facade").appendChild(canvasTemp);
                self.facadeImage = canvasTemp;
            }

            if (self.hasCodeImage() && self.hasFacadeImage()) {
                self.combineImages(self.codeImage, self.facadeImage);
            }

        });
    }

};
