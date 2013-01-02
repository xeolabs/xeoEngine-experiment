require(["./common"],
    function () {

        /*
         * Set lookat position
         */
        call("scene.set", {
            nodeId:"myLookat",
            eye:{
                z:-20
            }
        });


        /*
         * Add a teapot to the scene
         */
        call("scene.add", {
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
         * Make teapot wobble with vertex displacement effect
         */
        call("add", {
            type:"effects/wobble",
            id:"wobble",

            nodeId:"myMaterial",
            magnitudeX:0.3,
            magnitudeY:0.6,
            magnitudeZ:0.3
        });


        /* Time
         */
        var t = 0;

        /* Spin the teapot on each scene tick
         */
        var teapotSpin = 0;

        subscribe("scene.tick",
            function (params) {

                call("wobble.set", {
                    time:params.timeElapsed * 0.001
                });

                call("scene.set", {
                    nodeId:"myRotate",
                    angle:teapotSpin += 0.8
                });
            });

    });