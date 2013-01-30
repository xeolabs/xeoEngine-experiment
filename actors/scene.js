/* Scene graph management actor
 *
 * - Provides a SceneJS scene graph for child actors
 * - Provides method to pick on the scene graph, which publishes "pickhit" or "pickmiss" events
 *
 */
define([
    "libs/scenejs/scenejs.js"
],
    function () {

        return function (cfg) {


            if (!cfg.canvasId) {
                throw "param expected: canvasId";
            }

            /* Create scene graph
             */
            var scene = SceneJS.createScene({
                id:cfg.canvasId,
                canvasId:cfg.canvasId
            });

            var startTime = (new Date()).getTime();

            var self = this;

            /* Publish scene ticks
             */
            scene.onEvent("idle",
                function () {
                    self.publish("tick", {
                        timeElapsed:(new Date()).getTime() - startTime
                    });
                });

            startTime = (new Date()).getTime();

            /* Start render loop
             */
            scene.start();

            /* Set up a scene graph skeleton
             */
            scene.addNode(getSceneJSON());

            /* Provide scene for child actors            
             */
            this.setObject("scene", scene);


            /**
             * Fires a "scene.pickhit" event for any hit on
             * a named object in the scene, or a "scene.pickmiss" if nothing hit
             *
             * @param params
             * @param params.canvasX
             * @param params.canvasY
             * @param params.rayPick
             */
            this.pick = function (params) {

                var canvasX = params.canvasX;
                var canvasY = params.canvasY;

                if (canvasX == undefined || canvasX == null) {
                    throw "param expected: canvasX";
                }

                if (canvasY == undefined || canvasY == null) {
                    throw "param expected: canvasY";
                }

                var hit = scene.pick(canvasX, canvasY, params);

                scene.renderFrame({ force:true });     // HACK: Fixes black flicker after picking

                if (hit) {
                    this.publish("pickhit", hit);

                } else {
                    this.publish("pickmiss", params);
                }
            };


            this._destroy = function () {
                scene.destroy();
            };


            function getSceneJSON() {
                return {
                    type:"node",

                    nodes:[
                        {
                            type:"camera",
                            id:"camera",
                            optics:{
                                type:"perspective",
                                fovy:40.0,
                                aspect:1.47,
                                near:0.10,
                                far:10000.0
                            },

                            nodes:[

                                /*
                                 * View-scope branch, where View-scope objects live
                                 *
                                 * Nodes in this branch will be locked in place within the view frustum and will
                                 * not translate or rotate with respect to the user as the lookat node updates.
                                 */

                                {
                                    type:"lookAt",
                                    eye:{ x:0, y:0, z:30 },
                                    look:{ x:0, y:0, z:0 },
                                    up:{ x:0, y:1, z:.0 },

                                    nodes:[

                                        /* Illuminaton for nodes in the View-scope branch
                                         */

                                        {
                                            type:"lights",
                                            lights:[
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.0, g:1.0, b:1.0 },
                                                    diffuse:true,
                                                    specular:true,
                                                    dir:{ x:1.0, y:-0.5, z:-1.0 },
                                                    scope:"world"
                                                },
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.0, g:1.0, b:1.0 },
                                                    diffuse:true,
                                                    specular:true,
                                                    dir:{ x:0.0, y:0.0, z:1.0 },
                                                    scope:"world"
                                                },
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.0, g:1.0, b:0.8 },
                                                    diffuse:true,
                                                    specular:false,
                                                    dir:{ x:0.0, y:0.0, z:1.0 },
                                                    scope:"world"
                                                }
                                            ],

                                            nodes:[

                                                /* View-scope content root
                                                 *
                                                 * This is a material node so that any object added here without their own
                                                 * materials will at least appear visible. Any material nodes added here
                                                 * will override this material.
                                                 */
                                                {
                                                    type:"material",
                                                    baseColor:{ r:1, g:1, b:1 },
                                                    emit:2.0,
                                                    id:"view"
                                                }
                                            ]
                                        }
                                    ]
                                },

                                /* The "world" scene branch, where World-scope objects live
                                 *
                                 * Nodes in this branch will translate and rotate with respect to the position
                                 * and orientation configured on the lookat node
                                 */

                                {
                                    type:"lookAt",
                                    nodeId:"lookat",
                                    eye:{ x:0, y:10, z:-20 },
                                    look:{ x:0, y:0, z:0 },
                                    up:{ x:0, y:1, z:.0 },

                                    nodes:[
                                        {
                                            type:"lights",
                                            id:"lights",
                                            lights:[
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.0, g:1.0, b:1.0 },
                                                    diffuse:true,
                                                    specular:true,
                                                    dir:{ x:1.0, y:-0.5, z:-1.0 },
                                                    scope:"world"
                                                },
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.0, g:1.0, b:1.0 },
                                                    diffuse:true,
                                                    specular:true,
                                                    dir:{ x:-1.0, y:-0.5, z:0.5 },
                                                    scope:"world"
                                                },
                                                {
                                                    mode:"dir",
                                                    color:{ r:1.0, g:1.0, b:0.0 },
                                                    diffuse:false,
                                                    specular:true,
                                                    dir:{ x:0.5, y:-1, z:1.0 },
                                                    scope:"world"
                                                }
                                            ],

                                            nodes:[

                                                /* World-scope content root
                                                 *
                                                 * This is a material node so that any object added here without their own
                                                 * materials will at least appear visible. Any material nodes added here
                                                 * will override this material.
                                                 */
                                                {
                                                    type:"material",
                                                    baseColor:{ r:1, g:1, b:1 },
                                                    emit:2.0,
                                                    id:"world"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                };
            }
        };
    });