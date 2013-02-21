define(function () {

    function f(x, y) {
        return Math.sin(x * Math.PI * 2) + Math.cos(y * Math.PI * 2);
    }

    function fdx(x, y) {
        return Math.cos(x * Math.PI * 2) * Math.PI * 2;
    }

    function fdy(x, y) {
        return -Math.sin(y * Math.PI * 2) * Math.PI * 2;
    }

    return function (configs) {

        var nx = configs.nx || 1;
        var ny = configs.ny || 1;

        var scene = this.getResource("scene");

        var nodeId = configs.nodeId || "world";

        var node = scene.getNode(nodeId);
        if (!node) {
            throw "scene node not found: " + nodeId;
        }

        var gridxy = new Array((nx + 1) * (ny + 1) * 3);
        var gridn = new Array((nx + 1) * (ny + 1) * 3);
        var griduv = new Array((nx + 1) * (ny + 1) * 2);

        var gridi = new Array((nx + 1) * (ny + 1) * 6);

        var zmin = Number.MAX_VALUE;
        var zmax = Number.MIN_VALUE;

        for (var x = 0; x <= nx; x++) {
            for (var y = 0; y <= ny; y++) {

                var xy = x + y * (nx + 1);
                var fx = (x - nx / 2) / nx * 20;
                var fy = (y - ny / 2) / ny * 20;
                var fz = f(fx, fy) * 0.1;

                zmin = Math.min(zmin, fz);
                zmax = Math.max(zmax, fz);

                gridxy[xy * 3 + 0] = fx;
                gridxy[xy * 3 + 1] = fz;
                gridxy[xy * 3 + 2] = fy;

                var n = [-fdx(fx, fy), 1, -fdy(fx, fy)];

                //n.normalize(); <= don't prematurely normalize

                gridn[xy * 3 + 0] = n[0];
                gridn[xy * 3 + 1] = n[1];
                gridn[xy * 3 + 2] = n[2];

                griduv[xy * 2 + 0] = x / (nx - 1);
                griduv[xy * 2 + 1] = y / (ny - 1);
            }
        }

        for (var x = 1; x <= nx; x++) {
            for (var y = 1; y <= ny; y++) {
                var xy = x + y * (nx + 1);
                gridi[xy * 6 + 0] = (x - 1) + (y - 1) * (nx + 1);
                gridi[xy * 6 + 1] = (x - 0) + (y - 1) * (nx + 1);
                gridi[xy * 6 + 2] = (x - 0) + (y - 0) * (nx + 1);
                gridi[xy * 6 + 3] = (x - 1) + (y - 1) * (nx + 1);
                gridi[xy * 6 + 4] = (x - 0) + (y - 0) * (nx + 1);
                gridi[xy * 6 + 5] = (x - 1) + (y - 0) * (nx + 1);
            }
        }

        var root = node.addNode({
            type:"texture",
            // coreId:"__scope_floor_texture", // In case many of these are created, reuse cores for efficiency
            layers:[
                {
                    uri:"textures/grid2.jpg", // relative to the location of index.html
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
                    scale:{ x:10, y:10, z:1.0 }
                }
            ],
            nodes:[
                {
                    type:"material",

                    baseColor:{
                        r:1,
                        g:1,
                        b:1
                    },
                    specular:10,
                    nodes:[
                        {
                            type:"geometry",
                            primitive:"triangles",
                            positions:gridxy,
                            normals:gridn,
                            uv:griduv,
                            indices:gridi
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
