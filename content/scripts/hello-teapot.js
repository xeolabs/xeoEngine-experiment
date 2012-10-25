
/* Set up the default scene graph
 */
nexus.call({

    method:"scene.add",

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
nexus.call({
    method:"scene.set",
    nodeId:"myLookat",
    eye:{
        z:-20
    }
});


/*
 * Add a teapot to the scene
 */
nexus.call({
    method:"scene.add",
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
 * Change teapot colour
 */
nexus.call({
    method:"scene.set",
    nodeId:"myMaterial",
    baseColor:{
        r:1,
        g:1.2,
        b:0.6
    }
});


/* Spin the teapot on each scene tick
 */
var teapotSpin = 0;

nexus.subscribe(
    "scene.tick",
    function (params) {
        nexus.call({
            method:"scene.set",
            nodeId:"myRotate",
            angle:teapotSpin += 0.8
        });
    });

