/**

 Tank driving behaviour

 Examples
 --------

 // Create tank

 scope.call("addActor", {
        type:"objects/vehicles/tank",
        actorId:"myTank"
    });

 // Create driving behaviour, attached to tank

 scope.call("addActor", {
        type:           "objects/vehicles/tank/behaviour/drive",
        actorId:        "myDrive",,
        tankActorId:    "myTank"
    });

 // Drive forwards while turning entire tank 0.3 degrees per second

 scope.call("myTankDrive.set", {
        speed: 2.0,
        yawRate: 0.3,
        gunYawRate:0.0
    });

 // Stop, but continue turning tank

 scope.call("myTankDrive.set", {
        speed: 0.0
    });

 // Drive backwards, stop turning tank, start turning gun -1 degrees per second

 scope.call("myTankDrive.set", {
        speed: -1.0,
        yawRate: 0.0,
        gunYawRate:-1.0
    });

 // Set discrete tank direction, continue turning from there

 scope.call("myTankDrive.set", {
        yaw: 45.0
    });

 // Stop turning tank body, set discrete tank gun direction, start turning gun in other direction

 scope.call("myTankDrive.set", {
        yawRate: 0,
        gunYaw: 45.0,
        gunYawRate: 0.3
    });

 */
define([
    "lib/gl-matrix.js"
],
    function () {

        return function (cfg) {

            /* Current tank state
             */
            var yaw = 0;
            var gunYaw = 0;
            var pos = { x:0, y:0, z:0};


            /* Animation targets
             */
            var yawRate = 0;
            var gunYawRate = 0;


            var speed = 0;


            /* Set initial tank state
             */
            this.call("setYaw", { yaw:yaw });
            this.call("setGunYaw", { gunYaw:gunYaw });

            var self = this;

            /* Update tank state for animation
             */
            var tick = this.subscribe("tick",
                function () {

                    if (yawRate != 0) {
                        yaw += yawRate;
                        self.call("setYaw", { yaw:yaw });
                    }

                    if (gunYawRate != 0) {
                        gunYaw += gunYawRate;
                        self.call("setGunYaw", { gunYaw:gunYaw });
                    }

                    if (speed) {

                        var vecRotMat = Tron_math_rotationMat4v(yaw * 0.0174532925, [0, 1, 0]);
                        var v = Tron_math_mulMat4v4(vecRotMat, [0, 0, -speed, 1]);

                        var moveVec = {
                            x:v[0],
                            y:v[1],
                            z:v[2]
                        };

                        pos.x += moveVec.x;
                        pos.y += moveVec.y;
                        pos.z += moveVec.z;

                        self.call("setPos", pos);
                    }
                });


            this.set = function (params) {

                if (params.speed != undefined) {
                    speed = params.speed;
                }

                if (params.yaw != undefined) {
                    this.call("setYaw", { yaw:params.yaw });
                    yaw = params.yaw;
                }

                if (params.gunYaw != undefined) {
                    this.call("setGunYaw", { gunYaw:params.gunYaw });
                    gunYaw = params.gunYaw;
                }

                if (params.yawRate != undefined) {
                    yawRate = params.yawRate;
                }

                if (params.gunYawRate != undefined) {
                    gunYawRate = params.gunYawRate;
                }
            };
        };
    });
