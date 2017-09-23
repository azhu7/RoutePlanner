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
	$scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBNbbLZzrEcAlt149RElY0jnHmZ3ADzoYw"

	$scope.types = "['establishment']";

	$scope.placeChanged = function() {
		$scope.place = this.getPlace();
		console.log('location', $scope.place.geometry.location);
		$scope.map.setCenter($scope.place.geometry.location);
	};

	NgMap.getMap().then(function(map) {
		console.log('markers' , map.markers);
	});

});

