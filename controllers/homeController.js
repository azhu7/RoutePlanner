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
    var vm = this;
    vm.types = "['establishment']";
    vm.placeChanged = function() {
        console.log("Sup!!!")
        console.log(this.getPlace())
        vm.place = this.getPlace();
        console.log('location', vm.place.geometry.location);
        vm.map.setCenter(vm.place.geometry.location);
    }
    NgMap.getMap().then(function(map) {
        vm.map = map;
    });
});
