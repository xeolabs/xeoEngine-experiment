define(

    function () {

        return function (cfg) {

            if (!cfg.node) {
                throw "param expected: node";
            }

            var scene = this.getResource("scene");

            var nodeId = cfg.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId ;
            }

            var root = node.addNode(cfg.node);

            this._destroy = function () {
                root.destroy();
            };
        };
    });
