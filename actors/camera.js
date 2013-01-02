/**
 * Camera manager
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


                this.setEye = function (params) {
                    this.publish("eye", lookat.setEye(params).getEye());
                };


                this.setLook = function (params) {
                    this.publish("look", lookat.setLook(params).getLook());
                };


                this.setUp = function (params) {
                    this.publish("up", lookat.setUp(params).getUp());
                };


                /* Initialise
                 */
                this.set(cfg);
            };
    });