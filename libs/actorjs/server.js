require([
    'libs/actorjs/actorjs.js'
],
    function () {

        var created = false;        // True when WindowClient.Create executed
        var connected = false;      // True when client has connected

        var client;                 //
        var clientOrigin;

        var responseQueue = [];

        if (window.addEventListener) {

            addEventListener("message",
                function (event) {

                    var data = event.data;

                    if (data == "connect") { // Connection request from client

                        if (!connected) {
                            connected = true;
                            event.source.postMessage("connected", event.origin);  // Fire back connection accept

                            client = event.source;
                            clientOrigin = event.origin;

                            sendBufferedResponses();
                        }

                    } else { // JSON command from client

                        if (!connected) {

                            console.error("Command from WindowClient peer, but peer did not connect first");

                        } else {

                            try {

                                var command = JSON.parse(data);

                                issueCommand(command);

                            } catch (e) {
                                console.error("Error parsing command from WindowClient peer: " + e);
                            }
                        }
                    }

                }, false);

            created = true;

        } else {
            console.error("window.addEventListener not found - this browser does not support cross-window messaging");
        }


        Human.onData(
            function (key, value) { // TODO: filter only results required by client
                var response = {};
                response[key] = value;
                sendResponse(response);
            });

        Human.onError(
            function (error) {
                sendResponse({ error:error });
            });


        function sendResponse(json) {
            var message = JSON.stringify(json);
            if (!client) {
                responseQueue.push(message);
                return;
            }
            client.postMessage(message, clientOrigin);
        }

        function sendBufferedResponses() {
            while (responseQueue.length > 0) {
                client.postMessage(responseQueue.pop(), clientOrigin);
            }
        }

        function issueCommand(command) {

            var commandName = command.command;

            /* Execute camera commands immediately to avoid queue lag
             */
            if (commandName == "Camera.Pan" ||
                commandName == "Camera.Orbit" ||
                commandName == "Camera.FlyTo" ||
                commandName == "Camera.JumpTo" ||
                commandName == "Camera.Zoom") {

                executeCommand(command);
                return;
            }

            if (countProcesses == 0) {      // Execute immediately if Human not busy

                executeCommand(command);

            } else {

                commandQueue.push(command);        // Else enqueue

                if (!pQueueInterval) {
                    pQueueInterval = setInterval(
                        function () {
                            if (commandQueue.length > 0 && countProcesses == 0) {
                                executeCommand(commandQueue.shift());
                            }
                            if (commandQueue.length == 0) {
                                clearInterval(pQueueInterval);
                            }
                        }, 20);
                }
            }
        }

        function executeCommand(command) {
            var id = command.id;
            Human.send(
                command,
                function (result) { // success
                    if (id && !result) {

                        /* Command returned no data, which should only be the case when the command is not a query.
                         *
                         * When the command invokation has an ID however, this means that the client wants an
                         * acknowledgement on completion of the command's execution.
                         */
                        sendResponse({ response:{} }); // Empty data is an ACK
                    }
                },
                function (error) { // error
                    sendResponse({ error:error });
                });
        }
