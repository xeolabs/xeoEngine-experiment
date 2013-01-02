/**
 *
 * Mouse rotates camera 'eye' about 'look' using Euler angles
 *
 */
define(
    function () {

        return function (configs) {

            var minPitch = configs.minPitch != undefined ? configs.minPitch : -80;
            var maxPitch = configs.maxPitch != undefined ? configs.maxPitch : 80;

            var yaw = configs.yaw || 0;
            var pitch = configs.pitch || 0;
            var radius = configs.radius || 100;

            this.call("addActor", {
                type:"camera/behaviour/eulerOrbit",
                actorId:"orbit"
            });

            var self = this;

            setOrbit(yaw, pitch, radius);

            function setOrbit(yaw, pitch, radius) {

                if (pitch < minPitch) {
                    pitch = minPitch;
                } else if (pitch > maxPitch) {
                    pitch = maxPitch;
                }

                self.call("orbit/set", {
                    yaw:yaw,
                    pitch:pitch,
                    radius:radius
                });
            }

            var lastX;
            var lastY;

            var dragging = false;

            this.addActor({
                type:"mouse",
                actorId:"mouse"
            });

            this.subscribe(
                "mouse/mousedown",
                function (params) {
                    dragging = true;
                });

            this.subscribe(
                "mouse/mousemove",
                function (params) {

                    if (dragging && lastX != null) {

                        yaw += ((params.canvasX - lastX) * -0.1);
                        pitch += ((params.canvasY - lastY) * -0.1);

                        setOrbit(yaw, pitch, radius);
                    }

                    lastX = params.canvasX;
                    lastY = params.canvasY;
                });

            this.subscribe(
                "mouse/mouseup",
                function (params) {
                    dragging = false;
                    lastX = null;
                });

            this.subscribe(
                "mouse/mousewheel",
                function (params) {

                    radius += (params.delta * 30.0);

                    setOrbit(yaw, pitch, radius);
                });
        };
    });