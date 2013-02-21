/*

 User input control of tank using driving behaviour

 Examples:
 ---------

 // Create tank

 scope.call("addActor", {
 type:"objects/vehicles/tank",
 actorId:"myTank"
 });

 // Create driving control

 scope.call("addActor", {
 type:"objects/vehicles/tank/input/drive",
 mouseActorId:"mouse",
 tankActorId:"tank",

 // Optional sensitivity factors, all default to 1.0

 yawSensitivity: 1.0,
 gunYawSensitivity: 1.0,
 speedSensitivity: 1.0
 });

 // The tank is now under mouse control.

 */
define(
    function () {

        return function (cfg) {

            var mouseActorId = cfg.mouseActorId || "mouse";
            var behaviourActorId = cfg.actorId + "-orbit";
            var tankActorId = cfg.tankActorId || "tank";

            var yawSensitivity = cfg.yawSensitivity || 1.0;
            var gunYawSensitivity = cfg.gunYawSensitivity || 1.0;
            var speedSensitivity = cfg.speedSensitivity || 1.0;

            scope.call("addActor", {
                type:"objects/vehicles/tank/behaviour/drive",
                actorId:behaviourActorId,
                tankActorId:tankActorId
            });

            scope.call(behaviourActorId + ".set", {
                speed:speed,
                yaw:0,
                yawRate:0,
                gunYaw:0,
                gunYawRate:0
            });

            var yawRate = 0;
            var gunYaw = 0;
            var gunYawRate = 0;
            var speed = 0;

            var downX;
            var downY;

            var lastX;
            var lastY;

            var dragging = false;


            var mouseDownSub = scope.subscribe(
                mouseActorId + ".down",
                function (params) {
                    dragging = true;

                    downX = params.canvasX;
                    downY = params.canvasY;

                    lastX = params.canvasX;
                    lastY = params.canvasY;
                });

            var mouseMoveSub = scope.subscribe(
                mouseActorId + ".move",
                function (params) {

                    if (dragging) {
                        if (params.ctrlKey) {

                            /* Rotate gun when CTRL is down
                             */
                            gunYawRate = ((params.canvasX - downX) * -0.003 * gunYawSensitivity);
                            scope.call(behaviourActorId + ".set", { gunYawRate:gunYawRate });

                        } else {

                            /* Else rotate tank chassis
                             */
                            yawRate = ((params.canvasX - downX) * -0.005 * yawSensitivity);
                            scope.call(behaviourActorId + ".set", { yawRate:yawRate });
                        }

                        lastX = params.canvasX;
                        lastY = params.canvasY;
                    }
                });

            var mouseUpSub = scope.subscribe(
                mouseActorId + ".up",
                function (params) {
                    dragging = false;
                });

            var mouseWheelSub = scope.subscribe(
                mouseActorId + ".wheel",
                function (params) {

                    speed += (params.delta * 0.1 * speedSensitivity);
                    scope.call(behaviourActorId + ".set", { speed:speed });
                });

            var mouseClickSub = scope.subscribe(
                mouseActorId + ".dblclick",
                function (params) {

                    speed = 0;
                    yawRate = 0;
                    gunYawRate = 0;

                    scope.call(behaviourActorId + ".set", { speed:speed, yawRate:0, gunYawRate:0  });
                });

            this._destroy = function () {
                scope.unsubscribe(mouseDownSub);
                scope.unsubscribe(mouseMoveSub);
                scope.unsubscribe(mouseUpSub);
                scope.unsubscribe(mouseWheelSub);
                scope.unsubscribe(mouseClickSub);
            };
        };
    });