/**
 * Canvas mouse manager
 */
define(function () {

        /**
         * @constructor
         */
        return function (objectId, nexus, configs) {

            var sceneId = configs.sceneId;
            if (!sceneId) {
                throw "param expected: sceneId";
            }

            var scene = SceneJS.getScene(sceneId);
            if (!scene) {
                throw "scene not found: " + sceneId;
            }

            var canvas = scene.getCanvas();

            canvas.addEventListener('mousedown', mouseDown, true);
            canvas.addEventListener('mousemove', mouseMove, true);
            canvas.addEventListener('mouseup', mouseUp, true);
            canvas.addEventListener('mousewheel', mouseWheel, true);
            canvas.addEventListener('dblclick', dblClick, true);


            /**
             * Destroys this object
             */
            this._destroy = function () {

                canvas.removeEventListener('mousedown', mouseDown, true);
                canvas.removeEventListener('mousemove', mouseMove, true);
                canvas.removeEventListener('mouseup', mouseUp, true);
                canvas.removeEventListener('mousewheel', mouseWheel, true);
                canvas.removeEventListener('dblclick', dblClick, true);
            };


            function mouseDown(event) {
                nexus.publish(objectId + ".down", { canvasX:event.clientX, canvasY:event.clientY });
            }

            function mouseMove(event) {
                nexus.publish(objectId + ".move", { canvasX:event.clientX, canvasY:event.clientY });
            }

            function mouseUp(event) {
                nexus.publish(objectId + ".up", { canvasX:event.clientX, canvasY:event.clientY });
            }

            function mouseWheel(event) {

                var delta = 0;

                if (!event) {
                    event = window.event;
                }

                if (event.wheelDelta) {

                    delta = event.wheelDelta / 120;

                    if (window.opera) {
                        delta = -delta;
                    }

                } else if (event.detail) {
                    delta = -event.detail / 3;
                }

                if (event.preventDefault)
                    event.preventDefault();

                event.returnValue = false;

                nexus.publish(objectId + ".wheel", { delta:delta });
            }

            function dblClick(event) {
                nexus.publish(objectId + ".dblclick", { canvasX:event.clientX, canvasY:event.clientY });
            }
        };
    });

