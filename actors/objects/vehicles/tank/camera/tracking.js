/**
 * Makes a camera track behind a tank
 *
 */
define([
    "../../../.././gl-matrix"
],
    function () {

        return function (scope, configs) {

            var tankActorId = configs.tankActorId;
            var cameraActorId = configs.cameraActorId;


            if (!tankActorId) {
                throw "param expected: tankActorId";
            }

            if (!cameraActorId) {
                throw "param expected: cameraActorId";
            }


            var enabled = configs.enabled != undefined ? !!configs.enabled : true;

            var trackEye = configs.trackEye != undefined ? configs.trackEye : false;
            var trackLook = configs.trackLook != undefined ? configs.trackLook : true;

            var tankPos;
            var tankDir;


            /* Subscribe to tank position
             */
            var tankPosSub = scope.subscribe(tankActorId + ".pos",
                function (params) {
                    tankPos = params;
                });


            /* Subscribe to tank heading
             */
            var tankDirSub = scope.subscribe(tankActorId + ".dir",
                function (params) {
                    tankDir = params.dir;
                });


            /* Update camera for tank position and heading on each scene tick
             */
            var tickSub = scope.subscribe("scene.tick",
                function (params) {

                    if (enabled && tankPos && tankDir != undefined) {

                        var vecRotMat = Tron_math_rotationMat4v(tankDir * 0.0174532925, [0, 1, 0]); // Y-axis rotation matrix
                        var v = Tron_math_mulMat4v4(vecRotMat, [0, 0, 30, 1]);

                        var eye = {
                            x:tankPos.x + v[0],
                            y:10,
                            z:tankPos.z + v[2]
                        };

                        if (trackEye) {
                            scope.call(cameraActorId + ".setEye", eye);
                        }

                        var look = {
                            x:tankPos.x,
                            y:7,
                            z:tankPos.z
                        };

                        if (trackLook) {
                            scope.call(cameraActorId + ".setLook", look);
                        }
                    }
                });


            /** Enable or disable this behaviour
             *
             * @param params
             * @param params.enabled Flag to enable or disable this behaviour
             */
            this.setEnabled = function (params) {
                enabled = !!params.enabled;
            };


            this.trackEye = function (params) {
                trackEye = params.enabled;
            };

            this.trackLook = function (params) {
                trackLook = params.enabled;
            };

            this._destroy = function () {

            };
        }
    });