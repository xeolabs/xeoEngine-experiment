/**
 * Camera manager
 */
define([
//    "css/jquery.terminal.css",
    "libs/jquery/jquery.mousewheel-min.js",
    "libs/jquery/jquery.terminal-min.js",
    "libs/jquery/jquery.bpopup-0.7.0.min.js"
],
    function () {


        String.prototype.strip = function (char) {
            return this.replace(new RegExp("^" + char + "*"), '').
                replace(new RegExp(char + "*$"), '');
        };


        return function (cfg) {

            (function ($) {

                $.fn.tilda = function (eval, options) {

                    if ($('body').data('tilda')) {
                        return $('body').data('tilda').terminal;
                    }

                    this.addClass('tilda');

                    options = options || {};

                    eval = eval || function (command, term) {
                        term.echo("you didn't set eval for tilda");
                    };

                    var settings = {
                        prompt:'ready> ',
                        name:'XEOEngine',
                        height:"100%",
                        enabled:false,
                        greetings:'XEOEngine Terminal\n' +
                            'https://github.com/xeolabs/scenejs-nexus/wiki/Nexus-Terminal\n\n'
                    };

                    if (options) {
                        $.extend(settings, options);
                    }

                    this.append('<div class="td"></div>');

                    var self = this;

                    var td = this.find('.td');

                    self.terminal = td.terminal(eval, settings);

                    var focus = false;

                    this.show = function () {

                        self.slideToggle('fast');
                        self.terminal.set_command('');
                        self.terminal.focus(focus = !focus);
                        self.terminal.attr({
                            scrollTop:self.terminal.attr("scrollHeight")
                        });
                    };

                    $(document.documentElement).keypress(
                        function (e) {
                            if (e.which == 96) {
                                self.show();
                            }
                        });

//                    $("#terminal-button").click(function () {
//                        self.show();
//                    });

                    self.hide();

                    $('body').data('tilda', this);

                    return self;
                };
            })(jQuery);

            var tilda = $(cfg.elementId || '#tilda').tilda(
                function (command, terminal) {

                    try {
                        eval(command);
                    } catch (e) {
                        terminal.echo("uncaught exception: " + (e.message || e) ).css("color", "red");
                    }
                });

            this._destroy = function () {

            };
        }
    });