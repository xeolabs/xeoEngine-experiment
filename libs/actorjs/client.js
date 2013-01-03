/**
 * Client for connection with remote Human using cross-window messaging
 * @param cfg
 * @constructor
 */
var ActorJSClient = function (cfg) {

    if (!cfg.iframe) {
        throw "config expected: iframe";
    }

    var iframe = document.getElementById(iframe);

    if (!iframe) {
        throw "iframe not found: '" + iframe + "'";
    }

    if (!iframe.contentWindow) {
        throw "element is not an iframe: '" + iframe + "'";
    }

    var subHandles = new HumanAPI._Map(); // Subscription handle pool

    var pubs = {}; // Publications
    var subs = {}; // Subscribers

    var ready = false; // True once server signals ready

    var callBuf = []; // Buffers outbound calls while ready != true

    var connectInterval;


    var self = this;

    window.addEventListener('message',
        function (event) {

            var dataStr = event.data;

            var data = JSON.parse(dataStr);

            switch (data.message) {

                case "ready":

                    ready = true;

                    clearInterval(connectInterval);

                    sendBufferedCalls();

                    break;

                case "pubs":

                    var pubs = data.pubs;

                    for (var key in pubs) { // For each publication
                        if (pubs.hasOwnProperty(key)) {

                            if (subs[key]) { // Subscription exists to this publication
                                self.publish(key, pubs[key]); // Publish the packet
                            }
                        }
                    }

                    break;

                case "error":

                    // TODO

                    break;

            }
        }, false);

    /* Periodically request connection with Server
     */
    connectInterval = setInterval(function () {
        iframe.contentWindow.postMessage("connect", "*");
    }, 500);


    function sendBufferedCalls() {
        while (callBuf.length > 0) {
            sendCall(callBuf.pop());
        }
    }

    function sendCall(call) {
        if (ready) {
            iframe.contentWindow.postMessage(JSON.stringify(call), "*");
        } else {
            callBuf.unshift(call); // Buffer if not ready
        }
    }

    this.call = function (method, params) {
        sendCall({
            method:method,
            params:params
        });
    };


    this.publish = function (topic, pub) {


    };

    this.subscribe = function (topic, callback) {

        var handle = subHandles.addItem({
            topic:topic
        });

        sendCall({
            method:"subscribe",
            topic:topic,
            handle:handle
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

        topicSubs.numSubs++;

        var pub = pubs[topic];

        if (pub) {
            callback(pub);
        }

        return handle;
    };

    this.unsubscribe = function (handle) {

        sendCall({
            action:"unsubscribe",
            handle:handle
        });

        delete subs[handle];
        handleMap.removeItem(handle);
    }
};