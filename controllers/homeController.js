app.controller('HomeCtrl', function($scope,$http,$state) {
    $scope.submitForm = function() {
        $http.get("/login", $scope.user).then(function(response) {
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
    $scope.markers = [];
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();

    $scope.calculateRoute = function() {
        if ($scope.locations.length) {
            console.log("calculating a route....")

            var waypts = [];
            console.log($scope.locations.length)
            for (i=1; i < $scope.locations.length; i++){
                waypts.push({
                    location: $scope.locations[i].geometry.location,
                    stopover: true
                });
            }

            console.log("way: ", waypts)

            var request = {
                origin: $scope.locations[0].geometry.location,
                waypoints: waypts,
                destination: marker.position,
                optimizeWaypoints: true,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }


            directionsService.route(request, function(result,status) {
                if(status == 'OK') {
                    directionsDisplay.setDirections(result)
                }
            })
        };
    };

    $scope.placeChanged = function() {
	// remove words in search bar
	$scope.address = "";
        $scope.vm.place = this.getPlace();
        console.log($scope.vm.place.geometry.location)
        marker = new google.maps.Marker({
            position: $scope.vm.place.geometry.location,
            map: $scope.vm.map,
            draggable: false,
            animation: google.maps.Animation.DROP
        });

        $scope.vm.map.setZoom(10)
        $scope.locations.push($scope.vm.place);
	$scope.markers.push(marker);
	$scope.vm.map.setZoom(13);
        $scope.vm.map.setCenter($scope.vm.place.geometry.location);

	$scope.calculateRoute();
    };

    // splices the location away from locations but also
    // removes the marker off the map
    $scope.removeLocation = function(index) {	
	$scope.locations.splice(index, 1);	
	$scope.markers[index].setMap(null);
	$scope.markers.splice(index, 1);
	$scope.calculateRoute();
    };

    NgMap.getMap().then(function(map) {
        directionsDisplay = new google.maps.DirectionsRenderer();
        $scope.vm.map = map;
        directionsDisplay.setMap(map);
	google.maps.event.trigger($scope.vm.map, 'resize'); 
    });
});
