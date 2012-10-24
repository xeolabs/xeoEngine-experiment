/*
 * Reset Nexus
 */
nexus.call({
    method:"reset"
});

/*
 * Create a scene
 *      - adds a 'scene' actor to nexus, which is defined in content/components/objects/scene.js
 *      - gives the actor a unique ID
 *      - the actor creates a SceneJS.Scene, giving it an ID and binding it to a canvas
 */
var scene = nexus.add({
    type:"scene", // Select actor type defined in content/components/objects/scene.js
    id:"myScene",

    sceneId:"mySceneNode",
    canvasId:"theCanvas"
});

/* Create some nodes in the scene
 */
scene.call({
    method:"add",

    node:{
        type:"camera",
        optics:{
            type:"perspective",
            fovy:40.0,
            aspect:1.47,
            near:0.10,
            far:10000.0
        },

        nodes:[
            {
                type:"lookAt",
                nodeId:"myLookat",
                eye:{ x:0, y:10, z:-20 },
                look:{ x:0, y:0, z:0 },
                up:{ x:0, y:1, z:.0 },

                nodes:[
                    {
                        type:"lights",
                        lights:[
                            {
                                mode:"dir",
                                color:{ r:1.0, g:1.0, b:1.0 },
                                diffuse:true,
                                specular:true,
                                dir:{ x:1.0, y:-0.5, z:1.0 },
                                space:"world"
                            },
                            {
                                mode:"dir",
                                color:{ r:1.0, g:1.0, b:0.8 },
                                diffuse:true,
                                specular:false,
                                dir:{ x:0.0, y:-0.5, z:1.0 },
                                space:"world"
                            }
                        ],

                        nodes:[
                            {
                                type:"rotate",
                                nodeId:"myRotate",
                                y:1,
                                angle:270,

                                nodes:[
                                    {
                                        type:"material",
                                        nodeId:"myMaterial",
                                        baseColor:{
                                            r:0.5,
                                            g:0.5,
                                            b:1.0
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
});

/*
 * Set lookat position
 */
scene.call({
    method:"set",
    nodeId:"myLookat",
    eye:{
        z:-20
    }
});

/*
 * Add a teapot to the scene
 */
scene.call({
    method:"add",
    nodeId:"myMaterial",
    node:{
        type:"geometry",
        nodeId:"myTeapot",
        asset:{             // Relies on the "scenejs.teapot.js" plugin
            type:"teapot"
        }
    }
});

/*
 * Add a teapot to the scene
 */
scene.call({
    method:"set",
    nodeId:"myMaterial",
    baseColor:{
        r:1,
        g:1.2,
        b:0.6
    }
});


scene.whenExists(
    function () {

        /* Create "camera"
         */
        var camera = nexus.add({
            type:"camera",
            id:"camera",
            sceneId:"mySceneNode",
            nodeId:"myLookat"
        });

        /*------------------------------------------------------------------------
         * Crude canvas pan control
         *----------------------------------------------------------------------*/

        var x = 20;
        var y = 20;

        var lastX;
        var lastY;

        var dragging = false;

        /* Set initial camera state
         */
        camera.call({
            method:"set",
            eye:{ x:x, y:y, z:-40 },
            look:{ y:0.0 },
            up:{ y:1.0 }
        });

        var mouse = nexus.add({
            type:"mouse",
            id:"mouse",
            sceneId:"mySceneNode"
        });

        /* Mouse handlers
         */
        nexus.subscribe(
            "mouse.down",
            function (params) {
                dragging = true;
            });

        nexus.subscribe(
            "mouse.move",
            function (params) {

                if (dragging && lastX != null) {

                    x += params.canvasX - lastX;
                    y += params.canvasY - lastY;

                    if (y < 10) {
                        y = 10;
                    }

                    camera.call({
                        method:"set",
                        eye:{
                            x:x * 0.1,
                            y:y * 0.1
                        }
                    });
                }

                lastX = params.canvasX;
                lastY = params.canvasY;
            });

        nexus.subscribe(
            "mouse.up",
            function (params) {
                dragging = false;
                lastX = null;
            });
    });