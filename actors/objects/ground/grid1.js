define(["lib/scenejs/scenejs.box.js"],

    function () {

        /**
         * grid1
         * Ground grid plane
         * @name grid1
         * @class grid1
         * @constructor
         * @return  constructor
         */
        return function (configs) {

            var scene = this.getResource("scene");

            var nodeId = configs.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var root = node.addNode({
                type:"material",
                baseColor:{ r:1.0, g:1.0, b:1.0 },
                specularColor:{ r:0.0, g:0.0, b:0.0 },
                specular:0.2,
                shine:2.0,

                nodes:[
                    {
                        type:"texture",
                        coreId:"__scope_floor_texture", // In case many of these are created, reuse cores for efficiency
                        layers:[
                            {
                                uri:"textures/grid4.jpg", // relative to the location of index.html
                                minFilter:"linearMipMapLinear",
                                magFilter:"linear",
                                wrapS:"repeat",
                                wrapT:"repeat",
                                isDepth:false,
                                depthMode:"luminance",
                                depthCompareMode:"compareRToTexture",
                                depthCompareFunc:"lequal",
                                flipY:false,
                                width:1,
                                height:1,
                                internalFormat:"lequal",
                                sourceFormat:"alpha",
                                sourceType:"unsignedByte",
                                applyTo:"baseColor",
                                blendMode:"multiply",
                                scale:{ x:1000, y:1000, z:1.0 }
                            }
                        ],
                        nodes:[
                            {
                                type:"scale",
                                x:configs.xSize || 1000,
                                y:.5,
                                z:configs.zSize || 1000,

                                nodes:[
                                    {
                                        type:"geometry",
                                        source:{
                                            type:"box"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            this._destroy = function () {
                root.destroy();
            };
        };
    });
