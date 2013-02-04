/**
 * Shows scope background tasks as growl-style notifications using UIKit
 *
 * http://visionmedia.github.com/uikit/
 */
define([
    "lib/ui"
],

    function () {

        return function (configs) {

            var tasks = {};

            this.subscribe("task.started",
                function (params) {

                    var taskId = params.taskId;
                    var description = params.description;

                    tasks[taskId] = {
                        description:description,
                        widget:ui.notify(description).sticky()
                    };
                });

            this.subscribe("task.finished",
                function (params) {

                    var taskId = params.taskId;
                    var task = tasks[taskId];

                    if (task) {
                        task.widget
                            .type("success")
                            .hide(5000)
                            .effect("slide");
                        delete tasks[taskId];
                    }
                });

            this.subscribe("task.failed",
                function taskFailed(params) {

                    var taskId = params.taskId;
                    var task = tasks[taskId];

                    if (task) {
                        task.widget.type("error");
                        delete tasks[taskId];
                    }
                });

            this.subscribe("task.aborted",
                function taskAborted(params) {

                    var taskId = params.taskId;
                    var task = tasks[taskId];

                    if (task) {
                        task.widget.hide(5000).effect("slide");
                        delete tasks[taskId];
                    }
                });

            this._destroy = function () {
                for (var taskId in tasks) {
                    if (tasks.hasOwnProperty(taskId)) {
                        tasks[taskId].widget.hide();
                    }
                }
            };
        };
    });
