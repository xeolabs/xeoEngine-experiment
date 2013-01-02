/**
 * Physics system
 */
define([
    "libs/canvas2image"
],

    function () {

        /**
         * @constructor
         */
        return function (configs) {


            var scene = this.getObject("scene");


            /**
             * Grab and publish a screenshot
             * @param params
             */
            this.get = function (params) {

                scene.renderFrame({ force:true }); // HACK - need to fix need for this in SceneJS

                var canvas = scene.getCanvas();

                var width = params.width || canvas.width;
                var height = params.height || canvas.height;

                var image = Canvas2Image.saveAsJPEG(canvas, true, width, height);

                this.publish("screenshot", {
                    src:image.src,
                    width:width,
                    height:height
                });
            };
        };
    });
