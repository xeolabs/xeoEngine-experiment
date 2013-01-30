/**

 Schedules calls to happen at given timeouts or intervals

 Examples:

 ActorJS.call("addActor", {
    type:"utils/schedule",
    actorId:"mySchedule1",
    method:"scene/camera/set",
    calls:[
        {
            time:1,
            params:{
                eye: { x: -50, y: 20, z: -200 },
                look: { x: 0, y: 0, z: 0 }
            }
        },
        {
            time:5,
            params:{
                eye: { x: 0, y: 20, z: -200 },
                look: { x: 0, y: 0, z: 0 }
            }
        },
        {
            time:14,
            params:{
                eye: { x: 20, y: 20, z: -100 },
                look: { x: 0, y: 0, z: 0 }
            }
        }
    ]
 });

 ActorJS.call("addActor", {
    type:"utils/schedule",
    actorId:"mySchedule2",
    calls:[
        {
            time:1,
            method:"scene/camera/set",
            params:{
                eye: { x: -50, y: 20, z: -200 },
                look: { x: 0, y: 0, z: 0 }
            }
        },
        {
            time:7,
            method:"scene/camera/set",
            params:{
                eye: { x: 0, y: 20, z: -200 },
                look: { x: 0, y: 0, z: 0 }
            }
        },
        {
            time:21,
            method: "scene/addActor",
            params{
                type:"objects/prims/teapot",
                actorId:"myTeapot"
            });
        }
    ]
 });


 */
define(
    function () {

        /**
         * @param cfg
         * @param cfg.method Optional method reference when we want to call just the one method repeatedly
         * @param cfg.calls Schedule of calls to make
         * @param cfg.autoRemove Should actor remove itself when all calls made?
         */
        return function (cfg) {

            var method = cfg.method;
            var calls = cfg.calls;

            if (!calls) {
                throw "param expected: calls";
            }

            var autoRemove = cfg.autoRemove;

            var intervals = [];
            var timeouts = [];

            var numTimedOut = 0;

            var self = this;

            for (var i = 0, len = calls.length; i < len; i++) {

                (function () {

                    var j = i;
                    var c = calls[i];

                    if (c.repeat) {
                        intervals[j] =
                            setInterval(
                                function () {
                                    self.call(c.method || method, c.params);
                                },
                                c.time * 1000);

                    } else {

                        timeouts[j] =
                            setTimeout(
                                function () {
                                    self.call(c.method || method, c.params);
                                    clearTimeout(timeouts[j]);
                                    timeouts[j] = null;
                                    numTimedOut++;
                                    if (autoRemove && numTimedOut == timeouts.length) {
                                        self._destroy();
                                    }
                                },
                                c.time * 1000);
                    }
                })();
            }

            this._destroy = function () {
                for (var i = 0, len = intervals.length; i < len; i++) {
                    clearInterval(intervals[i]);
                }
                for (var i = 0, len = timeouts.length; i < len; i++) {
                    if (timeouts[i] != null) {
                        clearTimeout(timeouts[i]);
                    }
                }
            }
        };
    });
