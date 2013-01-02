define(["../../../libs/scenejs.vectorText.js"],

    function () {

        return function (configs) {

            var scene = this.getObject("scene");

            var nodeId = configs.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId ;
            }

            var root = node.addNode({
                type:"geometry",
                asset:{
                    type:"vectorText", // Depends on the SceneJS text plugin in file scenejs.vectorText.js
                    text:configs.text || "",
                    xPos:configs.xPos,
                    yPos:configs.yPos,
                    zPos:configs.zPos
                }
            });


            this._destroy = function () {
                root.destroy();
            };
        };
    });
