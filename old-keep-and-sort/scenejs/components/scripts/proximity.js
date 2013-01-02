require(["./common"],
    function () {

        function addCity(centerX, centerZ, size) {

            var id = "city-" + centerX + "-" + centerZ; // Dashes - not dots, which delimit actor and method IDs in calls

            /* Add a region to the proximity culling actor. The region has a spherical boundary,
             * along with hooks to execute when the boundary intersection status changes with respect
             * to the system's "near" and "distant" radii.
             */
            call("proximity.add", {
                id:id,
                x:centerX,
                z:centerZ,
                radius:size + (size / 2) // Encloses our city
            });

            var cityExists = false;

            subscribe("proximity.update." + id,
                function (params) {

                    switch (params.radius) {

                        /* Intersecting radius index == 0
                         */
                        case 0:

                            /* Add city if not already added
                             */
                            call("add", {
                                type:"objects/buildings/city",
                                id:id,

                                xPos:centerX,
                                zPos:centerZ,

                                xBuildings:6,
                                zBuildings:8,

                                xSize:size,
                                zSize:size,

                                streetWidth:20,

                                existsOK:true // Ignore call if city already exists
                            });

                            /* Show the city
                             */
                            call(id + ".set", {
                                enabled:true
                            });

                            cityExists = true;

                            break;

                        /* Intersecting radius index == 1
                         */
                        case 1:

                            /* Hide the city
                             */
                            if (cityExists) {
                                call(id + ".set", {
                                    enabled:false
                                });
                            }

                            break;

                        /* Outside the outer-most radii
                         */
                        case -1:

                            /* Remove the city
                             */
                            call("remove", {
                                id:id
                            });

                            cityExists = false;

                            break;
                    }
                });
        }


        for (var x = -5000; x <= 5000; x += 2000) {
            for (var z = -5000; z <= 5000; z += 2000) {
                addCity(x, z, 300);
            }
        }

        /* Add ground
         */
        call("add", {
            type:"objects/ground/grid2",
            id:"grid"
        });

    })
;