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

    $scope.placeChanged = function() {
        $scope.vm.place = this.getPlace();
        marker = new google.maps.Marker({
                position: $scope.vm.place.geometry.location,
                map: $scope.vm.map,
              });
        $scope.locations.push($scope.vm.place);
	$scope.vm.map.setZoom(10);
        $scope.vm.map.setCenter($scope.vm.place.geometry.location);
    }
    NgMap.getMap().then(function(map) {
        $scope.vm.map = map;
    });
});
