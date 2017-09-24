app.controller('HomeCtrl', function($scope,$http,$state) {
    $scope.submitForm = function() {
        $http.post("/login", $scope.user).then(function(response) {
            $state.go('map')
            console.log("login successful");
        });
        console.log("user email: " + $scope.user.email);
    }

    $scope.user = {};
});

// helper to initialize the Google Maps Api through
// MapCtrl

app.controller('MapCtrl', function($scope, NgMap) {
    $scope.vm = this;
    // sets of locations and markers to render sidebar and map respectively
    $scope.locations = [];
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();

    $scope.drawRoute = function() {
        if ($scope.locations.length > 1) {
            console.log("calculating a route....")

            var waypts = [];
            for (i=1; i < $scope.locations.length - 1; i++){
                waypts.push({
                    location: $scope.locations[i].geometry.location,
                    stopover: true
                });
            }

            console.log("way: ", waypts)

            var request = {
                origin: $scope.locations[0].geometry.location,
                waypoints: waypts,
                destination: $scope.locations[$scope.locations.length - 1].geometry.location,
                optimizeWaypoints: true,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }

            directionsService.route(request, function(result,status) {
                if(status == 'OK') {
                    console.log("result: ", result)
                    directionsDisplay.setDirections(result)
                }
            })
        } else if ($scope.locations.length === 1) {

            var request = {
                origin: $scope.locations[0].geometry.location,
                destination: $scope.locations[0].geometry.location,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }

            directionsService.route(request, function(result,status) {
                if(status == 'OK') {
                    console.log("result: ", result)
                    directionsDisplay.setDirections(result)
                }
            })
        }
    };

    $scope.placeChanged = function() {
        // remove words in search bar
        $scope.address = "";
        $scope.vm.place = this.getPlace();
        // marker = new google.maps.Marker({
        //     position: $scope.vm.place.geometry.location,
        //     map: $scope.vm.map,
        //     draggable: false,
        //     animation: google.maps.Animation.DROP
        // });

        $scope.vm.map.setZoom(20)
        $scope.locations.push($scope.vm.place);
        // $scope.markers.push(marker);
        $scope.vm.map.setZoom(13);
        $scope.vm.map.setCenter($scope.vm.place.geometry.location);

        $scope.drawRoute();
    };

    // splices the location away from locations but also
    // removes the marker off the map
    $scope.removeLocation = function(index) {
        $scope.locations.splice(index, 1);
        // $scope.markers[index].setMap(null);
        // $scope.markers.splice(index, 1);
        $scope.drawRoute();
    };

    NgMap.getMap().then(function(map) {
        directionsDisplay = new google.maps.DirectionsRenderer();
        $scope.vm.map = map;
        directionsDisplay.setMap(map);
	    google.maps.event.trigger($scope.vm.map, 'resize');
    });
});
