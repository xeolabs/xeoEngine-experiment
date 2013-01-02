/**
 * Tracking camera behaviour
 *
 */
define(
    function () {

        return function (scope, configs) {

            if (!configs.cameraActorId) {
                throw "param expected: cameraActorId";
            }

            var cameraActorId = configs.cameraActorId;

            var eyeSub;
            var lookSub;

            /* Configure
             */

            if (configs.look) {
                setLook(configs.look);
            }

            if (configs.eye) {
                setEye(configs.eye);
            }


            /**
             * Wires the camera look to track the position of an actor.
             *
             * Example:
             *
             * myScope.call("myCamera.look", { actorId: "myObject", topic: "updated", property: "pos" });
             *
             * @param params
             * @param params.actorId Actor to track position of
             * @param params.topic Topic to subscribe to on the actor
             * @param params.property Property that we subscribe to on the topic publications
             */
            function setLook(params) {

                var actorId = params.actorId;

                if (!actorId) {
                    throw "param expected: actorId";
                }

                if (lookSub) {
                    scope.unsubscribe(lookSub);
                }

                var topic = params.topic || "pos";
                var property = params.property;

                lookSub = scope.subscribe(actorId + "." + topic,
                    function (params) {
                        var pos = property ? params[property] : params;
                        if (pos) {
                            scope.call(cameraActorId + ".set", {look:pos});
                        }
                    });
            }


            /**
             * Wires the camera eye to the position of an actor.
             *
             * Example:
             *
             * myScope.call("myCamera.look", { actorId: "myObject", topic: "updated", property: "pos" });
             *
             * @param params
             * @param params.actorId Actor to track position of
             * @param params.topic Topic to subscribe to on the actor
             * @param params.property Property that we subscribe to on the topic publications
             */
            function setEye(params) {

                var actorId = params.actorId;

                if (!actorId) {
                    throw "param expected: actorId";
                }

                if (eyeSub) {
                    scope.unsubscribe(eyeSub);
                }

                var topic = params.topic || "pos";
                var property = params.property;

                eyeSub = scope.subscribe(actorId + "." + topic,
                    function (params) {
                        var pos = property ? params[property] : params;
                        if (pos) {
                            scope.call(cameraActorId + ".set", {eye:pos});
                        }
                    });
            }

            this._destroy = function () {

            };
        };
    });
