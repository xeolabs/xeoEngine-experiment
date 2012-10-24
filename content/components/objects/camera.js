/**
 * Camera manager
 */
define(function () {

    /**
     * @constructor
     */
    return function (objectId, nexus, configs) {

        var sceneId = configs.sceneId;
        if (!sceneId) {
            throw "param expected: sceneId";
        }

        var nodeId = configs.nodeId;
        if (!nodeId) {
            throw "param expected: nodeId";
        }

        var scene = SceneJS.getScene(sceneId);
        if (!scene) {
            throw "scene not found: " + sceneId;
        }

        var lookat = scene.getNode(nodeId);

        if (!lookat) {
            throw "node not found in scene: [nodeId = " + nodeId + ", sceneId = " + sceneId + "]";
        }

        if (lookat.getType() != "lookAt") {
            throw "scene node should be a 'lookat' type: " + nodeId;
        }


        /**
         * Sets camera state
         * @param params
         * @param ok
         */
        this.set = function (params) {

            var updated = false;

            if (params.eye) {
                lookat.setEye(params.eye);
                updated = true;
            }

            if (params.look) {
                lookat.setLook(params.look);
                updated = true;
            }

            if (params.up) {
                lookat.setUp(params.up);
                updated = true;
            }

            if (updated) {
                nexus.publish(objectId + ".update", { // Notify listeners if camera was updated.
                    eye:lookat.getEye(),
                    look:lookat.getLook(),
                    up:lookat.getUp()
                });
            }
        };

        /**
         * Gets camera state
         * @param params
         * @param ok
         * @return {Object}
         */
        this.get = function (params) {

            var data = {
                eye:lookat.getEye(),
                look:lookat.getLook(),
                up:lookat.getUp()
            };

            if (ok) {
                ok(data);
            }

            return data;
        };

        /**
         * Destructor
         */
        this._destroy = function () {
        }
    };
});
