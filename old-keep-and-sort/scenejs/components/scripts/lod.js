require(["./common"],
    function () {

        call("lod.add", {

            id:"myBox",

            xmin:-10,
            ymin:-10,
            zmin:-10,
            xmax:10,
            ymax:10,
            zmax:10,

            levels:[
                10,
                30,
                40
            ]

        });

        subscribe(
            "lod.update.myBoundary",
            function (params) {

                switch (params.level) {
                    case 0:
                        break;
                    
                    case 1:
                        break;

                    case 2:
                        break;
                }
            });
    });