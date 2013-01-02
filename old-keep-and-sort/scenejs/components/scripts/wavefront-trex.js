require([
    "scripts/environments/common"
],
    function () {

        call("scene.add", {
            node:{

                type:"rotate",
                nodeId:"myRotate", // Give the 'rotate' node an ID so we can spin its angle (see below)
                angle:0,
                y:1,

                nodes:[
                    {
                        type:"rotate",
                        angle:0,
                        x:1,
                        nodes:[
                            {
                                type:"scale",
                                nodeId:"putTextHere",
                                x:0.3,
                                y:0.3,
                                z:0.3
                            },
                            {
                                type:"material",
                                nodeId:"putModelHere",
                                baseColor:{
                                    r:0.7,
                                    g:0.7,
                                    b:0.7
                                }
                            }
                        ]
                    }
                ]
            }
        });

        /* Add a model (a mesh) imported from a Wavefront OBJ file
         */
        call("add", {
            type:"import/wavefront",
            id:"trex",
            src:"content/models/wavefront/trex/dtrex.obj",
            nodeId:"putModelHere"
        });

        /* Spin the model on each scene tick
         */
        var spin = 0;

        subscribe(
            "scene.tick",
            function (params) {

                call("scene.set", {
                    nodeId:"myRotate",
                    angle:spin += 0.8
                });
            });

        /* Stick some text above the model
         */
        call("add", {
            type:"objects/text/vectorText",
            text:"Wavefront Import",
            id:"" + Math.random(),
            xPos:-10,
            yPos:5,
            zPos:0,
            nodeId:"putTextHere"
        });

        /* Add some ground
         */
        call("add", {
            type:"objects/ground/grid2",
            id:"grid"
        });
    });