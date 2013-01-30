/**
 * Mouse management actor
 *
 * - Expects a scene graph resource
 * - Catches mouse events on the scene graph's canvas and publishes them
 */
define(function () {

    return function (cfg) {

        var scene = this.getObject("scene");

        var canvas = scene.getCanvas();

        canvas.addEventListener('mousedown', mouseDown, true);
        canvas.addEventListener('mousemove', mouseMove, true);
        canvas.addEventListener('mouseup', mouseUp, true);
        canvas.addEventListener('mousewheel', mouseWheel, true);
        canvas.addEventListener('click', click, true);
        canvas.addEventListener('dblclick', dblClick, true);
        canvas.addEventListener('selectstart', selectStart, false);

        var lastClickX;
        var lastClickY;

        var self = this;

        function mouseDown(event) {
            var coords = getClickCoordsWithinElement(event);
            self.publish("mousedown", {
                canvasX:coords.clientX,
                canvasY:coords.clientY,
                altKey:event.altKey,
                ctrlKey:event.ctrlKey
            });
        }

        function mouseMove(event) {
            lastClickX = undefined;
            var coords = getClickCoordsWithinElement(event);
            self.publish("mousemove", {
                canvasX:coords.clientX,
                canvasY:coords.clientY,
                altKey:event.altKey,
                ctrlKey:event.ctrlKey
            });
        }

        function mouseUp(event) {
            var coords = getClickCoordsWithinElement(event);
            self.publish("mouseup", {
                canvasX:coords.clientX,
                canvasY:coords.clientY,
                altKey:event.altKey,
                ctrlKey:event.ctrlKey
            });
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
            self.publish("mousewheel", { delta:delta });
        }

        function dblClick(event) {
            event = getClickCoordsWithinElement(event);
            self.publish("dblclick", {
                canvasX:event.clientX,
                canvasY:event.clientY,
                altKey:event.altKey,
                ctrlKey:event.ctrlKey
            });
        }

        function click(event) {
            event = getClickCoordsWithinElement(event);
            self.publish("click", { canvasX:event.clientX, canvasY:event.clientY });
        }

        function selectStart(e) {
            e.preventDefault();
            return false;
        }

        /** Finds local coords within HTML element for the given mouse click event
         */
        function getClickCoordsWithinElement(event) {
            var coords = { clientX:0, clientY:0 };
            if (!event) {
                event = window.event;
                coords.clientX = event.clientX;
                coords.clientY = event.clientY;
            } else {
                var element = event.target;
                var totalOffsetLeft = 0;
                var totalOffsetTop = 0;

                while (element.offsetParent) {
                    totalOffsetLeft += element.offsetLeft;
                    totalOffsetTop += element.offsetTop;
                    element = element.offsetParent;
                }
                coords.clientX = event.pageX - totalOffsetLeft;
                coords.clientY = event.pageY - totalOffsetTop;
            }
            return coords;
        }

        this._destroy = function () {
            canvas.removeEventListener('mousedown', mouseDown, true);
            canvas.removeEventListener('mousemove', mouseMove, true);
            canvas.removeEventListener('mouseup', mouseUp, true);
            canvas.removeEventListener('mousewheel', mouseWheel, true);
            canvas.removeEventListener('click', click, true);
            canvas.removeEventListener('dblclick', dblClick, true);
            canvas.removeEventListener('selectstart', selectStart, false);
        };
    };
});

