/**
 * scope.call("addActor", {
 *      type: "./route",
 *      source: "scope3/tank.pos",
 *      target: "scope4/camera.setLook"
 * });
 *
 */
define(
    function () {

        return function (scope, configs) {

            var source = configs.source;

            if (!source) {
                throw "param expected: source";
            }

            var target = configs.target;
            if (!target) {
                throw "param expected: target";
            }

            scope.subscribe(source,
                function (params) {
                    scope.call(target, params);
                });
        };
    });
