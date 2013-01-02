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

        /* City
         */
        this.call("scene/addActor", {
            type:"objects/buildings/city",

            xPos:0,
            zPos:0,

            xBuildings:6,
            zBuildings:8,

            xWidth:600,
            zWidth:600,

            streetWidth:20
        });

        /* Ground
         */
        this.call("scene/addActor", {
            type:"objects/ground/grid2"
        });

        /* Navigation
         */
        this.call("scene/addActor", {
            type:"navigation/airplane",

            eye:{
                z:-2000,
                y:40
            },

            look:{
                y:40
            }
        });
    }
});