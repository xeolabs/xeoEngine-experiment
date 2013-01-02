/**
 *
 */
define(function () {

    return function (configs) {

        if (!configs.canvasId) {
            throw "param expected: canvasId";
        }

        /* Add scene
         */
        this.call("addActor", {
            type:"scene",
            actorId:"scene",
            canvasId:configs.canvasId
        });

        /* Tank
         */
        this.call("scene/addActor", {
            type:"objects/vehicles/tank",
            actorId:"tank"
        });

//        /* Tank control
//         */
//        this.call("scene/addActor", {
//            type:"objects/vehicles/tank/input/drive",
//            mouseActorId:"mouse",
//            tankActorId:"tank"
//        });

        /* Ground
         */
        this.call("scene/addActor", {
            type:"objects/ground/grid2"
        });

        /* Navigation
         */
        this.call("scene/addActor", {
            type:"navigation/eulerOrbit"
        });
    }
});