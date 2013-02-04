define(

    function () {

        return {

            load:function (params, buildNode, ok, error) {

                load(
                    params,

                    function (text) {

                        parse(params, text, buildNode);

                        ok();
                    },

                    error);
            }
        };

        /**
         * Loads a file from the given URL
         *
         * @param params
         * @param ok
         * @param error
         */
        function load(params, ok, error) {

            var scope = this;

            var url = params.src;

            if (scope.path === null) {

                var parts = url.split('/');
                parts.pop();
                scope.path = ( parts.length < 1 ? '.' : parts.join('/') );
            }

            var xhr = new XMLHttpRequest();

            xhr.addEventListener('progress', function (event) {

//                scope.dispatchEvent({ type:'progress', loaded:event.loaded, total:event.total });

            }, false);


            xhr.addEventListener('load', function (event) {
                if (event.target.responseText) {
                    ok(event.target.responseText);

                } else {
                    error('Invalid file [' + url + ']');
                }

            }, false);

            xhr.addEventListener('error', function () {
                error('Couldn\'t load URL [' + url + ']');
            }, false);

            xhr.open('GET', url, true);
            xhr.send(null);
        }


        function parse(params, data, buildNode) {

            var group = {};

            var positions = [];
            var normals = [];
            var uv = [];

            var pattern, result;

            // v float float float

            pattern = /v( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;

            while (( result = pattern.exec(data) ) != null) {

                // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                positions.push(parseFloat(result[ 1 ]));
                positions.push(parseFloat(result[ 2 ]));
                positions.push(parseFloat(result[ 3 ]));
            }

            // vn float float float

            pattern = /vn( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;

            while (( result = pattern.exec(data) ) != null) {

                // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                normals.push(parseFloat(result[ 1 ]));
                normals.push(parseFloat(result[ 2 ]));
                normals.push(parseFloat(result[ 3 ]));
            }

            // vt float float

            pattern = /vt( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;

            while (( result = pattern.exec(data) ) != null) {

                // ["vt 0.1 0.2", "0.1", "0.2"]

                uv.push(parseFloat(result[ 1 ]));
                uv.push(parseFloat(result[ 2 ]));
            }

            var data = data.split('\no ');

            for (var i = 0, l = data.length; i < l; i++) {

                var object = data[ i ];

                var geometry = {
                    type:"geometry",
                    coreId: params.objectId + "." + i,
                    positions:positions,
                    uv:[],
                    normals:[],
                    indices:[]
                };

                // f vertex vertex vertex ...

                pattern = /f( +[\d]+)( [\d]+)( [\d]+)( [\d]+)?/g;

                while (( result = pattern.exec(object) ) != null) {

                    // ["f 1 2 3", "1", "2", "3", undefined]

                    if (result[ 4 ] === undefined) {

                        geometry.indices.push(parseInt(result[ 1 ]) - 1);
                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 3 ]) - 1);


                    } else {

                        geometry.indices.push(parseInt(result[ 1 ]) - 1);
                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 3 ]) - 1);
                        geometry.indices.push(parseInt(result[ 4 ]) - 1);
                    }
                }

                // f vertex/uv vertex/uv vertex/uv ...

                pattern = /f( +([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))( ([\d]+)\/([\d]+))?/g;

                while (( result = pattern.exec(object) ) != null) {

                    // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

                    if (result[ 10 ] === undefined) {

                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 5 ]) - 1);
                        geometry.indices.push(parseInt(result[ 8 ]) - 1);

                        geometry.uv.push(uv[ parseInt(result[ 3 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 6 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 9 ]) - 1 ]);

                    } else {

                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 5 ]) - 1);
                        geometry.indices.push(parseInt(result[ 8 ]) - 1);
                        geometry.indices.push(parseInt(result[ 11 ]) - 1);

                        geometry.uv.push(uv[ parseInt(result[ 3 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 6 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 9 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 12 ]) - 1 ]);
                    }
                }

                // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

                pattern = /f( +([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))( ([\d]+)\/([\d]+)\/([\d]+))?/g;

                while (( result = pattern.exec(object) ) != null) {

                    // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

                    if (result[ 13 ] === undefined) {

                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 6 ]) - 1);
                        geometry.indices.push(parseInt(result[ 10 ]) - 1);

                        geometry.uv.push(uv[ parseInt(result[ 3 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 7 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 11 ]) - 1 ]);

                        geometry.normals.push(normals[ parseInt(result[ 4 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 8 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 12 ]) - 1 ]);


                    } else {

                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 6 ]) - 1);
                        geometry.indices.push(parseInt(result[ 10 ]) - 1);
                        geometry.indices.push(parseInt(result[ 14 ]) - 1);

                        geometry.uv.push(uv[ parseInt(result[ 3 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 7 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 11 ]) - 1 ]);
                        geometry.uv.push(uv[ parseInt(result[ 15 ]) - 1 ]);

                        geometry.normals.push(normals[ parseInt(result[ 4 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 8 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 12 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 16 ]) - 1 ]);

                    }
                }

                // f vertex//normal vertex//normal vertex//normal ...

                pattern = /f( +([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))( ([\d]+)\/\/([\d]+))?/g;

                while (( result = pattern.exec(object) ) != null) {

                    // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

                    if (result[ 10 ] === undefined) {

                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 5 ]) - 1);
                        geometry.indices.push(parseInt(result[ 8 ]) - 1);

                        geometry.normals.push(normals[ parseInt(result[ 3 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 6 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 9 ]) - 1 ]);

                    } else {

                        geometry.indices.push(parseInt(result[ 2 ]) - 1);
                        geometry.indices.push(parseInt(result[ 5 ]) - 1);
                        geometry.indices.push(parseInt(result[ 8 ]) - 1);
                        geometry.indices.push(parseInt(result[ 11 ]) - 1);

                        geometry.normals.push(normals[ parseInt(result[ 3 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 6 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 9 ]) - 1 ]);
                        geometry.normals.push(normals[ parseInt(result[ 12 ]) - 1 ]);
                    }
                }

                buildNode.addNode(geometry);
            }
        }
    });