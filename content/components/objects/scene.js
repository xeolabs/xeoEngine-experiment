define(function () {

    /**
     * RPC object that creates and wraps a {@link SceneJS.Scene}
     * @constructor
     */
    return function (objectId, nexus, configs) {

        if (!configs.canvasId) {
            throw "param expected: canvasId";
        }

        var sceneId = configs.sceneId || "default";

        var startTime;

        var scene = SceneJS.createScene({
            type:"scene",
            id:sceneId,
            canvasId:configs.canvasId
        });

        startTime = (new Date()).getTime();

        /* Emit a "<objectId>.tick" event on each cycle of the render loop
         */
        scene.onEvent("idle",
            function () {
                nexus.publish(objectId + ".tick", {
                    timeElapsed:(new Date()).getTime() - startTime
                });
            });

        startTime = (new Date()).getTime();
        scene.start();


        /**
         * Starts the scene render loop, begins firing "<objectId>.tick" events
         * @param params
         * @param ok
         */
        this.start = function (params, ok) {

            startTime = (new Date()).getTime();
            scene.start(params);

            if (ok) {
                ok();
            }
        };


        /**
         * Stops the scene render loop, stops firing "<objectId>.tick" events
         * @param ok
         */
        this.stop = function (ok) {

            scene.stop();

            if (ok) {
                ok();
            }
        };


        /**
         * Calls an addXXX method on a node in the scene graph. The target node will
         * be the root {@link SceneJS.Scene} node by default.
         * @param params
         * @param {String} params.nodeId ID of optional target {@link SceneJS.Node} - defaults to {@link SceneJS.Scene} by default
         * @param ok
         * @param error
         */

        this.add = function (params, ok, error) {

            var node = getNode(params.nodeId);

            delete params.nodeId;

            node.add(params);

            if (ok) {
                ok();
            }
        };

        function getNode(nodeId) {

            if (nodeId) {

                var node = scene.getNode(nodeId);

                if (!node) {
                    throw "node not found: " + nodeId;
                }

                return node;

            } else {
                return scene;
            }
        }

        /**
         * Calls a setXXX method on a node in the scene graph. The target node will
         * be the root {@link SceneJS.Scene} node by default.
         * @param params
         * @param {String} params.nodeId ID of optional target {@link SceneJS.Node} - defaults to {@link SceneJS.Scene} by default
         * @param ok
         * @param error
         */
        this.set = function (params, ok, error) {

            var node = getNode(params.nodeId);

            delete params.nodeId;

            node.set(params);

            if (ok) {
                ok();
            }
        };


        /**
         * Gets the state of either a target scene graph node or the scene root by default
         * @param params
         * @param ok
         * @param error
         */
        this.get = function (params, ok, error) {

        };


        /**
         * Deletes members on a target node
         * @param params
         * @param ok
         * @param error
         */
        this.delete = function (params, ok, error) {

            var node = getNode(params.nodeId);

            node.destroy();

            if (ok) {
                ok();
            }
        };


        /**
         * Fires a "scene.pickhit" event for any hit on
         * a named object in the scene, or a "scene.pickmiss" if nothing hit
         *
         * @param params
         * @param params.canvasX
         * @param params.canvasY
         * @param params.rayPick
         * @param ok
         * @param error
         */
        this.pick = function (params, ok, error) {

            var canvasX = params.canvasX;
            var canvasY = params.canvasY;

            if (canvasX == undefined || canvasX == null) {
                error("param expected: canvasX");
                return;
            }

            if (canvasY == undefined || canvasY == null) {
                error("param expected: canvasY");
                return;
            }

            var hit = scene.pick(canvasX, canvasY, params);

            scene.renderFrame({ force:true });     // HACK: Fixes black flicker after picking

            if (hit) {
                nexus.publish(objectId + ".pickhit", hit);

            } else {
                nexus.publish(objectId + ".pickmiss", params);
            }
        };


        /**
         *
         */
        this._destroy = function () {

            /* Destroy the scene graph
             */
            scene.destroy();
        }
    };

});