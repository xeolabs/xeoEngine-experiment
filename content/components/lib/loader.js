define(

    function () {

        return {

            load:function (url, ok, error) {

                var scope = this;

                if (scope.path === null) {

                    var parts = url.split('/');
                    parts.pop();
                    scope.path = ( parts.length < 1 ? '.' : parts.join('/') );
                }

                var xhr = new XMLHttpRequest();

                xhr.addEventListener(
                    'load',
                    function (event) {
                        if (event.target.responseText) {
                            ok(event.target.responseText);

                        } else {
                            error('Invalid file [' + url + ']');
                        }

                    }, false);

                xhr.addEventListener('error', function () {
                    error('Couldn\'t load URL [' + url + ']');
                }, false);

                xhr.open('GET', url, true);
                xhr.send(null);
            }
        };
    });
