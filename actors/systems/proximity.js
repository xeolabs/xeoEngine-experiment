/**

 Viewpoint proximity culling system

 This actor is used for culling scene content that falls outside of spherical proximity boundaries centered
 at the viewpoint.

 It's primarily intended for swapping objects in and out of the view as they enter or leave a region of interest
 centered at the viewpoint.

 On instantiation, you bind this actor to a "lookat" node and specify the radii of one or more concentric spherical
 boundaries for it to create around the lookat's "eye" position:

 call("add", {
        type:"systems/visibility/proximity",
        actorId:"myProximity",

        radii:[
            500,  // inner radius
            2000, // outer radius
            //...
        ],

        nodeId:"lookat" // Defaults to "lookat"
    });


 Note that the value of the "nodeId" config will default to "lookat" when not supplied.

 You then register one or more spherical boundaries on this actor:


 call("myProximity.addBoundary", {
       boundaryId: "myRegion",
       x:  550,
       z:  150,
       radius:300
  });

 call("myProximity.addBoundary", {
       boundaryId: "myOtherRegion",
       x:  -12550,
       z:  6750,
       radius:200
  });


 Then as the lookat node's eye position changes, the actor will publish an event each time a boundary changes
 intersection state with respect to the spherical boundaries about the eye position:


 subscribe(
 "myProximity.update.myRegion,

 function (params) {

        switch (params.radiusIdx) {  // Index of the proximity's radius this boundary now intersects:

            //Intersecting the first radius (500):

            case 0:
                // Perhaps make an object visible, creating it first if needed

            break;

            // Intersecting the second radius (2000), but outside the first:

            case 1:
                // Perhaps make the object invisible
                break;

            // Outside all radii:

            case -1:
                // Perhaps destroy the object
                break;
        }
    });


 The example above shows how intersections with a pair of concentric boundaries can be used for "in-core" and
 "out-of-core" content staging. When "myRegion" falls inside the inner boundary it is considered to be
 visible and its objects are shown, loading them first if needed (ie. moving them "in-core"). When "myRegion" intersects
 the outer boundary, it is considered invisible but likely to become visible again later, so the objects are hidden
 but not unloaded. When the boundary falls outside all boundaries, it is considered both invisible and distant, so
 the objects are unloaded (ie. moving them "out-of-core").

 */
define([
    "lib/gl-matrix"
],

    function () {

        return function (configs) {

            var scene = this.getObject("scene");

            var nodeId = configs.nodeId || "lookat";

            var lookat = scene.getNode(nodeId);

            if (!lookat) {
                throw "scene node not found:" + nodeId;
            }

            if (lookat.getType() != "lookAt") {
                throw "nodeId should be a 'lookat' type: " + nodeId;
            }

            var offset = configs.offset;

            if (offset) {
                offset = [offset.x || 0, offset.y || 0, offset.z || 0];
            }

            /* Proximity radii            
             */
            var radii = configs.radii || [];

            /* boundaries in this proximity culling system
             */
            var boundaries = {};

            /* Save last camera eye to avoid redundant tests when not moving
             */
            var lastEye;


            /**
             * Execute calls for each boundary's current proximity state on scene tick
             */
            this.subscribe("tick",

                function () {

                    var eye = lookat.getEye();

                    /* Avoid redundant test when camera eye has not moved
                     */
                    if (lastEye && lastEye.x == eye.x && lastEye.y == eye.y && lastEye.z == eye.z) {
                        return;
                    }

                    lastEye = eye;

                    /* For each boundary, fire calls for any change in proximity radius
                     */
                    eye = [eye.x, eye.y, eye.z];

                    //var center =

                    var boundary;
                    var dist;
                    var radius;
                    var calls;

                    for (var boundaryId in boundaries) {
                        if (boundaries.hasOwnProperty(boundaryId)) {

                            boundary = boundaries[boundaryId];
                            dist = Math.abs(Tron_math_lenVec3(Tron_math_subVec3(eye, boundary.centre, [])));

                            radius = -1;

                            for (var i = 0, len = radii.length; i < len; i++) {
                                if (dist < radii[i]) {
                                    radius = i;
                                    break;
                                }
                            }

                            if (boundary.radius === radius) {
                                continue;
                            }

                            boundary.radius = radius;

                            this.publish(boundary.topic, {
                                radius:radius
                            });
                        }
                    }
                });


            /**
             * Add a boundary to the proximity culling system
             * @param params
             */
            this.addBoundary = function (params) {

                var boundaryId = params.boundaryId;

                var boundary = {
                    boundaryId:boundaryId,
                    centre:[ params.x || 0, params.y || 0, params.z || 0 ],
                    radius:params.radius || 1.0,
                    topic:"update." + boundaryId
                };

                boundaries[boundaryId] = boundary;
            };

            /**
             * Remove a boundary from the proximity culling system
             * @param params
             */
            this.removeBoundary = function (params) {

                var boundaryId = params.boundaryId;

                if (!boundaryId) {
                    boundaries = {};
                } else {
                    delete boundaries[boundaryId];
                }
            };

            /**
             * Removes all boundaries from the proximity culling system
             * @param params
             */
            this.clear = function (params) {
                boundaries = {};
            };

            this._destroy = function () {
                this.clear();
            }
        };
    })
;
