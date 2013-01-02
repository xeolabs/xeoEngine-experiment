/**
 * World containing a spinning teapot on a ground plane
 */
define(function () {

    return function (configs) {

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

        /* Teapot
         */
        this.call("scene/addActor", {
            type:"objects/prims/teapot"
        });

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