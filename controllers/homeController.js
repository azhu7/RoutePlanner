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

app.controller('MapCtrl', function($scope) {
	$scope.markers = [];

	$scope.initMap = function() {
		var myLatlng = {lat: -25.363, lng: 131.044};


		$scope.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 4,
			center: myLatlng
		});

		google.maps.event.addListener($scope.map, 'click', function(event) {
			$scope.placeMarker(event.latLng);
		});

		$scope.addMarker = function (marker) {
			$scope.markers.push("karat");
		}

		$scope.placeMarker = function (location) {
			var marker = new google.maps.Marker({
				position: location, 
				map: $scope.map
			});

			$scope.addMarker(marker);
		}

	}

	$scope.initMap();



});
