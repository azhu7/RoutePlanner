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

app.controller('MapCtrl', function($scope, $http, NgMap) {
	$scope.vm = this;
	// sets of locations and markers to render sidebar and map respectively
	$scope.locations = [];
	$scope.markers = [];
	$scope.path = [];

	NgMap.getMap().then(function(map) {
		// directionsDisplay = new google.maps.DirectionsRenderer();
		$scope.vm.map = map;
		// directionsDisplay.setMap(map);
		google.maps.event.trigger($scope.vm.map, 'resize');
	});

	var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
	var directionsService = new google.maps.DirectionsService;
	directionsDisplay.setMap($scope.vm.map);

	$scope.drawRoute = function() {
		if ($scope.path.length > 1) {
			console.log("calculating a route....")

			var latlngs = [];
			var start = new google.maps.LatLng($scope.path[0].lat, $scope.path[0].lng);
			for (var i=1; i < $scope.path.length - 1; i++){
				latlngs.push({
					location: new google.maps.LatLng($scope.path[i].lat, $scope.path[i].lng),
					stopover: true
				});
			}

			console.log("way: ", latlngs);

			var request = {
				origin: start,
				waypoints: latlngs,
				destination: $scope.path[$scope.path.length-1],
				optimizeWaypoints: true,
				travelMode: google.maps.DirectionsTravelMode.DRIVING
			};

			directionsService.route(request, function(result,status) {
				if(status === 'OK') {
					console.log("result: ", result);
					directionsDisplay.setDirections(result);
				}
			});


		} else if ($scope.locations.length === 1) {
		}
	};

	$scope.placeChanged = function() {
		// remove words in search bar
		$scope.address = "";
		$scope.vm.place = this.getPlace();
		marker = new google.maps.Marker({
			position: $scope.vm.place.geometry.location,
			map: $scope.vm.map,
			draggable: false,
			animation: google.maps.Animation.DROP
		});

		$scope.locations.push($scope.vm.place);
		$scope.markers.push(marker);
		$scope.vm.map.setCenter($scope.vm.place.geometry.location);
		$scope.vm.map.setZoom(11);
		// $scope.drawRoute();
	};

	// splices the location away from locations but also
	// removes the marker off the map
	$scope.removeLocation = function(index) {
		$scope.locations.splice(index, 1);
		$scope.markers[index].setMap(null);
		$scope.markers.splice(index, 1);
		// $scope.drawRoute();
	};

	// makes backend request to find fastest route and call lyft
	$scope.findShortestRoute = function() {
		var input = [$scope.locations, $scope.option];
		$http({
			url: "api/v1/generatepath",
			method: "POST",
			data: input
		}).then(function successCallback(response) {
			$scope.path = response.data;
			$scope.drawRoute();
		}, function errorCallback(response) {
			console.log("failed to generate path"); 
		});
	};

	$scope.estimateLyftRide = function() {
		var locations = $scope.locations;
		$http({
			url: "api/v1/lyftestimate",
			method: "POST",
			data: locations
		}).then(function successCallback(response) {
			console.log("Success in estimating Lyft!");
			console.log(response.data);
		});
	};
});

/* app.controller('RouteFormController', function($rootScope, $scope, $http, $uibModalInstance) {
   $scope.cancel = $uibModalInstance.close;
   $scope.locations = $rootScope.locations;

// makes backend request to find fastest route and call lyft
$scope.findShortestRoute = function() {
var input = [$scope.locations, $scope.option];
$http({
url: "api/v1/generatepath",
method: "POST",
data: input
}).then(function successCallback(response) {
console.log(response.data);
});
$scope.cancel();

$scope.estimateLyftRide();
};

$scope.estimateLyftRide = function() {
var locations = $scope.locations;
console.log($scope.locations);
$http({
url: "api/v1/lyftestimate",
method: "POST",
data: locations
}).then(function successCallback(response) {
console.log("Success in estimating Lyft!");
console.log(response.data);
});
$scope.cancel();
};
});
// defines modal for confirming route and selecting options
app.factory('RouteFormModal', function($rootScope, $uibModal) {
var open = function() {
return $uibModal.open({
templateUrl: 'route-form-modal.html',
controller: 'RouteFormController',
size: 'md',
resolve: {

}
});
};

return {
open: open
};
}); */
