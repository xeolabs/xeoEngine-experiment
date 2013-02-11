define(["lib/scenejs/scenejs.vectorText.js"],

    function () {

        return function (cfg) {

            var scene = this.getObject("scene");

            var nodeId = cfg.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId ;
            }

            var root = node.addNode({
                type:"geometry",
                source:{
                    type:"vectorText", // Depends on the SceneJS text plugin in file scenejs.vectorText.js
                    text:cfg.text || "",
                    xPos:cfg.xPos,
                    yPos:cfg.yPos,
                    zPos:cfg.zPos
                }
            });


            this._destroy = function () {
                root.destroy();
            };
        };
    });
