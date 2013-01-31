xeoEngine
=========

xeoEngine is an insanely modular WebGL-based 3D engine built on [ActorJS](http://actorjs.org) and [SceneJS](http://scenejs.org).

## Concept

Via JSON-RPC calls, xeoEngine lets us plug actors together to create 3D worlds, then fire calls at the actors to make the worlds
 do stuff.

xeoEngine dynamically loads actors from libraries of [RequireJS](http://requirejs.org) AMD modules, and the aim is to have an extensive library of
 those actors from which we select as required for each application we build on xeoEngine.

To use xeoEngine, we embed it in a Web page and drive it via JSON-RPC calls from a script in that page. Our page only
loads one little JavaScript file for the xeoEngine client through which we fire those calls. None of xeoEngine's JavaScripty stuff
(ActorJS, RequireJS etc.) appears in our page, only the client and a bunch of calls.

[Try it out on jsFiddle](http://jsfiddle.net/TzFhT/)

First, our page needs an iframe containing the xeoEngine [server](https://github.com/xeolabs/xeoEngine/blob/master/server.html):
```html
<iframe id="myIFrame" style="width:800px; height:600px;"
src="http://xeolabs.github.com/xeoEngine/server.html"></iframe>
```
and the script tag to load the xeoEngine [client class](https://github.com/xeolabs/xeoEngine/blob/master/client.js):
```html
<script src="http://xeolabs.github.com/xeoEngine/client.js"></script>
```
Then we simply drive the xeoServer through the client:
```javascript

    /* Create a client
     */
    var engine = new xeoEngine({
        iframe:"myIFrame"
    });

    /* Add scene actor
     */
    engine.call("addActor", {
        type:"scene",
        actorId:"scene"
    });

    /* Add a child teapot actor to the root actor. This will create
     * a teapot in the scene graph.
     */
    engine.call("scene/addActor", {
        type:"objects/prims/teapot",
        yPos:2
    });

    /* Add a child actor to the root actor. This will control the
     * scene graph's lookat node.
     */
    engine.call("myScene/addActor", {
        type: "scene/camera",
        actorId: "myCamera"
    });

    /* Subscribe to the "eye" topic that is published to by
     * the camera actor whenever its eye position changes.
     * See how we specify a path down through the hierarchy
     * to the camera actor's topic.
     */
    engine.subscribe("myScene/myCamera/eye",
        function(update) {

            var eye = update.eye;

            //..
        });

    /* Call a method on the camera actor to set the eye position.
     * This will cause the actor to publish to its "eye" topic,
     * which will get handled by the subscription we made above.
     */
    engine.call("myScene/myCamera/setEye", {
        x: -30,
        y: 0,
        z: 50
    });
```


## Examples
* [Teapot](http://xeolabs.github.com/xeoEngine/teapot.html) - A Newell Teapot resting on a grid ground plane
* [City](http://xeolabs.github.com/xeoEngine/city.html) - A procedurally-generated city
* [City Flight](http://xeolabs.github.com/xeoEngine/cityFlight.html) - Flight simulation over a procedurally-generated city

## Documentation
To get the gist of xeoEngine, take a look at
* [ActorJS](http://actorjs.org)
* [SceneJS](http://scenejs.org)
* [The xeoEngine Wiki](https://github.com/xeolabs/xeoEngine/wiki)

## License
xeoEngine is licensed under both the [GPL](https://github.com/xeolabs/xeoEngine/blob/master/licenses/GPL_LICENSE.txt)
and [MIT](https://github.com/xeolabs/xeoEngine/blob/master/licenses/MIT_LICENSE.txt) licenses. Pick whichever of those fits your needs.
