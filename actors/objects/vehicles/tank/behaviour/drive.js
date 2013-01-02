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
    "../../../.././gl-matrix"
],
    function () {

        return function (scope, configs) {

            var tankActorId = configs.tankActorId;

            if (!tankActorId) {
                throw "param expected: tankActorId";
            }


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
            scope.call(tankActorId + ".setYaw", { yaw:yaw });
            scope.call(tankActorId + ".setGunYaw", { gunYaw:gunYaw });


            /* Update tank state for animation
             */
            var tick = scope.subscribe("scene.tick", function () {

                if (yawRate != 0) {
                    yaw += yawRate;
                    scope.call(tankActorId + ".setYaw", { yaw:yaw });
                }

                if (gunYawRate != 0) {
                    gunYaw += gunYawRate;
                    scope.call(tankActorId + ".setGunYaw", { gunYaw:gunYaw });
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

                    scope.call(tankActorId + ".setPos", pos);
                }
            });


            this.set = function (params) {

                if (params.speed != undefined) {
                    speed = params.speed;
                }

                if (params.yaw != undefined) {
                    scope.call(tankActorId + ".setYaw", { yaw:params.yaw });
                    yaw = params.yaw;
                }

                if (params.gunYaw != undefined) {
                    scope.call(tankActorId + ".setGunYaw", { gunYaw:params.gunYaw });
                    gunYaw = params.gunYaw;
                }

                if (params.yawRate != undefined) {
                    yawRate = params.yawRate;
                }

                if (params.gunYawRate != undefined) {
                    gunYawRate = params.gunYawRate;
                }
            };

            this._destroy = function () {
                scope.unsubscribe(tick);
            };
        };
    });
