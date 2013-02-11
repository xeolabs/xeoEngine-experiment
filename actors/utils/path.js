/**
 * scope.call("addActor", {
 *      type: "path",
 *      actorId: "myPath",
 *      points: [
 *          {
 *              pos: { x: -1000, y: -50, z: -890 }
 *          },
 *          {
 *              pos: { x: -500, y: -100, z: 56 }
 *          },
 *          {
 *              pos: { x: 200, y: y: 20, z: 23 }
 *          }
 *      ]
 * });
 *
 */
define([
    "lib/gl-matrix",
    "lib/scenejs.sphere"
],
    function () {

        var Path = function (scope, configs) {

            var points = configs.points;

            if (!points) {
                throw "param expected: points";
            }

//            if (points.length < 4) {
//                throw "param invalid: points - minimum of four required";
//            }

            this._scope = scope;
            this._configs = configs;

            this._tightness = configs.tightness || 0;
            this._closed = !!configs.closed;
            this._points = [];

            /* Create path
             */
            var p;
            for (var i = 0, len = points.length; i < len; i++) {
                p = points[i];
                this._points.push([p.x || 0, p.y || 0, p.z || 0 ]);
            }

            if (configs.show) {
                this.show();
            }
        };


        Path.prototype.show = function () {
            if (this._showing) {
                return;
            }
            this._showing = true;
            this._createObject();
            this._indicator.flags.setEnabled(true);
        };


        Path.prototype.hide = function () {
            if (!this._showing) {
                return;
            }
            this._showing = false;
            if (this._indicator) {
                this._indicator.flags.setEnabled(true);
            }
        };


        /** Create visible object showing the path
         *
         * @param node Scene node to attach it to
         * @private
         */
        Path.prototype._createObject = function () {

            if (this._indicator) {
                return;
            }

            /* Visual representation
             */
            var sceneId = this._scope.scopeId + "." + (this._configs.sceneId || "scene");

            var scene = SceneJS.getScene(sceneId);
            if (!scene) {
                throw "scene not found: " + sceneId;
            }

            var nodeId = this._configs.nodeId || "world";

            var node = scene.getNode(nodeId);
            if (!node) {
                throw "node not found in scene: [nodeId = " + nodeId + ", sceneId = " + sceneId + "]";
            }

            /* Show curve
             */
            var positions = [];
            var p;

            var indices = [];
            var j = 0;

            for (var factor = 0; factor < 4.0; factor += 0.01) {

                p = this._interpolate(factor);

                positions.push(p[0]);
                positions.push(p[1]);
                positions.push(p[2]);

                if (j > 0) {
                    indices.push(j - 1);
                    indices.push(j);
                }

                j++;
            }

            this._indicator = {
                flags:node.addNode({
                    type:"flags",
                    flags:{
                        enabled:true
                    }
                })
            };

            this._indicator.flags.addNode({
                type:"material",
                baseColor:{ r:0, g:0, b:1 },
                emit:0.3,
                nodes:[
                    {
                        type:"geometry",
                        primitive:"lines",
                        positions:positions,
                        indices:indices
                    }
                ]});

            /* Show control points
             */
            for (var i = 0, len = this._points.length; i < len; i++) {

                this._indicator.flags.addNode({
                    type:"material",
                    baseColor:{ r:1, g:0, b:0 },
                    emit:0.3,
                    nodes:[
                        {
                            type:"translate",
                            x:this._points[i][0],
                            y:this._points[i][1],
                            z:this._points[i][2],
                            nodes:[
                                {
                                    type:"scale",
                                    x:5,
                                    y:5,
                                    z:5,
                                    nodes:[
                                        {
                                            type:"geometry",
                                            source:{
                                                type:"sphere"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]});
            }

            /* Show interpolation position
             */
            this._indicator.cursorNode = this._indicator.flags.addNode({
                type:"translate",
                x:0,
                y:0,
                z:0,
                nodes:[
                    {
                        type:"scale",
                        x:5,
                        y:5,
                        z:5,
                        nodes:[
                            {
                                type:"material",
                                baseColor:{ r:0, g:1, b:0 },
                                emit:1.0,
                                nodes:[
                                    {
                                        type:"geometry",
                                        source:{
                                            type:"sphere"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
        };


        /**
         * Interpolate on path
         * @param factor Interpolation factor, normalised in range of [0..1]
         * @return {Array}
         */
        Path.prototype._interpolate = function (factor) {

            var numPoints = this._points.length;

            if (this._closed) {

                factor *= numPoints

            } else {

                factor = factor < 0 ? 0 : factor > 1 ? 1 : factor;
                factor *= numPoints - 1
            }

            var e = [0, 0, 0];

            if (numPoints < 2) { // Not enough points
                return e
            }

            var b = factor;
            var o = b - Math.floor(b);
            var l = Math.floor(b) % numPoints;

            var q = this._points[this._clampIndex(l - 1, numPoints)];
            var n = this._points[this._clampIndex(l + 0, numPoints)];
            var m = this._points[this._clampIndex(l + 1, numPoints)];
            var k = this._points[this._clampIndex(l + 2, numPoints)];

            var j = 2 * o * o * o - 3 * o * o + 1;
            var i = -2 * o * o * o + 3 * o * o;
            var g = o * o * o - 2 * o * o + o;
            var f = o * o * o - o * o;

            var d = Tron_math_subVec3(m, q, []);

            Tron_math_mulVec3Scalar(d, this._tightness);

            var c = Tron_math_subVec3(k, n, []);

            Tron_math_mulVec3Scalar(c, this._tightness);

            var e = Tron_math_mulVec3Scalar(n, j);

            e = Tron_math_addVec3(e, Tron_math_mulVec3Scalar(m, i, []));
            e = Tron_math_addVec3(e, Tron_math_mulVec3Scalar(d, g, []));
            e = Tron_math_addVec3(e, Tron_math_mulVec3Scalar(c, f, []));

            return e;
        };


        Path.prototype._clampIndex = function (a, b) {
            if (this._closed) {
                return a < 0 ? b + a : a >= b ? a - b : a;
            } else {
                return a < 0 ? 0 : a >= b ? b - 1 : a;
            }
        };


        Path.prototype.setFactor = function (params) {

            var factor = params.factor || 0;

            var e = this._interpolate(factor);

            var p = { x:e[0], y:e[1], z:e[2] };

            if (this._indicator) {
                this._indicator.cursorNode.setXYZ(p);
            }

            this._scope.publish(this.actorId + ".pos", p);
        };


        return Path;
    });
