require(["./common"],
    function () {

        /*
         * Add a colourful rotating teapot to the scene
         */
        call("scene.add", {
            node:{

                type:"rotate",
                nodeId:"myRotate", // Give the 'rotate' node an ID so we can update the rotation angle below
                angle:0,
                y:1,

                nodes:[

                    /* Pink material
                     */
                    {
                        type:"material",
                        nodeId:"myMaterial",
                        baseColor:{
                            r:1,
                            g:0.2,
                            b:0.6
                        },
                        specular:10,
                        nodes:[

                            /* Teapot geometry
                             */
                            {
                                type:"geometry",
                                asset:{             // Relies on the "scenejs.teapot.js" plugin
                                    type:"teapot"
                                }
                            }
                        ]
                    }
                ]
            }
        });

        /* Set the camera eye position
         */
        call("camera.set", {
            eye:{
                y:5,
                z:-10
            }
        });

        /* Spin the teapot on each scene tick
         */
        var teapotSpin = 0;

        subscribe(
            "scene.tick",
            function (params) {

                call("scene.set", {
                    nodeId:"myRotate",
                    angle:teapotSpin += 0.8
                });
            });

        call("add", {
            type:"objects/text/vectorText",
            text:"ActorJS + SceneJS teapot example",
            id:"" + Math.random(),
            xPos:-10,
            yPos:5,
            zPos:0,
            nodeId:"myRotate"
        });

        /* Add the ground
         */
//        call("add", {
//            type: "ground/grid2",
//            id: "grid"
//        });

        call("add", {
            type:"objects/prims/terrain",
            id:"terrain",
            nx:200,
            ny:200,
            nodeId:"myMaterial"
        });
    });