/**
 * World containing a tank, with camera point-of-interest tracking the tank position
 */
define(function () {

    return function (scope, configs) {

        if (!configs.canvasId) {
            throw "param expected: canvasId";
        }

        /* Scene
         */
        this.call("addActor", {
            type:"scene",
            actorId:"scene",
            canvasId:configs.canvasId
        });


        /* Tron tank
         */
        scope.call("scene/addActor", {
            type:"objects/vehicles/tank",
            actorId:"tank"
        });


        /* Tank pilot - animates the tank
         */
//                scope.call("addActor", {
//                    type:"objects/vehicles/tank/pilot",
//                    actorId:"pilot",
//                    tankActorId:"tank"
//                });


        scope.call("addActor", {
            type:"scene/camera/flight",
            actorId:"cameraFlight",
            cameraActorId:"camera"
        });

        /* Camera tracking of tank position and direction
         */
        scope.call("addActor", {
            type:"objects/vehicles/tank/cameraTracking",
            actorId:"cameraTracking",
            tankActorId:"tank",
            cameraActorId:"camera",
            trackLook:true,
            trackEye:false
        });

        scope.call("camera.setEye", { x:100, y:60, z:-100 });

        /* Ground
         */
        scope.call("addActor", {
            type:"objects/ground/grid2"
        });

        scope.call("pilot.setPos", { x:0, y:0, z:900 });

        scope.call("addActor", {
            type:"utils/schedule",
            calls:[
                {
                    time:1,
                    method:"pilot.setSpeed",
                    params:{
                        speed:1.5
                    }
                },
                {
                    time:5,
                    method:"pilot.turn",
                    params:{
                        speed:0.1
                    }
                },
                {
                    time:10,
                    method:"cameraTracking.trackEye",
                    params:{
                        enabled:true
                    }
                },

                {
                    time:5,
                    method:"pilot.turnGun",
                    params:{
                        speed:-0.1
                    }
                },
                {
                    time:10,
                    method:"pilot.turn",
                    params:{
                        speed:-.5
                    }
                },
                {
                    time:20,
                    method:"cameraTracking.trackEye",
                    params:{
                        enabled:false
                    }
                },

            ]
        });

        /* Add building
         */
        scope.call("addActor", {
            type:"objects/buildings/city",
            actorId:"myCity",

            xPos:0,
            zPos:0,

            xBuildings:6,
            zBuildings:8,

            xWidth:600,
            zWidth:600,

            streetWidth:20
        });
    };

});