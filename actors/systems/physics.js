/**
 * Physics system
 */
define([
    "lib/jiglib.all.min.js"
],

    function () {

        return function (configs) {

            var system = jigLib.PhysicsSystem.getInstance();

            system.setGravity(configs.gravity || [0, -9.8, 0, 0]); //-120
            system.setSolverType(configs.solver || 'ACCUMULATED'); //FAST, NORMAL, ACCUMULATED

            var bodies = {};

            var then = (new Date()).getTime();

            /**
             * Integrate the physics system
             */
            this.integrate = function () {

                var now = (new Date()).getTime();

                var secs = (now - then) / 1000;
                var body;
                var physBody;
                var pos;
                var dir;

                system.integrate(secs);

                then = now;

                for (var bodyId in bodies) {
                    if (bodies.hasOwnProperty(bodyId)) {

                        body = bodies[bodyId];
                        physBody = body.body;

                        pos = physBody.get_currentState().position;
                        //dir = physBody.get_currentState().get_orientation().glmatrix;

                        this.publish(body.topic, {
                            pos:{ x:pos[0], y:pos[1], z:pos[2] }
//                            ,
//                            dir:dir
                        });
                    }
                }
            };


            /* Creates a physical body
             */
            this.addBody = function (params) {

                var bodyId = params.bodyId;

                if (!bodyId) {
                    throw "param expected: bodyId";
                }

                if (bodies[bodyId]) {
                    throw "body already exists: " + bodyId;
                }

                var b;

                switch (params.type) {

                    case "plane":
                        var dir = params.dir;
                        b = new jigLib.JPlane(null, [dir.x || 0, dir.y || 0, dir.z || 0, 0]);
                        break;

                    case "box":
                        b = new jigLib.JBox(null, params.width || 1.0, params.depth || 1.0, params.height || 1.0);
                        break;

                    case "sphere":
                        b = new jigLib.JSphere(null, params.radius || 1.0);
                        break;


                    default:
                        throw "body type not supported: " + params.type;
                }

                system.addBody(b);

                if (params.movable != undefined) {
                    b.set_movable(!!params.movable);
                }

                if (params.pos) {
                    var p = params.pos;
                    b.moveTo([p.x || 0, p.y || 0, p.z || 0, 0]);
                }

                if (params.mass != undefined) {
                    b.set_mass(params.mass);
                }

                if (params.restitution != undefined) {
                    b.set_restitution(params.restitution);
                }

                if (params.friction != undefined) {
                    b.set_friction(params.friction);
                }

                if (params.velocity != undefined) {
                    var v = params.velocity;
                    b.setVelocity([v.x || 0, v.y || 0, v.z || 0, 0]);
                }

                bodies[bodyId] = {
                    type:params.type,
                    body:b,
                    topic: "update." + bodyId // Publication topic
                };
            };


            /**
             * Deletes a physical body
             * @param params
             */
            this.removeBody = function (params) {

                var bodyId = params.bodyId;

                if (!bodyId) {
                    this.clear();
                    return;
                }

                if (!bodies[bodyId]) {
                    return;
                }

                system.removeBody(bodies[bodyId].body);

                delete bodies[bodyId];
            };


            this._destroy = function () {
                this.clear();
            };


            /**
             * Deletes all physical bodies
             */
            this.clear = function() {
                for (var bodyId in bodies) {
                    if (bodies.hasOwnProperty(bodyId)) {
                        system.removeBody(bodies[bodyId].body);
                        delete bodies[bodyId];
                    }
                }
            }
        };

    });
