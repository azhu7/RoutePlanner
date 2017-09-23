app.controller('HomeCtrl', function($scope,$http,$state) {
    $scope.submitForm = function() {
        $http.get("/login", $scope.user).then(function(response) {
            // $state.go('map')
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
    $scope.locations = [];
    var directionsDisplay;

    $scope.placeChanged = function() {
        $scope.vm.place = this.getPlace();
        console.log($scope.vm.place.geometry.location)
        marker = new google.maps.Marker({
            position: $scope.vm.place.geometry.location,
            map: $scope.vm.map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        if ($scope.locations.length) {
            console.log("calculating a route....")
            var request = {
                origin: $scope.locations[$scope.locations.length - 1].geometry.location,
                destination: marker.position,
                travelMode: 'DRIVING'
            }
            directionsService = new google.maps.DirectionsService();
            directionsService.route(request, function(result,status) {
                if(status == 'OK') {
                    directionsDisplay.setDirections(result)
                }
            })
        };
        $scope.vm.map.setZoom(10)
        $scope.locations.push($scope.vm.place);
        $scope.vm.map.setCenter($scope.vm.place.geometry.location);
    }
    NgMap.getMap().then(function(map) {
        directionsDisplay = new google.maps.DirectionsRenderer();
        $scope.vm.map = map;
        directionsDisplay.setMap(map);
    });
});
