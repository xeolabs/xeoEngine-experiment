xeoEngine
=========

xeoEngine is an insanely modular and abstract WebGL-based 3D engine built on [ActorJS](http://actorjs.org) and [SceneJS](http://scenejs.org).

## Examples
Find a growing collection of examples over at [CodePen](http://codepen.io/collection/BfogF)

## Concept

Via JSON-RPC calls, xeoEngine lets us plug actors together to create 3D worlds, then fire calls at the actors to make the worlds
 do stuff.

xeoEngine dynamically loads actors from libraries of AMD modules, and the aim is to have an extensive library of
 those actors from which we select as required for each application we build on xeoEngine.

To use xeoEngine, embed it in a Web page and drive it via RPC calls from scripts in the page. Our page only
loads one little JavaScript file containing the xeoEngine client through which we fire those calls. None of xeoEngine's
dependencies appear in our page - only a client object and our RPC calls.

First, our page needs an iframe containing the xeoEngine server page:
```html
<iframe id="myIFrame" style="width:800px; height:600px;"
src="http://xeolabs.github.com/xeoEngine/server.html"></iframe>
```
and the script tag to load the xeoEngine client:
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

    /* Add a scene actor, which sets up a scene graph
     */
    engine.call("addActor", {
        type:"scene",
        actorId:"scene"
    });

    /* Add a teapot actor as a child of scene actor. This will create
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

## Documentation
To get the gist of xeoEngine, take a look at
* [ActorJS](http://actorjs.org)
* [SceneJS](http://scenejs.org)
* [The xeoEngine Wiki](https://github.com/xeolabs/xeoEngine/wiki)

## License
xeoEngine is licensed under both the [GPL](https://github.com/xeolabs/xeoEngine/blob/master/licenses/GPL_LICENSE.txt)
and [MIT](https://github.com/xeolabs/xeoEngine/blob/master/licenses/MIT_LICENSE.txt) licenses. Pick whichever of those fits your needs.
