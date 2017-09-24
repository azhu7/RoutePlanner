app.controller('RouteCtrl',function($scope,$http,NgMap,$state,$stateParams) {
    $http.post('/api/v1/gettripinfo', {trip_code: $stateParams.trip_code}).then(function(response) {
        // TODO
        // REQUIRES: optimal path
        $scope.locations = response.data.path;
        $scope.visited = response.data.visited;
        $scope.unvisited = response.data.unvisited;


        $scope.currentLocationIdx = findByLatLng($scope.visited[$scope.visited.length - 1], $scope.locations);
        if ($scope.currentLocationIdx === -1) {
            $scope.currentLocationIdx = 0;
        }

        $scope.markers = [];
        angular.forEach($scope.locations, function(location) {
            marker = new google.maps.Marker({
                position: location.geometry.location,
                map: $scope.vm.map,
                draggable: false,
                animation: google.maps.Animation.DROP
            });

            var unvisitedIdx = findByLatLng(location,$scope.unvisited);

            if (unvisitedIdx !== -1) {
                // unvisited
                marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
            }


            $scope.markers.push(marker);
        });

        $scope.marker[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png')
    });


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

            var request = {
                origin: $scope.locations[0].geometry.location,
                waypoints: waypts,
                destination: $scope.locations[$scope.locations.length - 1].latlng,
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


    var findByLatLng = function(target, source) {
        return source.findIndex(x => x.formatted_address === target.formatted_address);
    }


    $scope.moveForward = function() {
        // TODO
        var unvisitedIdx = findByLatLng($scope.location[$scope.currentLocationIdx], $scope.unvisited);

        if (unvisited !== -1) {
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
        } else {
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
        }


        $scope.currentLocationIdx += 1;
        $scope.marker[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
    }


    $scope.moveBack = function() {
        // TODO
        var unvisitedIdx = findByLatLng($scope.location[$scope.currentLocationIdx], $scope.unvisited);

        if (unvisited !== -1) {
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
        } else {
            marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
        }


        $scope.currentLocationIdx -= 1;
        $scope.marker[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
    }

    $scope.checkIn = function() {
        // TODO
        // move the current index from unvisited to visited
        $scope.currentLocationIdx = findByLatLng($scope.locations[$scope.currentLocationIdx], $scope.unvisited);
        if (unvisitedIdx !== -1) {
            $scope.unvisited.splice(unvisitedIdx,1);
            $scope.visited.push($scope.locations[$scope.currentLocationIdx]);
        }
        $scope.marker[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }


    // init the map
    NgMap.getMap().then(function(map) {
        directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
        $scope.vm.map = map;
        directionsDisplay.setMap(map);
        google.maps.event.trigger($scope.vm.map, 'resize');
    });


    // init variables
    $scope.locations;
    console.log("CHECK ME OUT! TRIP CODE: ",$stateParams.trip_code);
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
})
