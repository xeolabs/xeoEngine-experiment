SceneJS.Plugins.addPlugin(

    SceneJS.Plugins.TEXTURE_ASSET_PLUGIN,

    "video",

    new (function () {

        this.getAsset = function (params) {

            var gl = params.gl;
            var configs = {};

            var updated;
            var video;

            var texture = gl.createTexture();

            return {

                getTexture:function () {
                    return texture;
                },

                onUpdate:function (fn) {
                    updated = fn;
                },

                setConfigs:function (cfg) {

                    if (cfg.src) {

                        var canvas = document.createElement("canvas");
                        document.getElementsByTagName("body")[0].appendChild(canvas);
                        var ctx = canvas.getContext("2d");

                        /* Create hidden video canvas
                         */
                        video = document.createElement("video");
                        video.style.display = "none";
                        video.setAttribute("loop", "loop");
                        video.autoplay = true;
                        video.addEventListener("ended", // looping broken in FF
                            function () {
                                this.play();
                            },
                            true);

                        document.getElementsByTagName("body")[0].appendChild(video);

                        video.crossOrigin = "anonymous";
                        video.src = cfg.src;

                        var updateTexture = function () {

                            if (video.readyState > 0) {

                                if (video.height <= 0) {
                                    video.style.display = "";
                                    video.height = video.offsetHeight;
                                    video.width = video.offsetWidth;
                                    video.style.display = "none";
                                }

//                                video.height = nextHighestPowerOfTwo(video.height);
//                                video.width = nextHighestPowerOfTwo(video.width);

                                //                                    canvas.height = video.height;
                                //                                    canvas.width = video.width;
                                //
                                //                                    ctx.drawImage(video, 0, 0);
                                //
                                //                                    gl.bindTexture(gl.TEXTURE_2D, texture);
                                //                                    //
                                //                                    try {
                                //                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                                //
                                //                                    } catch(e) {
                                //
                                //                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas, null);
                                //                                    }
                                //
                                //                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                //                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                //
                                //                                    gl.generateMipmap(gl.TEXTURE_2D);
                                //

                                try {
                                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
                                }
                                catch (e) {
                                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video, null);
                                }

                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                gl.generateMipmap(gl.TEXTURE_2D);

                                if (updated) {
                                    updated();
                                }
                            }

                            window.requestAnimationFrame(updateTexture);
                        };

                        window.requestAnimationFrame(updateTexture);// TODO: synch with render loop
                    }

                    configs = cfg;
                },

                getConfigs:function () {
                    return configs;
                },

                destroy:function () {

                    // TODO: destroy any existing video
                }
            };

            function ensureImageSizePowerOfTwo(image) {

                if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {

                    var canvas = document.createElement("canvas");
                    canvas.width = this._nextHighestPowerOfTwo(image.width);
                    canvas.height = this._nextHighestPowerOfTwo(image.height);

                    var ctx = canvas.getContext("2d");

                    ctx.drawImage(image,
                        0, 0, image.width, image.height,
                        0, 0, canvas.width, canvas.height);

                    image = canvas;
                    image.crossOrigin = "";
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

        };

    })());

