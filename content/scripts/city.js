/* Set up the default scene graph
 */

var scene = nexus.get("scene");

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
                                color:{ r:1.0, g:1.0, b:1.0 },
                                diffuse:true,
                                specular:true,
                                dir:{ x:-1.0, y:-0.5, z:1.0 },
                                space:"world"
                            },
                            {
                                mode:"dir",
                                color:{ r:1.0, g:1.0, b:0.0 },
                                diffuse:false,
                                specular:true,
                                dir:{ x:0.5, y:-1, z:1.0 },
                                space:"world"
                            }
                        ],

                        nodes:[

                            /* Node where we'll attach our content
                             */
                            {
                                type:"node",
                                nodeId:"addStuffHere"
                            }
                        ]
                    }
                ]
            }
        ]
    }
});


/* Add a procedurally-generated city model
 */
var city = nexus.add({
    type:"city",
    id:"myCity",

    posX: -180,
    posZ: 0,
    numBuildingsX:6,
    numBuildingsZ:8,
    sizeX:300,
    sizeZ:400,
    streetWidth:20,

    nodeId:"addStuffHere"
});


/* Add another city
 */
var city2 = nexus.add({
    type:"city",
    id:"myCity2",

    posX: 180,
    posZ: 0,
    numBuildingsX:6,
    numBuildingsZ:8,
    sizeX:300,
    sizeZ:400,
    streetWidth:10,

    nodeId:"addStuffHere"
});


/* Add a big grey slab for the ground
 */
scene.call({
    method:"add",
    nodeId:"addStuffHere",
    node:{
        type:"translate",
        y:-2,
        nodes:[
            {
                type:"scale",
                x:500,
                y:1,
                z:400,

                nodes:[
                    {
                        type:"material",
                        baseColor:{
                            r:0.1,
                            g:0.1,
                            b:0.1
                        },
                        nodes:[
                            {
                                type:"geometry",
                                asset:{
                                    type:"box"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
});

/*-----------------------------------------------
 * Mouse drag-pan control for lookat node
 *----------------------------------------------*/

var x = 0;
var y = 10;

var lastX;
var lastY;

var dragging = false;

/*
 * Set initial lookat position
 */
scene.call({
    method:"set",
    nodeId:"myLookat",
    eye:{
        z:-350
    }
});

/* Add mouse control
 */
nexus.add({
    type:"mouse",
    id:"myMouse"
});

nexus.subscribe(
    "myMouse.down",
    function (params) {
        dragging = true;
    });

nexus.subscribe(
    "myMouse.move",
    function (params) {

        if (dragging && lastX != null) {

            x += params.canvasX - lastX;
            y += params.canvasY - lastY;

            if (y < 10) {
                y = 10;
            }

            scene.call({
                method:"set",
                nodeId:"myLookat",
                eye:{
                    x:x,
                    y:y
                }
            });
        }

        lastX = params.canvasX;
        lastY = params.canvasY;
    });

nexus.subscribe(
    "myMouse.up",
    function (params) {
        dragging = false;
        lastX = null;
    });
