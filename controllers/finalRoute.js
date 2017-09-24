app.controller('RouteCtrl',function($scope,NgMap,$state,$stateParams) {
    $http.post('/TODO',function(response) {
        // TODO
        // REQUIRES: optimal path
        $scope.path = response.data;


        angular.forEach($scope.$scope.path, function(location) {
            marker = new google.maps.Marker({
                position: location.latlng,
                map: $scope.vm.map,
                draggable: false,
                animation: google.maps.Animation.DROP
            });
            $scope.markers.push(marker);
        });
    });


    $scope.drawRoute = function() {
        if ($scope.path.length > 1) {
            console.log("calculating a route....")
            var waypts = [];
            for (i=1; i < $scope.path.length - 1; i++){
                waypts.push({
                    location: $scope.path[i].latlng,
                    stopover: true
                });
            }

            var request = {
                origin: $scope.path[0].latlng,
                waypoints: waypts,
                destination: $scope.path[$scope.path.length - 1].latlng,
                optimizeWaypoints: true,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }

            directionsService.route(request, function(result,status) {
                if(status == 'OK') {
                    console.log("result: ", result)
                    directionsDisplay.setDirections(result)
                }
            })
        }
    }


    $scope.moveForward = function() {
        // TODO
    }


    $scope.moveBack = function() {
        // TODO
    }

    $scope.checkIn = function() {
        // TODO
    }


    // init the map
    NgMap.getMap().then(function(map) {
        directionsDisplay = new google.maps.DirectionsRenderer();
        $scope.vm.map = map;
        directionsDisplay.setMap(map);
        google.maps.event.trigger($scope.vm.map, 'resize');
    });


    // init variables
    $scope.path;
    $scope.vm.map;
    $scope.markers = [];
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
})
