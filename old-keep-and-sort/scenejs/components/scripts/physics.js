
/*---------------------------------------------------------------------------------------------------------
 * Import common actors for scene, camera, mouse etc.
 *-------------------------------------------------------------------------------------------------------*/

require([
    "scripts/environments/common"
],
    function () {

        /*-------------------------------------------------------------------------------------------------
         * Create a physics system actor
         *
         * This actor wraps the JigLibJS library and provides a physics system within which
         * we can create bodies and subscribe to their state updates.
         *-----------------------------------------------------------------------------------------------*/

        call("add", {
            type:"systems/physics/jiglib",
            id:"physics"
        });

        /*-------------------------------------------------------------------------------------------------
         * Create bouncing balls
         *
         * For each ball, we'll create a coloured and translated sphere in the scene graph, along with
         * a body in the physics system.
         *
         * We'll wire updates from each physics body to the translation of it's sphere in the scene graph.
         *------------------------------------------------------------------------------------------------*/

        /* Create spheres
         */
        var primId;
        var i = 0;

        for (var x = -2; x < 2; x += .7) {
            for (var z = -2; z < 2; z += .7) {
                primId = "sphere." + i++;
                createSphere(primId, { x:0, y:(Math.random() * 250) + 10, z:0 });
            }
        }

        function createSphere(actorId, pos) {

            /* Create a sphere in the scene graph, wrapped with
             * translate and material nodes.
             */
            var translateNodeId = actorId + ".pos";

            call("scene.add", {
                nodes:[
                    {
                        type:"translate",
                        nodeId:translateNodeId,
                        x:(Math.random() * 2) - 1,
                        y:(Math.random() * -15) - 5,
                        z:(Math.random() * 2) - 1,
                        nodes:[
                            {
                                type:"material",
                                baseColor:{
                                    r:Math.random(),
                                    g:Math.random(),
                                    b:Math.random()
                                },
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

            /* Create spherical physics body in the physics system
             */
            call("physics.addBody", {
                type:"sphere",
                bodyId:actorId,
                radius:0.9,
                restitution:1000000,
                velocity:{
                    x:(Math.random() * 2) - 1,
                    y:(Math.random() * -15) - 5,
                    z:(Math.random() * 2) - 1

                },
                mass:(Math.random() * 50) + 10,
                pos:pos,
                movable:true,
                friction:0.0000
            });

            /* Feed position updates from the physics body
             * into the translate node
             */
            subscribe("physics.update." + actorId,
                function (params) {

                    call("scene.set", {
                        nodeId:translateNodeId,
                        XYZ:params.pos
                    });
                });
        }

        /*-------------------------------------------------------------------------
         * Create ground plane
         *
         * For the ground we'll create a nice looking grid object, along
         * with a plane body in the physics system.
         *-----------------------------------------------------------------------*/

        /* Add ground
         */
        call("add", {
            type:"objects/ground/grid2",
            id:"grid"
        });

        /* Create ground plane physics body
         */
        call("physics.addBody", {
            type:"plane",
            bodyId:"myPlane",
            dir:{
                y:1
            },
            pos:{
                y:.5
            },
            friction:10
        });

        /*-------------------------------------------------------------------------------------------------
         * Tweak camera
         *-----------------------------------------------------------------------------------------------*/

        call("camera.set", {
            eye:{
                x:-40,
                z:-60
            }
        });
    });
