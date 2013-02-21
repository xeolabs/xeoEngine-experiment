define([
    "../.././scenejs/scenejs.box.js"
],
    function () {

        return function (scope, configs) {

            /* Number of balls in the simulation
             */
            var numBalls = configs.numBalls || 10;

            /* Find content node in scene graph
             */

            var scene = scope.scene;

            if (!scene) {
                throw "scene not found";
            }

            var nodeId = configs.nodeId || "world";

            var node = scene.getNode(nodeId);

            if (!node) {
                throw "node not found in scene: [nodeId = " + nodeId + ", sceneId = " + sceneId + "]";
            }


            /* Create a child scope for our physics system
             * Create the scope in a Web Worker
             */
            var scopeId = configs.actorId + ".scope";

            scope.call("addScope", {
                scopeId:scopeId,
                newThread:!!configs.useWorker   // Create scope in Web Worker?
            });


            /* Add physics system actor to the scope
             */
            scope.call(scopeId + "/addActor", {
                type:"systems/physics/jiglib",
                actorId:"physics"
            });


            /* Get a scene subgraph to contain our objects
             * We'll delete this in the destructor
             */
            var root = node.addNode({
                type:"node"
            });


            /* Create spheres in scene graph, each with a corresponding rigid body in physics system which will
             * publish it's positional updates back to the scene spheres' modelling transforms
             */
            var primId;

            var pos = configs.pos || {}; // Center of the ball cascade

            var posX = pos.x || 0;
            var posY = pos.y || 0;
            var posZ = pos.z || 0;

            for (var i = 0; i < numBalls; i++) {
                primId = "sphere." + i++;
                createSphere(primId, { x:posX + (Math.random() * 0.02) - 0.01, y:posY, z:posZ + (Math.random() * 0.02) - 0.01});
                posY += 2.0;
            }


            function createSphere(actorId, pos) {

                /* Create a sphere in our scene subgraph
                 */
                var translate = root.addNode({

                    type:"translate",

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
                                    type:"scale",

                                    x:2.0,
                                    y:2.0,
                                    z:2.0,

                                    nodes:[
                                        {

                                            type:"geometry",
                                            source:{
                                                type:"box"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });


                /* Create spherical rigid body
                 */
                scope.call(scopeId + "/physics.addBody", {
                    type:"sphere",
                    bodyId:actorId,
                    radius:2.0,
                    restitution:1000000,
                    velocity:{
                        x:0.01,
                        y:(Math.random() * 2) + 1,
                        z:0.01

                    },
                    mass:60,
                    pos:pos,
                    movable:true,
                    friction:0.0000
                });


                /* Feed position updates from the physics body
                 * into the translate node
                 */
                scope.subscribe(scopeId + "/physics.update." + actorId, ////////// TODO: follow path in subscription
                    function (params) {

                        var x = params.pos.x + posX;
                        var y = params.pos.y + posY;
                        var z = params.pos.z + posZ;

                        translate.setXYZ({ x:x, y:y, z:z });
                    });
            }


            /* Create ground plane rigid body
             */
            scope.call(scopeId + "/physics.addBody", {
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


            /**
             * Integrates the physics system
             */
            this.integrate = function () {
                scope.call(scopeId + "/physics.integrate");
            };


            this._destroy = function () {

                /* Remove scope, which will remove all the actors we created within it
                 */
                scope.call("removeScope", {
                    scopeId:scopeId
                });

                /* Delete our scene subgraph
                 */
                root.destroy();
            };
        }
    })
;