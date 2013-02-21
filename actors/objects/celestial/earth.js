define(["lib/scenejs/scenejs.sphere.js"],

    function () {

        return function (cfg) {

            var scene = this.getResource("scene");

            var nodeId = cfg.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var earthRotateNode;
            var cloudsRotateNode;
            var earthRotateXNode;
            var earthRotateYNode;


            /* Create Earth in scene graph
             */
            var root = node.addNode({
                type:"flags",
                flags:{
                    enabled:true
                },
                nodes:[
                    {
                        type:"rotate",
                        id:"earth.pitch",
                        x:1,
                        nodes:[
                            {
                                type:"rotate",
                                id:"earth.yaw",
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
                                                id:"earth.spin",

                                                nodes:[

                                                    /*--------------------------------------------------------------
                                                     * Layer 0: Earth's surface with color, specular
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
                                                                             * Underlying texture layer applied to the Earth material's
                                                                             * baseColor to render the continents, oceans etc.
                                                                             *--------------------------------------------------------*/
                                                                            {
                                                                                src:"textures/Earth-Color4096.jpg",
                                                                                applyTo:"baseColor",
                                                                                blendMode:"multiply",
                                                                                flipY:false
                                                                            },

                                                                            /*---------------------------------------------------------
                                                                             * Second texture layer applied to the Earth material's
                                                                             * specular component to make the ocean shiney.
                                                                             *--------------------------------------------------------*/
                                                                            {
                                                                                src:"textures/earth_specular_2048.jpg",
                                                                                applyTo:"specular",
                                                                                blendMode:"multiply",
                                                                                flipY:false
                                                                            } ,
                                                                            //

                                                                            /*---------------------------------------------------------
                                                                             * Thied texture layer applied to the Earth material's
                                                                             * emission component to show lights on the dark side.
                                                                             *--------------------------------------------------------*/
                                                                            {
                                                                                src:"textures/earth-lights.gif",
                                                                                applyTo:"emit",
                                                                                blendMode:"add",
                                                                                flipY:false
                                                                            }
                                                                            ,


                                                                            /*---------------------------------------------------------
                                                                             *
                                                                             *--------------------------------------------------------*/
                                                                            {
                                                                                src:"textures/earth-normal_2048.jpg",
                                                                                applyTo:"normals",
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
                                                    },

                                                    /*--------------------------------------------------------------
                                                     * Layer 1: Cloud layer with alpha map
                                                     *------------------------------------------------------------*/

                                                    {
                                                        type:"layer",
                                                        priority:1,

                                                        nodes:[

                                                            {
                                                                type:"flags",


                                                                flags:{
                                                                    transparent:true,
                                                                    specular:false,
                                                                    blendFunc:{
                                                                        sfactor:"srcAlpha",
                                                                        dfactor:"one"
                                                                    },
                                                                    backfaces:true  // TODO: Sphere backfaces seem to be reversed if this is needed
                                                                },

                                                                nodes:[
                                                                    {
                                                                        type:"scale",
                                                                        x:2.05,
                                                                        y:2.05,
                                                                        z:2.05,

                                                                        nodes:[

                                                                            /*------------------------------------------------------------------
                                                                             *
                                                                             *----------------------------------------------------------------*/

                                                                            {
                                                                                type:"texture",
                                                                                layers:[

                                                                                    /*---------------------------------------------------------
                                                                                     *  Alpha map
                                                                                     *
                                                                                     *--------------------------------------------------------*/

                                                                                    {
                                                                                        src:"textures/clouds.jpg",
                                                                                        applyTo:"alpha",
                                                                                        blendMode:"multiply",
                                                                                        flipY:false
                                                                                    }

                                                                                ],

                                                                                /*---------------------------------------------------------
                                                                                 * Sphere with some material
                                                                                 *--------------------------------------------------------*/

                                                                                nodes:[
                                                                                    {
                                                                                        type:"node",
                                                                                        z:1,
                                                                                        angle:195,
                                                                                        nodes:[
                                                                                            {
                                                                                                type:"rotate",
                                                                                                y:1,
                                                                                                id:"earth.clouds.spin",
                                                                                                nodes:[
                                                                                                    {
                                                                                                        type:"material",
                                                                                                        specular:0,
                                                                                                        shine:0.0001,
                                                                                                        emit:0.0,
                                                                                                        alpha:1.0,
                                                                                                        baseColor:{
                                                                                                            r:1, g:1, b:1
                                                                                                        },
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
                            }
                        ]
                    }
                ]
            });

            earthRotateNode = scene.getNode("earth.spin");
            cloudsRotateNode = scene.getNode("earth.clouds.spin");
            earthRotateXNode = scene.getNode("earth.pitch");
            earthRotateYNode = scene.getNode("earth.yaw");

            var earthRotate = 0;
            var cloudsRotate = 0;


            /* Spin Earth and clouds on each scene tick
             */
            this.subscribe(
                "tick",
                function () {

                    earthRotateNode.setAngle(earthRotate);
                    cloudsRotateNode.setAngle(cloudsRotate);

                    earthRotate -= 0.02;
                    cloudsRotate -= 0.04;
                });


            this._destroy = function () {
                root.destroy();
            }
        };

    });
