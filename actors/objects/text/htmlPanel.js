define([
    "../../../libs/jquery-lib.1.7.1.min",
    "../../../libs/html2canvas"
],

    function () {

var Human_Label3DFactory = function (containerNode) {

    var textureSourceId = "__tex";

    var element = $([
        "<div id='___label' class='annotationContainer annotationCreate gradient-topbottom-darkblue'>",
        "   <span id='__labelTitleElement' class='title'>XXXX</span><br>",
        "   <span id='__labelDescElement' class='description'>YYYY</span>",
        "</div>"
    ].join(""));

    $(document.body).append(element);

    //element.hide();

    var labelTitleElement = $("#__labelTitleElement");
    var labelDescElement = $("#__labelDescElement");

    var labelElement = document.getElementById("___label");

    var labels = {};


    /*------------------------------------------------------------------------------------
     * Label3D instances publish their textures for consumption by the SceneJS texture
     * source plugin defined and installed by this module, which then provides them
     * to the texture nodes created by the Label3Ds.
     *----------------------------------------------------------------------------------*/

    var canvasSubs = {};
    var canvasPubs = {};

    /**
     * Subscribe to canvas rendered for a label
     */
    function subscribeCanvas(labelId, fn) {

        var subs = (canvasSubs[labelId] || (canvasSubs[labelId] = []));
        subs.push(fn);

        var canvas = canvasPubs[labelId];
        if (canvas) {
            fn(canvas);
        }
    }

    /**
     * Unsubscribe from canvas updates for a label
     */
    function unsubscribeCanvas(labelId) {
        delete canvasSubs[labelId];
    }

    /**
     * Publish a fresh canvas for a label
     */
    function publishCanvas(labelId, canvas) {

        canvasPubs[labelId] = canvas;

        var subs = canvasSubs[labelId];
        if (subs) {
            for (var i = 0, len = subs.length; i < len; i++) {
                subs[i](canvas);
            }
        }
    }


    /*-------------------------------------------------------------------
     *
     *-----------------------------------------------------------------*/

    var Label3D = function (cfg) {

        var labelId = cfg.labelId;

        if (!labelId) {
            throw "param expected: labelId";
        }

        this._labelId = labelId;
        this._title = cfg.title || "";
        this._description = cfg.description || "";
        this._pos = cfg.pos || { x:0, y:0, z:0 };
        this._width = cfg.width || 0.09;
        this._shown = cfg.shown != undefined ? !!cfg.shown : true;

        this._sceneDirty = true; // Have to lazy-build everything: scene and canvas

        if (this._shown) {
            this._update();
        }
    };

    /**
     * Shows or hides this 3D label
     * @param shown
     */
    Label3D.prototype.setShown = function (shown) {

        this._update();

        this._rootNode.setEnabled(shown);
    };

    /**
     * Updates the World-space position of this 3D label
     * @param pos
     */
    Label3D.prototype.setPos = function (pos) {

        this._pos = pos;

        this._posDirty = true;

        if (this._shown) {
            this._update();
        }
    };

    /**
     * Sets the width of this 3D label
     * @param width
     */
    Label3D.prototype.setWidth = function (width) {

        this._width = width;

        this._textureDirty = true;

        if (this._shown) {
            this._update();
        }
    };

    /**
     * Sets the title and/or description of this 3d label
     * @param params
     * @param params.title New title
     * @param params.description New description
     */
    Label3D.prototype.setText = function (params) {

        this._title = this._title || params.title;
        this._description = this._description || params.description;

        this._textureDirty = true;

        if (this._shown) {
            this._update();
        }
    };

    Label3D.prototype._update = function () {

        /* Lazy-build scene nodes
         */
        if (this._sceneDirty) {

            this._buildScene();

            this._sceneDirty = false;
            this._posDirty = true;
            this._textureDirty = true;
        }

        /* Lazy-update label pos
         */
        if (this._posDirty) {

            this._translate.setXYZ(this._pos);

            this._posDirty = false;
        }

        /* Lazy-update texture
         */
        if (this._textureDirty) {

            //   element.show();

            labelTitleElement.text(this._title);
            labelDescElement.text(this._description);

            var self = this;

            html2canvas([labelElement], {
                onrendered:function (canvas) {

                    //         element.hide();

                    canvas = ensureImageSizePowerOfTwo(canvas); // NPOT textures not allowed in WebGL

                    var aspect = canvas.height / canvas.width; // Now we know what dimensions to make the label quad
                    var height = self._width * aspect * 0.7;

                    self._geometry.setPositions({
                        positions:[
                            self._width, height, 0,
                            -self._width, height, 0,
                            -self._width, -height, 0,
                            self._width, -height, 0
                        ]
                    });

                    publishCanvas(self._labelId, canvas);  // Publish for our SceneJS plugin to feed into our texture node
                }
            });

            this._textureDirty = false;
        }
    };

    Label3D.prototype._buildScene = function () {

        this._rootNode = containerNode.addNode({
            type:"flags",
            flags:{
                enabled:this._shown,
                clipping:false
            }
        });

        this._translate = this._rootNode.addNode({
            type:"translate",
            x:this._pos.x || 0,
            y:this._pos.y || 0,
            z:this._pos.z || 0
        });

        this._rotate = this._translate.addNode({
            type:"rotate",
            y:1,
            angle:0

        });

        this._material = this._rotate.addNode({
            type:"material",
            baseColor:{ r:1.0, g:1.0, b:1.0 },
            specularColor:{ r:0.4, g:0.4, b:0.0 },
            specular:0.2,
            shine:6.0,
            emit:0.2

        });

        this._texture = this._material.addNode({
            type:"texture",
            layers:[
                {
                    source:{
                        type:textureSourceId,
                        labelId:this._labelId
                    },
                    applyTo:"baseColor",
                    blendMode:"multiply",
                    flipY:false
                }
            ]
        });

        this._geometry = this._texture.addNode({
            type:"geometry",

            primitive:"triangles",

            positions:[
                .1, .03, 0,
                -.1, .03, 0,
                -.1, -.03, 0,
                .1, -.03, 0
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
    };

    function ensureImageSizePowerOfTwo(image) {
        if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
            var canvas = document.createElement("canvas");
            canvas.width = nextHighestPowerOfTwo(image.width);
            canvas.height = nextHighestPowerOfTwo(image.height);
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image,
                0, 0, image.width, image.height,
                0, 0, canvas.width, canvas.height);

            image = canvas;
        }
        return image;
    }


    function isPowerOfTwo(x) {
        return (x & (x - 1)) == 0;
    }

    function nextHighestPowerOfTwo(x) {
        --x;
        for (var i = 1; i < 32; i <<= 1) {
            x = x | x >> i;
        }
        return x + 1;
    }

    /**
     * Destroys this label
     * @private
     */
    Label3D.prototype._destroy = function () {
        if (this._rootNode) {
            this._rootNode.destroy();
        }
        unsubscribeCanvas(this._labelId);
        delete labels[this._labelId];
    };

    /*-------------------------------------------------------------------
     *
     *-----------------------------------------------------------------*/

    SceneJS.Plugins.addPlugin(
        SceneJS.Plugins.TEXTURE_SOURCE_PLUGIN,
        textureSourceId,

        new (function () {

            this.getSource = function (params) {

                var gl = params.gl;
                var configs = {};

                var texture = gl.createTexture();
                var updated;

                var labelId;
                var initialised = false;

                return {

                    getTexture:function () {
                        return texture;
                    },

                    onUpdate:function (fn) {
                        updated = fn;
                    },

                    setConfigs:function (cfg) {

                        if (!initialised) {

                            labelId = cfg.labelId;

                            subscribeCanvas(labelId,
                                function (canvas) {

                                    gl.bindTexture(gl.TEXTURE_2D, texture);
                                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

                                    if (updated) {
                                        updated();
                                    }
                                });

                            initialised = true;
                        }
                    },

                    getConfigs:function () {
                        return configs;
                    },

                    destroy:function () {
                        if (initialised) {
                            unsubscribeCanvas(labelId);
                        }
                    }
                };
            };
        })());

    /**
     * Get a new {@link Label3D} from this factory. Destroy the label with {@link Label3D#destroy}.
     * @param cfg
     * @param cfg.labelId Unique ID for label
     * @param cfg.title Title text
     * @param cfg.description Description text
     * @param cfg.width Width in 3D units
     *
     * @return {Label3D}
     */
    this.createLabel = function (cfg) {

        var labelId = cfg.labelId;

        if (!labelId) {
            throw "param expected: labelId";
        }

        if (labels[labelId]) {
            throw "label already exists: " + labelId;
        }

        var label = new Label3D(cfg);

        labels[labelId] = label;

        return label;
    };
};