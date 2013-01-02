
define(
    function () {

        return function (configs) {

            var minPitch = configs.minPitch != undefined ? configs.minPitch : -80;
            var maxPitch = configs.maxPitch != undefined ? configs.maxPitch : 80;

            var speed = 0;

            /* Camera orbit about Euler angles
             */
            this.call("addActor", {
                type:"camera/behaviour/airplane",
                actorId:"airplane",
                speed:configs.speed || 0,
                eye: configs.eye,
                look: configs.look,
                up: configs.up
            });

            var roll = configs.roll || 0;
            var pitch = configs.pitch || 0;

            var self = this;

            setAngles(roll, pitch);

            function setAngles(yaw, pitch) {

                if (pitch < minPitch) {
                    pitch = minPitch;

                } else if (pitch > maxPitch) {
                    pitch = maxPitch;
                }

                self.call("airplane/set", {
                    roll:roll,
                    pitch:pitch
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

                        roll += ((params.canvasX - lastX) * 0.1);
                        pitch += ((params.canvasY - lastY) * 0.1);

                        setAngles(roll, pitch);
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

                    speed += (params.delta * 0.2);

                    self.call("airplane/set", {
                        speed:speed
                    });
                });
        };
    });