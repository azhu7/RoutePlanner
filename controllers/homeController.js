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
    $scope.markers = [];

    $scope.placeChanged = function() {
        $scope.vm.place = this.getPlace();
        console.log($scope.vm.place.geometry.location)
        marker = new google.maps.Marker({
                position: $scope.vm.place.geometry.location,
                map: $scope.vm.map,
                draggable: true,
                animation: google.maps.Animation.DROP,
              });

        if ($scope.markers.length) {
            var request = {
                origin: $scope.markers[$scope.markers.length - 1],
                destination: marker.position,
                travelMode: 'DRIVING'
            }
            directionsDisplay = new google.maps.DirectionsRenderer().route(request,function(result,status){
                if(status == 'OK') {
                    $scope.vm.map.setDirections(result)
                }
             });
        }
        $scope.markers.push(marker)
        $scope.vm.map.setZoom(10)
    }
    NgMap.getMap().then(function(map) {
        $scope.vm.map = map;
    });
});
