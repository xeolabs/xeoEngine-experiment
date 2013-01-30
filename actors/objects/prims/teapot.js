/**
 * Teapot which can be shown, hidden, spun and have its colour changed
 */
define([
    "../../../libs/scenejs/scenejs.teapot.js"
],

    function () {

        return function (configs) {

            var scene = this.getObject("scene");

            var nodeId = configs.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var flags = node.addNode({
                type:"flags",
                enabled:true
            });

            var translate = flags.addNode({
                type:"translate",
                x: configs.xPos || 0,
                y: configs.yPos || 0,
                z: configs.zPos || 0
            });

            var rotate = translate.addNode({
                type:"rotate",
                y:1,
                angle:0
            });

            var material = rotate.addNode({
                type:"material",
                baseColor:{
                    r:0.0, g:0.0, b:1.0
                },
                specularColor:{
                    r:1.0, g:1.0, b:1.0
                },
                emit:0.0
            });

            material.addNode({
                type:"geometry",
                asset:{
                    type:"teapot"
                }
            });

            var angleYInc = 0.0;

//            scope.subscribe("scene.tick",
//                function () {
//                    if (angleYInc != 0) {
//                        rotate.incAngle(angleYInc);
//                    }
//                });


            this.show = function () {
                flags.setEnabled(true);
            };

            this.hide = function () {
                flags.setEnabled(false);
            };

            this.startSpinning = function () {
                angleYInc = 0.5;
            };

            this.stopSpinning = function () {
                angleYInc = 0.0;
            };

            this.setColor = function (color) {
                material.setBaseColor(color);
            };

            this._destroy = function () {
                flags.destroy();
            };
        }
    });