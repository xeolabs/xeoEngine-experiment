define(function () {

    return function (cfg) {

        /* Number of simulations
         */
        var numSystems = cfg.numSystems || 1;

        /* Number of objects in each simulation
         */
        var numBalls = cfg.numBalls || 10;

        /* Add a template environment - camera, scene etc.
         */
        this.addActor({
            type:"templates/template2",
            actorId: "scene",
            canvasId:cfg.canvasId
        });

//        /* Add a bunch of simulations
//         */
//        var len = Math.round(Math.sqrt(numSystems));
//        var nAdded = 0;
//
//        for (var i = 0; i < len; i++) {
//            for (var j = 0; j < len; j++) {
//
//                scope.call("scene/addActor", {
//                    type:"demos/physics/ballCascade",
//                    actorId:"cascade" + nAdded,
//                    useWorker:cfg.useWorkers,
//                    pos:{
//                        x:(i * 20) - (len * 10),
//                        y:0,
//                        z:(j * 20) - (len * 10)
//                    },
//                    numBalls:numBalls
//                });
//
//                nAdded++;
//            }
//        }

        /* Camera orbit about Euler angles
         */
        this.call("scene.addActor", {
            type:"scene/camera/input/eulerOrbit",
            yaw:-35,
            pitch:-40,
            minPitch:-80,
            maxPitch:0,
            radius:200
        });


        /* Ground
         */
        this.call("scene.addActor", {
            type:"objects/ground/grid2"
        });


//        /* Integrate the systems on each tick
//         */
//        scope.subscribe("scene/tick", function () {
//            for (var i = 0; i < numSystems; i++) {
//                scope.call("cascade" + i + ".integrate");
//            }
//        });


        this._destroy = function () {

        };
    }
});