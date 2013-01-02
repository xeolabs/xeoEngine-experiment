/**
 *
 */
define(function () {

    return function (scope, configs) {

        /*-------------------------------------------------------------------------------------------------
         * Load a "template" actor which creates actors for scene graph, mouse, camera etc.
         *-----------------------------------------------------------------------------------------------*/

        scope.call("addActor", {
            type:"templates/template1",
            actorId:"template",
            canvasId:configs.canvasId

        }).subscribe(
            "template.ready",
            function () {


                /* Path
                 */
                scope.call("addActor", {
                    type:"utils/path",
                    actorId:"path",
                    show: true,
                    tightness:.5,
                    points:[
                        {
                            x:-250, y:50, z:0
                        },
                        {
                            x:0, y:40, z:0
                        },
                        {
                            x:100, y:-30, z:50
                        },
                        {
                            x:250, y:10, z:0
                        }
                    ]
                });

                /* Add city
                 */
                scope.call("addActor", {
                    type:"objects/buildings/city",
                    xPos:0,
                    zPos:0,
                    xBuildings:6,
                    zBuildings:8,
                    xWidth:600,
                    zWidth:600,
                    streetWidth:20
                });

                var factor = 0;

                scope.subscribe("scene.tick",
                    function (params) {
                        scope.call("path.setFactor", { factor:factor });
                        factor += 0.001;
                    });


                /* Camera orbit about Euler angles
                 */
                scope.call("addActor", {
                    type:"scene/camera/input/eulerOrbit",
                    pitch:-20,
                    minPitch:-80,
                    maxPitch:0,
                    radius:400
                });

                /* Add ground
                 */
                scope.call("addActor", {
                    type:"objects/ground/grid2"
                });
            });
    }
});