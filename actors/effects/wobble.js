define(
    function () {

        var libCreated = false;

        return function (scope, configs) {

            var sceneId = scope.scopeId + "." + (configs.sceneId || "scene");

            var scene = SceneJS.getScene(sceneId);
            if (!scene) {
                throw "scene not found: " + sceneId;
            }

            var nodeId = configs.nodeId;
            if (!nodeId) {
                throw "param expected: nodeId";
            }

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "node not found in scene: [nodeId = " + nodeId + ", sceneId = " + sceneId + "]";
            }

            var shader;
            var shaderParams;

            var coreId = "___wobble-shader";

            if (!libCreated) {

                node.addNode({
                    type:"shader",
                    coreId:coreId,

                    shaders:[
                        {
                            stage:"vertex",
                            code:[
                                "uniform float magnitudeX;",
                                "uniform float magnitudeY;",
                                "uniform float magnitudeZ;",
                                "uniform float time;",

                                "vec4 myModelPosFunc(vec4 pos){",
                                "   pos.x+=sin(pos.y*5.0+time+10.0)*magnitudeX;",
                                "   pos.y+=sin(pos.y*5.0+time+10.0)*magnitudeY;",
                                "   pos.z+=sin(pos.y*5.0+time+10.0)*magnitudeZ;",
                                "   return pos;",
                                "}"
                            ],
                            hooks:{
                                modelPos:"myModelPosFunc"
                            }
                        }
                    ],

                    params:{
                        time:0.0,
                        magnitudeX: 0.3,
                        magnitudeY: 0.6,
                        magnitudeZ: 0.3
                    }
                });

                libCreated = true;
            }

            shader = node.insertNode({
                type:"shader",
                coreId:coreId
            });

            shaderParams = node.insertNode({
                type:"shaderParams",
                params:configs.params || {}
            });


            /**
             * Sets parameters on this shader
             * @param params
             */
            this.set = function (params) {
                shaderParams.setParams(params || {});
            };

            /**
             * Destructor
             */
            this._destroy = function () {
                shader.splice();
                shaderParams.splice();
            };
        };
    });