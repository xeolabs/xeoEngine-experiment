/**
 *
 * Camera bicycle behaviour
 *
 */
define([
    "../../../../lib/gl-matrix"
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
            var roll = 0;

            var speed = 0;

            var pitchRate = 0;
            var yawRate = 0;
            var rollRate = 0;

            /* Save initial state from camera
             */
            var startUp = null;
            var startForwardVec = null;


            var self = this;


            var cameraEyeSub = scope.subscribe(cameraActorId + ".eye",
                function (params) {
                    if (!eye) {
                        eye = {x:params.x, y:params.y, z:params.z };
                    }
                });

            var cameraLookSub = scope.subscribe(cameraActorId + ".look",
                function (params) {
                    if (!look) {
                        look = {x:params.x, y:params.y, z:params.z };
                    }
                });

            var cameraUpSub = scope.subscribe(cameraActorId + ".up",
                function (params) {
                    if (!up) {
                        up = {x:params.x, y:params.y, z:params.z };
                    }
                });

            var tickSub = scope.subscribe("scene.tick",
                function () {

                    if (!look || !eye || !up) { // No camera found yet
                        return;
                    }


                    if (pitchRate != 0) {
                        pitch += pitchRate;
                    }

                    speed = pitch * 2.0;

                    if (speed) {

                        if (yawRate != 0) {
                            yaw += yawRate;
                        }

                        if (rollRate != 0) {
                            roll += rollRate;
                        }

                        if (roll < -30) {
                            roll = -30;
                        }
                        if (roll > 30) {
                            roll = 30;
                        }

                        /* Banking - yaw in proportion to roll
                         */
                        yaw += roll * 0.01;

                        if (!startForwardVec) {
                            startForwardVec = [look.x - eye.x, look.y - eye.y, look.z - eye.z];
                        }

                        if (startUp === null) {
                            startUp = [up.x, up.y, up.z];
                        }

                        var yawMat = Tron_math_rotationMat4v(yaw * 0.0174532925, [0, 1, 0]);
                        var rollMat = Tron_math_rotationMat4v(roll * 0.0174532925, [0, 0, 1]);
                        var pitchMat = Tron_math_rotationMat4v(pitch * 0.0174532925, [1, 0, 0]);

                        var rate = -(speed * 0.0005);

                        var forwardVec = [
                            startForwardVec[0] * rate,
                            startForwardVec[1] * rate,
                            startForwardVec[2] * rate,
                            1];

                        forwardVec = Tron_math_mulMat4v4(rollMat, forwardVec);
                        forwardVec = Tron_math_mulMat4v4(pitchMat, forwardVec);
                        forwardVec = Tron_math_mulMat4v4(yawMat, forwardVec);

                        var upVec = [startUp[0], startUp[1], startUp[2], 1];

                        upVec = Tron_math_mulMat4v4(yawMat, upVec);
                        upVec = Tron_math_mulMat4v4(rollMat, upVec);
                        upVec = Tron_math_mulMat4v4(pitchMat, upVec);


                        if (speed) {
                            eye.x += forwardVec[0];
                            //  eye.y += forwardVec[1];
                            eye.z += forwardVec[2];
                        }

                        var look2 = {
                            x:eye.x + (forwardVec[0] * 100.0),
                            //y:eye.y + (forwardVec[1] * 100.0),
                            z:eye.z + (forwardVec[2] * 100.0)
                        };

                        var up2 = {
                            x:upVec[0],
                            y:upVec[1],
                            z:upVec[2]
                        };

                        scope.call(cameraActorId + ".set", {
                            eye:eye,
                            look:look2,
                            up:up2
                        });
                    }
                });


            /**
             * Update this flight behaviour
             *
             * @param params
             * @param params.speed Forward speed
             * @param params.yaw Yaw degrees
             * @param params.roll Roll degrees
             * @param params.pitch Pitch degrees
             * @param params.yawRate Yaw rate degrees per second
             * @param params.rollRate Roll rate degrees per second
             * @param params.pitchRate Pitch rate degrees per second
             */
            this.set = function (params) {

                if (params.speed != undefined) {
                    speed = params.speed;
                }

                if (params.yaw != undefined) {
                    yaw = params.yaw;
                }

                if (params.roll != undefined) {
                    roll = params.roll;
                }

                if (params.pitch != undefined) {
                    pitch = params.pitch;
                }

                if (params.yawRate != undefined) {
                    yawRate = params.yawRate;
                }

                if (params.rollRate != undefined) {
                    rollRate = params.rollRate;
                }

                if (params.pitchRate != undefined) {
                    pitchRate = params.pitchRate;
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
