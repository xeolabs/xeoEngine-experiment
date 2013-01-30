/**
 * Camera management actor
 *
 * - Expects a scene graph resource with a lookat node
 * - Provides methods to set the lookat's eye, look and up
 */
define(
    function () {

        return  function (cfg) {

            var scene = this.getObject("scene");

            var nodeId = cfg.nodeId || "lookat";

            var lookat = scene.getNode(nodeId);

            if (!lookat) {
                throw "scene node not found: " + nodeId;
            }

            if (lookat.getType() != "lookAt") {
                throw "scene node should be a 'lookat' type: " + nodeId;
            }


            /** Sets state of the camera
             *
             * @param params
             * @param params.eye Eye pos
             * @param params.look Look pos
             * @param params.up Up vector
             */
            this.set = function (params) {
                if (params.eye) {
                    this.setEye(params.eye);
                }
                if (params.look) {
                    this.setLook(params.look);
                }
                if (params.up) {
                    this.setUp(params.up);
                }
            };


            /** Sets eye of the camera
             *
             * @param params
             * @param params.eye Eye pos
             */
            this.setEye = function (params) {
                this.publish("eye", lookat.setEye(params).getEye());
            };


            /** Sets look of the camera
             *
             * @param params
             * @param params.look Look pos
             */
            this.setLook = function (params) {
                this.publish("look", lookat.setLook(params).getLook());
            };


            /** Sets up vector of the camera
             *
             * @param params
             * @param params.up Up vector
             */
            this.setUp = function (params) {
                this.publish("up", lookat.setUp(params).getUp());
            };


            /* Initialise from actor configs
             */
            this.set(cfg);
        };
    });