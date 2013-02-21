define(["lib/scenejs/scenejs.sphere.js"],

    function () {

        return function (cfg) {

            var scene = this.getResource("scene");

            var nodeId = cfg.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var xPos = cfg.xPos || 0;
            var yPos = cfg.yPos || 0;
            var zPos = cfg.zPos || 0;

            /* Create moon in scene graph
             */
            var root = node.addNode({
                type:"flags",
                flags:{
                    enabled:true
                },
                nodes:[
                    {
                        type:"translate",

                        x:xPos,
                        y:yPos,
                        z:zPos,
                        nodes:[
                            {
                                type:"rotate",
                                id:"moon.pitch",
                                x:1,
                                nodes:[
                                    {
                                        type:"rotate",
                                        id:"moon.yaw",
                                        y:1,
                                        nodes:[
                                            {
                                                type:"rotate",
                                                z:1,
                                                angle:195,
                                                nodes:[
                                                    {
                                                        type:"rotate",
                                                        y:1,
                                                        id:"moon.spin",

                                                        nodes:[

                                                            /*--------------------------------------------------------------
                                                             * Layer 0: moon's surface with color, specular
                                                             * and emissive maps
                                                             *------------------------------------------------------------*/

                                                            {
                                                                type:"layer",
                                                                priority:0,

                                                                nodes:[
                                                                    {
                                                                        type:"scale",
                                                                        x:2,
                                                                        y:2,
                                                                        z:2,

                                                                        nodes:[

                                                                            {
                                                                                type:"texture",
                                                                                layers:[

                                                                                    /*---------------------------------------------------------
                                                                                     * Underlying texture layer applied to the moon material's
                                                                                     * baseColor to render the continents, oceans etc.
                                                                                     *--------------------------------------------------------*/
                                                                                    {
                                                                                        src:"textures/MoonMap_2500x1250.jpg",
                                                                                        applyTo:"baseColor",
                                                                                        blendMode:"multiply",
                                                                                        flipY:false
                                                                                    }
                                                                                ],

                                                                                /*---------------------------------------------------------
                                                                                 * Sphere with some material
                                                                                 *--------------------------------------------------------*/
                                                                                nodes:[

                                                                                    {
                                                                                        type:"material",
                                                                                        specular:5,
                                                                                        shine:100,
                                                                                        emit:0.0,
                                                                                        baseColor:{r:1, g:1, b:1},
                                                                                        nodes:[
                                                                                            {
                                                                                                type:"geometry",
                                                                                                source:{
                                                                                                    type:"sphere"
                                                                                                }
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]

                    }
                ]
            });


            this._destroy = function () {
                root.destroy();
            }
        };

    });
