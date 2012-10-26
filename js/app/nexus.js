/**
 *
 */
define(["./map"], // Map with automatic IDs

    function (Map) {

        /**
         * @param configs Configuration for this nexus
         * @param {Function} configs.typeLoader Strategy for loading nexus object classes
         * @constructor
         */
        return function (configs) {

            configs = configs || {};

            var typeLoader = configs.typeLoader;

            if (!typeLoader) {
                throw "config expected: typeLoader";
            }

            /* Object constructors
             */
            var types = {};

            /* Objects in the nexus
             */
            var objects = {};

            /* Queryable info on each object in the nexus
             */
            var objectsInfo = {};

            /*
             */
            var proxies = {};

            /* Message queue per method per object
             */
            var messageQueues = {};

            /* Map of subscriptions for each topic.
             */
            var topicSubs = {};

            /* Pool of reusable IDs for subscription handles
             */
            var handlePool = new Map();

            var self = this;


            /*----------------------------------------------------------------------------------------------
             * RPC
             *--------------------------------------------------------------------------------------------*/

            /**
             * Calls a method on either the nexus or a target object
             *
             *
             * <p>Example - calling the nexus's {@link #createObject} method:</p>
             *
             * <pre>
             * #call("add",{
             *      type: "myType",
             *      id: "myObjectInstance",
             *      someObjectConfig: "foo",
             *      otherObjectConfig: "bar"
             * });
             * </pre>
             *
             * <p>Example - calling the nexus's {@link #deleteObject} method:</p>
             *
             * <pre>
             * #call("remove", {
             *      id: "myObjectInstance"                               
             * });
             * </pre>
             *
             * <p>Example - calling a method on an object:</p>
             *
             * <pre>
             * #call("myObjectInstance.someMethod", {
             *              someMethodParam: "foo",
             *              otherMethodParam: "bar"                                    
             * });
             * </pre>
             *
             * @param {String} method Name of method on either the Nexus or one of its objects
             * @param {JSON} params Params for target method 
             * @param {Function} ok Success callback
             * @param {Function} error Success callback
             */
            this.call = function (method, params, ok, error) {
                
                /* Manually route calls to nexus methods
                 */
                switch (method) {

                    case "add":
                        this.add(params, ok, error);
                        return this;

                    case "get": // Get object info
                        ok(params.objectId ? (objectsInfo[params.objectId] || {}) : objectsInfo);
                        return this;

                    case "remove":
                        this.remove(params.objectId);
                        ok();
                        return this;

                    case "reset":
                        this.reset();
                        ok();
                        return this;
                }

                /* Route call to object method
                 */
                var tokens = method.split(".");

                var objectId = tokens[0];
                var method = tokens[1];

                var object = objects[objectId];

                if (object) {

                    var fn = object[method];

                    if (!fn) {
                        throw "method not found: " + method;
                    }                    

                    fn.call(object, params);

                } else {

                    if (!proxies[objectId]) {
                        throw "object not found: " + objectId;
                    }

                    /* Get queue for object that's still being created
                     */
                    var queues = messageQueues[objectId] || (messageQueues[objectId] = []);

                    /* Defer message for when object exists
                     */
                    (queues[method] || (queues[method] = [])).unshift(params);
                }

                return this;
            };

            function noop() {
            }

            /**
             * Creates an object type
             * @param params Object type definition
             * @param {String} params.type Object type name
             * @param {Function} params.fn Object constructor
             */
            this.define = function (params) {

                params = params || {};

                var type = params.type;

                if (!type) {
                    throw "param expected: type";
                }

                var constructor = params.constructor;

                if (!constructor) {
                    throw "param expected: fn";
                }

                types[type] = constructor;
            };

            /**
             * Deletes a nexus object type
             * Does not delete existing objects of that type.
             * @param {String} Object type name
             */
            this.undefine = function (type) {
                delete types[type];
            };


            /**
             * Adds an object to the nexus
             *
             * @param params
             * @param {String} params.type Object type, which maps to a RequireJS module filename
             * @param {String} params.objectId ID for object, unique among objects on this nexus
             * @return {*} Proxy object through which method calls may be made, deferred until the object exists
             */
            this.add = function (params) {

                if (!params) {
                    throw "argument expected: params";
                }

                var type = params.type;

                if (!type) {
                    throw "param expected: type";
                }

                var objectId = params.id;

                if (!objectId) {
                    throw "param expected: id";
                }

                var object = objects[objectId];

                if (object) {
                    throw "object already created: " + objectId;
                }

                var taskId = objectId + ".create";

                self.publish("task.started", {
                    taskId:taskId,
                    description:"Creating object '" + objectId + "'"
                });

                var proxy = proxies[objectId] = new Proxy(objectId);

                if (typeof type == "object") {

                    objects[objectId] = type;

                    proxy._resolve();

                    self.publish("task.finished", {
                        taskId:taskId
                    });

                    return proxy;
                }

                loadType(
                    type,
                    function (clazz) {

                        var object;

                        try {
                            object = new clazz(objectId, self, params);

//                            if (!object._destroy) { // Object destructor is mandatory
//                                throw "_destroy method missing on object type: " + type;
//                            }

                        } catch (err) {

                            self.publish("task.failed", {
                                taskId:taskId,
                                error:err
                            });

                            self.publish("error", {
                                error:err
                            });

                            return;
                        }

                        objects[objectId] = object;

                        /* Save metadata
                         */
                        var objectInfo = objectsInfo[objectId] = {
                            type:type,
                            methods:[]
                        };

                        for (var methodName in object) {
                            objectInfo.methods.push(methodName);
                        }

                        proxy._resolve();

                        self.publish("task.finished", {
                            taskId:taskId
                        });
                    },
                    function (err) {

                        self.publish("task.failed", {
                            taskId:taskId,
                            error:err
                        });

                        self.publish("error", {
                            error:err
                        });
                    });

                return proxy;
            };


            function loadType(type, ok, error) {

                var clazz = types[type];

                if (clazz) {
                    ok(clazz);
                    return;
                }

                typeLoader(type,
                    function (clazz) {
                        types[type] = clazz;
                        ok(clazz);
                    },
                    function (err) {
                        error("failed to add object type " + type + ": " + err);
                    })
            }


            /**
             * Proxy object which defers method calls on an object until it exists
             * @param objectId
             * @constructor
             */
            function Proxy(objectId) {
                this.objectId = objectId;
                this._resolvedCallbacks = [];
                this._rejectedCallbacks = [];
            }

            Proxy.prototype.call = function (method, params) {
                method = this.objectId + "." + method;
                self.call(method, params);
                return this;
            };

            Proxy.prototype.remove = function () {
                return self.remove(this.objectId);
            };

            Proxy.prototype.whenResolved = function (callback) {
                if (objects[this.objectId]) {
                    callback(this);
                } else {
                    this._resolvedCallbacks.push(callback);
                }
            };

            Proxy.prototype.whenRejected = function (callback) {
                if (objects[this.objectId]) {
                    callback(this);
                } else {
                    this._rejectedCallbacks.push(callback);
                }
            };

            Proxy.prototype._resolve = function () {

                self.publish(this.objectId + ".resolved", {
                    objectId:this.objectId
                });

                while (this._resolvedCallbacks.length > 0) {
                    this._resolvedCallbacks.pop()(this);
                }

                doDeferredCalls(this.objectId);
            };

            Proxy.prototype._reject = function() {

                self.publish(this.objectId + ".rejected", {
                    objectId:this.objectId
                });

                while (this._rejectedCallbacks.length > 0) {
                    this._rejectedCallbacks.pop()(this);
                }
            };

            function doDeferredCalls(objectId) {

                var queues = messageQueues[objectId];

                if (queues) {

                    var params;
                    var object = objects[objectId];
                    var queue;
                    var fn;

                    for (var method in queues) {
                        if (queues.hasOwnProperty(method)) {

                            queue = queues[method];

                            fn = object[method];

                            if (fn) {

                                while (queue.length > 0) {
                                    params = queue.pop();
                                    fn.call(object, params, noop, noop);
                                }
                            } else {
                                queue.length = 0;
                            }
                        }
                    }
                }
            }

            /**
             * Returns an object in the nexus
             * @param {String} objectId ID of the object
             * @return {*}
             */
            this.get = function (objectId) {
                var proxy = proxies[objectId];
                if (!proxy) {
                    throw "object not found: " + objectId;
                }
                return proxy;
            };

            /**
             * Deletes an object. Silently ignores if object does not exist.
             *
             * @param {String} objectId ID of target object
             */
            this.remove = function (objectId) {

                var object;

                if (objectId) {

                    var objectInfo = objectsInfo[objectId];

                    if (objectInfo) {

                        object = objects[objectId];

                        delete objects[objectId];
                        delete objectsInfo[objectId];
                        delete messageQueues[objectId];
                        delete proxies[objectId];

                        if (object._destroy) {
                            object._destroy();
                        }
                    }

                } else { // Delete all

                    for (var objectId in objects) {
                        if (objects.hasOwnProperty(objectId)) {
                            object = objects[objectId];

                            if (object._destroy) {
                                object._destroy();
                            }
                        }
                    }

                    objects = {};
                    objectsInfo = {};
                }
            };


            /*----------------------------------------------------------------------------------------------
             * PubSub
             *--------------------------------------------------------------------------------------------*/

            /**
             * Subscribe to a topic on this nexus
             * @param {String} topic Topic name
             * @param {Function} handler Topic handler
             * @return {String} Subscription handle
             */
            this.subscribe = function (topic, handler) {

                if (!topic || typeof topic != "string") {
                    throw "illegal arguments";
                }

                if (!handler || typeof handler != "function") {
                    throw "illegal arguments";
                }

                var subs = topicSubs[topic];

                if (!subs) {
                    subs = topicSubs[topic] = {           // Subscriptions for this event topic
                        handlers:{}, // Handler function for each subscriber
                        numSubs:0                      // Count of subscribers for the event topic
                    };
                }

                var handle = handlePool.addItem(topic);

                subs.handlers[handle] = handler;    // Register handler
                subs.numSubs++;                     // Bump count of subscribers to the event

                return handle;
            };


            /**
             * Unsubscribe to an event on this nexus
             * @param {String} handle Subscription handle
             */
            this.unsubscribe = function (handle) {

                if (!topic) {
                    throw "argument expected";
                }

                var topic = handlePool.items[handle];

                if (!topic) { // No subscription exists
                    return;
                }

                handlePool.removeItem(handle);

                var subs = topicSubs[topic];

                if (!subs) { // No subscriptions
                    return;
                }

                delete subs.handlers[handle];

                subs.numSubs--;
            };


            /**
             * Fire an event at this nexus
             */
            this.publish = function (topic, params) {

                if (!topic) {
                    throw "argument expected: topic";
                }

                var subs = topicSubs[topic];

                if (!subs) {
                    return;
                }

                if (subs.numSubs > 0) {             // Don't handle if no subscribers

                    var handlers = subs.handlers;

                    params = params || {};

                    for (var handle in handlers) {
                        if (handlers.hasOwnProperty(handle)) {
                            handlers[handle](params);
                        }
                    }
                }
            };


            /**
             * Resets everything, deletes all objects and event subscriptions
             */
            this.reset = function () {

                types = {};

                this.remove(); // Calls object destructors

                topicSubs = {};

                handlePool.clear();
            }
        };
    });