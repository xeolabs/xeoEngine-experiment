/**
 *
 * Camera airplane flight behaviour
 *
 */
define([
    "lib/gl-matrix"
],
    function () {

        return function (scope, configs) {

            var cameraActorId = configs.cameraActorId;

            if (!cameraActorId) {
                throw "param expected: cameraActorId";
            }

            var eye = null;
            var look = null;
            var up = null;

            var pitch = 0;
            var yaw = 0;
            var radius = 100;

            var dirty = true;

            var cameraEyeSub = scope.subscribe(cameraActorId + ".eye",
                function (params) {
                    eye = {x:params.x, y:params.y, z:params.z };
                });

            var cameraLookSub = scope.subscribe(cameraActorId + ".look",
                function (params) {
                    look = {x:params.x, y:params.y, z:params.z };
                });

            var cameraUpSub = scope.subscribe(cameraActorId + ".up",
                function (params) {
                    up = {x:params.x, y:params.y, z:params.z };
                });


            /* Update camera orbit if angles dirty
             */
            var tickSub = scope.subscribe("scene.tick",
                function () {

                    if (!look || !eye || !up) { // No camera found yet
                        return;
                    }

                    if (dirty) {

                        var vec = [look.x - eye.x, look.y - eye.y, look.z - eye.z, 1];

                        var yawMat = Tron_math_rotationMat4v(yaw * 0.0174532925, [0, 1, 0]);
                        var pitchMat = Tron_math_rotationMat4v(pitch * 0.0174532925, [1, 0, 0]);

                        vec = Tron_math_normalizeVec4(vec);
                        vec = Tron_math_mulMat4v4(pitchMat, vec);
                        vec = Tron_math_mulMat4v4(yawMat, vec);

                        var eye2 = {
                            x:look.x - vec[0] * radius,
                            y:look.y - vec[1] * radius,
                            z:look.z - vec[2] * radius
                        };

                        scope.call(cameraActorId + ".set", {
                            eye:eye2
                        });

                        dirty = false;
                    }
                });


            /**
             * Update orbit angles
             *
             * @param params
             * @param params.yaw Yaw degrees
             * @param params.pitch Pitch degrees
             */
            this.set = function (params) {

                if (params.yaw != undefined) {
                    yaw = params.yaw;
                    dirty = true;
                }

                if (params.pitch != undefined) {
                    pitch = params.pitch;
                    dirty = true;
                }

                if (params.radius != undefined) {
                    radius = params.radius;
                    dirty = true;
                }
            };

            this._destroy = function () {
                scope.unsubscribe(cameraEyeSub);
                scope.unsubscribe(cameraLookSub);
                scope.unsubscribe(cameraUpSub);
                scope.unsubscribe(tickSub);
            };
        };
    });
