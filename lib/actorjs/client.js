
(function () {

    /**
     * Client for connection with remote ActorJS using cross-window messaging
     * @param cfg
     * @constructor
     */
    window.ActorJSWebMessageClient = function (cfg) {

        if (!cfg.iframe) {
            throw "config expected: iframe";
        }

        var iframe = document.getElementById(cfg.iframe);

        if (!iframe) {
            throw "iframe not found: '" + iframe + "'";
        }

        if (!iframe.contentWindow) {
            throw "element is not an iframe: '" + iframe + "'";
        }

        var subHandles = new Map(); // Subscription handle pool

        var subs = {}; // Subscribers

        var connected = false;

        var callBuf = []; // Buffers outbound calls while not connected

        var connectInterval;


        window.addEventListener('message',
            function (event) {

                var dataStr = event.data;

                var data = JSON.parse(dataStr);

                switch (data.message) {

                    case "connected":

                        clearInterval(connectInterval);

                        connected = true;

                        sendBufferedCalls();

                        break;

                    case "published":

                        var topicSubs = subs[data.topic];

                        if (topicSubs) {

                            var handle = data.handle;

                            var handler = topicSubs.handlers[handle];
                            if (handler) {
                                handler(data.published);
                            }
                        }

                        break;

                    case "error":

                        // TODO

                        break;

                }
            }, false);


        connectInterval = setInterval(// Periodically request connection with Server
            function () {
                iframe.contentWindow.postMessage(JSON.stringify({ action:"connect" }), "*");
            }, 500);


        function sendBufferedCalls() {
            while (callBuf.length > 0) {
                sendCall(callBuf.pop());
            }
        }

        function sendCall(call) {
            if (connected) {
                iframe.contentWindow.postMessage(JSON.stringify(call), "*");
            } else {
                callBuf.unshift(call); // Buffer if not connected
            }
        }

        this.call = function (method, params) {
            sendCall({
                action:"call",
                method:method,
                params:params
            });
        };

        this.publish = function (topic, params) {
            sendCall({
                action:"publish",
                topic:topic,
                params:params
            });
        };

        this.subscribe = function (topic, callback) {

            var handle = subHandles.addItem({
                topic:topic
            });

            var topicSubs = subs[topic];

            if (!topicSubs) {

                topicSubs = {           // Subscriptions for this event topic
                    handlers:{}, // Handler function for each subscriber
                    numSubs:0                      // Count of subscribers for the event topic
                };

                subs[topic] = topicSubs;
            }

            topicSubs.handlers[handle] = callback;

            sendCall({
                action:"subscribe",
                topic:topic,
                handle:handle
            });

            return handle;
        };

        this.unsubscribe = function (handle) {

            sendCall({
                action:"unsubscribe",
                handle:handle
            });

            delete subs[handle];
            subHandles.removeItem(handle);
        }
    };

    /**
     * @private
     */
    var Map = function (prefix, items) {

        this.prefix = prefix || "";
        this.items = items || [];

        var lastUniqueIndex = 0;


        /**
         * Adds an item to the map and returns the ID of the item in the map. If an ID is given, the item is
         * mapped to that ID. Otherwise, the map automatically generates the ID and maps to that.
         *
         * id = myMap.addItem("foo") // ID internally generated
         *
         * id = myMap.addItem("foo", "bar") // ID is "foo"
         *
         */
        this.addItem = function () {

            var item;

            if (arguments.length == 2) {

                var id = arguments[0];

                item = arguments[1];

                if (this.items[id]) { // Won't happen if given ID is string
                    throw "ID clash: '" + id + "'";
                }

                this.items[id] = item;

                return id;

            } else {

                var id;

                item = arguments[0];

                while (true) {

                    id = this.prefix + lastUniqueIndex++;

                    if (!this.items[id]) {
                        this.items[id] = item;
                        return id;
                    }
                }
            }
        };

        /**
         * Removes the item of the given ID from the map
         */
        this.removeItem = function (id) {
            delete this.items[id];
        };

        /**
         * Removes all items
         */
        this.clear = function () {
            this.items = items || [];
            lastUniqueIndex = 0;
        }

    };

})();