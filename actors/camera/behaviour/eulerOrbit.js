/**
 *
 * Camera airplane flight behaviour
 *
 */
define([
    "lib/gl-matrix"
],
    function () {

        return function (cfg) {

            var eye = cfg.eye || {};
            eye = {
                x : eye.x != undefined ? eye.x : 0,
                y : eye.y != undefined ? eye.y : 0,
                z : eye.z != undefined ? eye.z : 100
            };

            var look = cfg.look || {};
            look = {
                x : look.x != undefined ? look.x : 0,
                y : look.y != undefined ? look.y : 0,
                z : look.z != undefined ? look.z : 0
            };

            var up = cfg.up || {};
            up = {
                x : up.x != undefined ? up.x : 0,
                y : up.y != undefined ? up.y : 1,
                z : up.z != undefined ? up.z : 0
            };

            var eye3;

            var pitch = 0;
            var yaw = 0;
            var radius = 100;
            var targetLook = null;

            var anglesDirty = true;
            var flying = false;
            var flight = null;
            var flyToLook;

            this.addActor({
                type:"camera",
                actorId:"camera",
                eye:eye,
                look:look,
                up:up
            });

            var self = this;

            /* Update camera orbit if angles anglesDirty
             */
            this.subscribe("tick",
                function () {

                    if (anglesDirty) {

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

                        eye3 = eye2;

                        self.call("camera/set", {
                            eye:eye2
                        });

                        anglesDirty = false;
                    }

                    if (flying) {

                        if (!flight) {
                            flight = {

                                startLook:[ look.x || 0, look.y || 0, look.z || 0],
                                endLook:flyToLook,
                                t:0
                            };
                        }

                        var vec = [look.x - eye3.x, look.y - eye3.y, look.z - eye3.z, 1];

                        if (flight.t >= 1) {

                            flying = false;
                            flight = null

                        } else {

                            var look2 = Tron_math_lerpVec3(flight.t, 0, 1, flight.startLook, flight.endLook);

                            //    radius = 1;

                            var eye2 = {
                                x:look2[0] - vec[0],
                                y:look2[1] - vec[1],
                                z:look2[2] - vec[2]
                            };

                            self.call("camera/set", {
                                eye:eye2,
                                look:{
                                    x:look2[0],
                                    y:look2[1],
                                    z:look2[2]
                                }
                            });

                            look = { x:look2[0], y:look2[1], z:look2[2] };
                            eye3 = eye2;

                            flight.t += 0.05;
                        }
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
                    anglesDirty = true;
                }

                if (params.pitch != undefined) {
                    pitch = params.pitch;
                    anglesDirty = true;
                }

                if (params.radius != undefined) {
                    radius = params.radius;
                    anglesDirty = true;
                }

                if (params.look != undefined) {
                    flyToLook = [ params.look.x || 0, params.look.y || 0, params.look.z || 0];
                    flying = true;
                    flight = null;
                }
            };
            
            /* Initialise from configs
             */
            this.set(cfg);
        }
    });
