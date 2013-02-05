xeoEngine
=========

xeoEngine is a message-driven WebGL engine built on [ActorJS](https://github.com/xeolabs/actorjs) and [SceneJS](http://scenejs.org)
that lets you create and manage 3D worlds over a network.

## Concept

Via JSON-RPC, xeoEngine lets us plug actors together to create a 3D world, then fire calls at the actors to make the world
 do stuff. xeoEngine dynamically loads actors from libraries of AMD modules, and the aim is to build an extensive library of
 those actors from which we select as required for each app built on xeoEngine.

To use xeoEngine, embed the [server page](http://xeolabs.github.com/xeoEngine/server.html) in an iframe:
```html
<iframe id="myIFrame" style="width:800px; height:600px;"
src="http://xeolabs.github.com/xeoEngine/server.html"></iframe>
```
link to the xeoEngine [client library](http://xeolabs.github.com/xeoEngine/client.js):
```html
<script src="http://xeolabs.github.com/xeoEngine/client.js"></script>
```
then create a client and drive the xeoEngine server page through it:
```javascript
/* Create a client
 */
var engine = new xeoEngine({
    iframe: "myIFrame"
});

/* Add a scene actor - this will be the root of our actor hierarchy
 * and will provide a scene graph to its child actors.
 */
engine.call("addActor", {
    type: "scene",
    actorId: "myScene"
});

/* Add a teapot actor as a child of the scene actor. This will create
 * a teapot in the scene graph.
 */
engine.call("myScene/addActor", {
    type: "objects/prims/teapot",
    yPos: 2
});

/* Add a camera actor as a second child of the scene actor. This will control the
 * scene graph's "lookat" node.
 */
engine.call("myScene/addActor", {
    type: "camera",
    actorId: "myCamera"
});

/* Subscribe to "eye" messages published by the camera actor whenever its eye
 * position changes. See how we specify a path down through the actor hierarchy
 * to the camera actor's "eye" topic.
 */
engine.subscribe("myScene/myCamera/eye",

function (update) {

    var eye = update.eye;

    //..
});

/* Call a method on the camera actor to set the eye position.
 * This will cause the actor to publish a message to its "eye" topic,
 * which we'll handle with the subscription we made above.
 */
engine.call("myScene/myCamera/setEye", {
    x: -30,
    y: 0,
    z: 50
});
```

## Examples
Find a growing collection of examples over at [CodePen](http://codepen.io/collection/BfogF)

## Documentation
To get the gist of xeoEngine, take a look at
* [ActorJS](http://actorjs.org)
* [SceneJS](http://scenejs.org)
* [The xeoEngine Wiki](https://github.com/xeolabs/xeoEngine/wiki)

## License
xeoEngine is licensed under both the [GPL](https://github.com/xeolabs/xeoEngine/blob/master/licenses/GPL_LICENSE.txt)
and [MIT](https://github.com/xeolabs/xeoEngine/blob/master/licenses/MIT_LICENSE.txt) licenses. Pick whichever of those fits your needs.
