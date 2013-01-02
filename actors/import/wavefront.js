/**

    Mesh loaded from WaveFront .OBJ format


    XXX.call("addActor", {
        type:"import/wavefront",
        actorId:"trex",
        src:"content/models/wavefront/trex/dtrex.obj",
        nodeId:"putModelHere"
    });
 */
define([
    "../../libs/obj-loader"
],

    function (loader) {

        return function (scope, configs) {

            var scene = this.getObject("scene");

            var nodeId = configs.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var src = configs.src;
            if (!src) {
                throw "param expected: src";
            }

            var root = node.addNode({ type:"node" });

            scope.publish("task.started", {
                taskId:configs.actorId + ".create." + src,
                description:"Loading OBJ from " + src
            });

            loader.load(
                configs,
                root,

                function () {

                    scope.publish("task.finished", {
                        taskId:configs.actorId + ".create." + src
                    });
                },

                function (err) {

                    root.destroy();

                    scope.publish("task.failed", {
                        taskId:configs.actorId + ".create." + src,
                        error:err
                    });
                });

            this._destroy = function () {
                root.destroy();
            };
        };
    });