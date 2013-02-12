define(["lib/scenejs/scenejs.skybox.js"],

    function () {

        return function (configs) {

            var scene = this.getObject("scene");

            var nodeId = configs.nodeId || "sky";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var root = node.addNode({
                type:"scale",
                x:1,
                y:1,
                z:1,

                nodes:[
                    {
                        type:"material",
                        baseColor:{ r:1, g:1, b:1 },
                        emit:1.0,

                        nodes:[
                            {
                                type:"texture",
                                coreId:"__sky-texture",
                                layers:[
                                    {
                                        src:"textures/clouds-box.jpg",
                                        applyTo:"baseColor",
                                        blendMode:"multiply",
                                        flipY:false
                                    }
                                ],

                                nodes:[
                                    {
                                        type:"geometry",
                                        source:{
                                            type:"skybox",
                                            xSize:5000,
                                            ySize:5000,
                                            zSize:5000
                                        }
                                    }
                                ]
                            }

                        ]
                    }
                ]
            });

            this._destroy = function () {
                root.destroy();
            };
        };
    });