/**

 Schedules calls to happen at given timeouts or intervals

 Examples:

 scope.call("addActor", {
    type:"utils/schedule",
    actorId:"schedule1",
    method:"camera.set",
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


 scope.call("addActor", {
    type:"utils/schedule",
    actorId:"schedule2",
    calls:[
        {
            time:1,
            method:"camera.set",
            params:{
                eye: { x: -50, y: 20, z: -200 },
                look: { x: 0, y: 0, z: 0 }
            }
        },
        {
            time:7,
            method:"camera.set",
            params:{
                eye: { x: 0, y: 20, z: -200 },
                look: { x: 0, y: 0, z: 0 }
            }
        },
        {
            time:21,
            method: "addActor",
            params{
                type:"objects/ground/grid2",
                actorId:"ground"
            });
        }
    ]
 });


 */
define(
    function () {

        /**
         * @param configs
         * @param configs.method Optional method reference when we want to call just the one method repeatedly
         * @param configs.calls Schedule of calls to make
         * @param configs.autoRemove Should actor remove itself when all calls made?
         */
        return function (scope, configs) {

            var method = configs.method;
            var calls = configs.calls;

            if (!calls) {
                throw "param expected: calls";
            }

            var autoRemove = configs.autoRemove;

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
                                    //console.log(JSON.stringify(c));
                                    scope.call(c.method || method, c.params);
                                },
                                c.time * 1000);

                    } else {

                        timeouts[j] =
                            setTimeout(
                                function () {
                                    //console.log(JSON.stringify(c));
                                    scope.call(c.method || method, c.params);
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
