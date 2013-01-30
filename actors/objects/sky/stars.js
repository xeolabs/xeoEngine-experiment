define(["../../../libs/scenejs/scenejs.sphere.js"],

    function () {

        return function (configs) {

            var scene = this.getObject("scene");

            var nodeId = configs.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var root = node.addNode({
                type:"scale",
                x:5000,
                y:5000,
                z:5000,

                nodes:[
                    {
                        type:"material",
                        baseColor:{ r:1, g:1, b:1 },
                        emit:1.0,

                        nodes:[
                            {
                                type:"texture",
                                coreId:"___milkyway-tex",
                                layers:[
                                    {
                                        src:"textures/milky-way.gif",
                                        applyTo:"baseColor",
                                        blendMode:"multiply",
                                        flipY:false,
                                        scale:{
                                            x:1.5,
                                            y:1.0
                                        }
                                    }
                                ],

                                nodes:[
                                    {
                                        type:"geometry",
                                        asset:{
                                            type:"sphere"
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