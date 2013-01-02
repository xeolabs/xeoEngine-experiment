/**


    addActor({

        type: "bitmapLabel,

        id: "myLabel",

        text:"Attack ships on fire",

        pos: { x: -50, y: 20, z: 0.2 },

        width: 10.0,
        height: 20.0,

        bgFillStyle:"#000000", // Background colour
        textFillStyle:"#FFFFFF", // Text colour, can take a hex value or rgba value (e.g. rgba(255,0,0,0.5))
        font : "64px monospace",
        textAlign:"left", // Alignment of text, e.g. left, center, right
        textBaseline:"top" // Baseline of the text, e.g. top, middle, bottom
    });



    call("bitmapLabel/set", {

        text:"C-beams glitter in the dark",

        pos: { x: 76, y: 20, z: 0.2 },

        width: 15.0,
        height: 5.0,

        bgFillStyle:"#000099", // Background colour
        textFillStyle:"#44FFFF", // Text colour, can take a hex value or rgba value (e.g. rgba(255,0,0,0.5))
        font : "48px monospace",
        textAlign:"right", // Alignment of text, e.g. left, center, right
        textBaseline:"middle" // Baseline of the text, e.g. top, middle, bottom
    });
 */

define(["../.././scenejs.texture.text.js"],

    function () {

        return function (configs) {

            var scene = this.getObject("scene");

            var nodeId = configs.nodeId || "view";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "scene node not found: " + nodeId;
            }

            var root = node.addNode({
                type:"flags",
                flags:{
                    enabled:true
                }
            });

            var translate = root.addNode({
                type:"translate"
            });

            var material = translate.addNode({
                type:"material",
                baseColor:{ r:1.0, g:1.0, b:1.0 },
                specularColor:{ r:0.4, g:0.4, b:0.0 },
                specular:0.2,
                shine:6.0,
                emit:0.2
            });

            /* Texture scale factors
             */
            var uvScale = {
                x:1.5,
                y:1.5
            };

            var pointSize = configs.pointSize || 1.0;

            var texture = material.addNode({
                type:"texture",
                layers:[
                    {
                        // Use plugin defined in scenejs.texture.text.js
                        source:{
                            type:"text",
                            text:configs.text || "",
                            bgFillStyle:configs.bgFillStyle || "#000000", // Background colour
                            textFillStyle:configs.textFillStyle || "#FFFFFF", // Text colour, can take a hex value or rgba value (e.g. rgba(255,0,0,0.5))
                            font:configs.font || "64px monospace",
                            textAlign:"left", // Alignment of text, e.g. left, center, right
                            textBaseline:"top" // Baseline of the text, e.g. top, middle, bottom
                        },

                        applyTo:"baseColor",
                        blendMode:"multiply",
                        flipY:false,
                        scale:uvScale
                    }
                ]
            });

            var quadWidth = configs.width || .2;
            var quadHeight = configs.height || .06;

            var geometry = texture.addNode({
                type:"geometry",
//                                            origin:{
//                                                y:-2.5
//                                            },

                primitive:"triangles",

                positions:[
                    quadWidth / 2, quadHeight / 2, 0,
                    -quadWidth / 2, quadHeight / 2, 0,
                    -quadWidth / 2, -quadHeight / 2, 0,
                    quadWidth / 2, -quadHeight / 2, 0
                ],

                normals:[
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1
                ],

                "uv":[
                    1, 1,
                    0, 1,
                    0, 0,
                    1, 0
                ],

                "indices":[
                    2, 1, 0,
                    3, 2, 0
                ]
            });

            this.set = function (params) {

                if (params.pos) {
                    translate.setXYZ(params.pos);
                }

                var source;

                if (params.text) {
                    source = source || {};
                    source.text = params.text;
                }

                if (params.font) {
                    source = source || {};
                    source.font = params.font;
                }

                if (params.textFillStyle) {
                    source = source || {};
                    source.textFillStyle = params.textFillStyle;
                }

                if (params.bgFillStyle) {
                    source = source || {};
                    source.bgFillStyle = params.bgFillStyle;
                }

                if (source) {
                    texture.setLayers({
                        "0":{
                            source:source
                        }
                    });
                }
            };

            this._destroy = function () {
                root.destroy();
            };
        };
    });
