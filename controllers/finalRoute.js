app.controller('RouteCtrl',function($scope,$http,NgMap,$state,$stateParams) {
    $http.post('/api/v1/gettripinfo', {trip_code: $stateParams.trip_code}).then(function(response) {
        // TODO
        // REQUIRES: optimal path
        $scope.locations = response.data.path;
        $scope.visited = response.data.visited;
        $scope.unvisited = response.data.unvisited;

        console.log($scope.locations);
        console.log($scope.visited);
        console.log($scope.unvisited);

        $scope.visited.push($scope.unvisited[0]);  // Automatically visit the first location
        $scope.unvisited.splice(0, 1);  // Visited the first location

        // init the map
        NgMap.getMap().then(function(map) {
            directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
            $scope.map = map;
            directionsDisplay.setMap(map);
            google.maps.event.trigger(map, 'resize');

            angular.forEach($scope.locations, function(loc) {
                var marker = new google.maps.Marker({
                    position: {lat: loc.lat, lng: loc.lng},
                    map: map,
                    draggable: false,
                    animation: google.maps.Animation.DROP
                });

                var unvisitedIdx = findByLatLng(loc,$scope.unvisited);

                if (unvisitedIdx !== -1) {
                    // unvisited
                    console.log('Set ' + loc + ' to green!');
                    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
                }


                $scope.markers.push(marker);
            });

            if ($scope.visited.length) {
                $scope.currentLocationIdx = findByLatLng($scope.visited[$scope.visited.length - 1], $scope.locations);
                if ($scope.currentLocationIdx === -1) {
                    $scope.currentLocationIdx = 0;
                }
            } else {
                $scope.currentLocationIdx = 0;
            }

            console.log($scope.currentLocationIdx);
            $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png')
            $scope.drawRoute();
        });


    });


    $scope.drawRoute = function() {
        if ($scope.locations.length > 1) {
            console.log("calculating a route....")
            var waypts = [];
            for (i=1; i < $scope.locations.length - 1; i++){
                waypts.push({
                    location: {lat: $scope.locations[i].lat, lng: $scope.locations[i].lng},
                    stopover: true
                });
            }

            var request = {
                origin: {lat: $scope.locations[0].lat, lng: $scope.locations[0].lng},
                waypoints: waypts,
                destination: {lat: $scope.locations[$scope.locations.length - 1].lat, lng: $scope.locations[$scope.locations.length - 1].lng},
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
        return source.findIndex(x => x.address === target.address);
    }


    $scope.moveForward = function() {
        var unvisitedIdx = findByLatLng($scope.locations[$scope.currentLocationIdx], $scope.unvisited);

        if (unvisitedIdx !== -1) {
            $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
        } else {
            $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
        }

        if($scope.currentLocationIdx < $scope.locations.length - 1) {
            $scope.currentLocationIdx += 1;
        }

        $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
    }


    $scope.moveBack = function() {
        var unvisitedIdx = findByLatLng($scope.locations[$scope.currentLocationIdx], $scope.unvisited);

        if (unvisitedIdx !== -1) {
            $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
        } else {
            $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
        }

        if ($scope.currentLocationIdx > 0) {
            $scope.currentLocationIdx -= 1;
        }

        $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
    }

    $scope.checkIn = function() {
        // TODO
        // move the current index from unvisited to visited
        var unvisitedIdx = findByLatLng($scope.locations[$scope.currentLocationIdx], $scope.unvisited);
        if (unvisitedIdx !== -1) {
            $scope.unvisited.splice(unvisitedIdx,1);
            $scope.visited.push($scope.locations[$scope.currentLocationIdx]);
        }
        $scope.markers[$scope.currentLocationIdx].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');

        console.log($scope.unvisited.length);
        if ($scope.unvisited.length === 0) {
            alert("It seems that you've reached the end of your trip. We hope you enjoyed using our app and our suggested route!");
        }
    }

    $scope.callLyft = function() {
        if ($scope.currentLocationIdx === $scope.locations.length - 1 || !$scope.unvisited.length) {
            if ($scope.unvisited.length) {
                alert("It seems that you skipped a few destinations along your trip! To recalculate a new itinerary, please hit the back button")
            } else {
                alert("It seems that you've reached the end of your trip. We hope you enjoyed using our app and our suggested route!");
            }
            return;
        }

        var params1 = {
            dest : {
                lat: $scope.locations[$scope.currentLocationIdx].lat,
                lng: $scope.locations[$scope.currentLocationIdx].lng
            }
        }

        $http.post('/api/v1/lyftride_type', params1).then(function(response){
            var ride_type_ = response.data[0];
            var params2 = {
                ride_type: ride_type_,
                start_lat: $scope.locations[$scope.currentLocationIdx].lat,
                start_lng: $scope.locations[$scope.currentLocationIdx].lng,
                end_lat: $scope.locations[$scope.currentLocationIdx + 1].lat,
                end_lng: $scope.locations[$scope.currentLocationIdx + 1].lng
            }

            $http.post("/api/v1/lyftuniversal_link", params2).then(function(response){
                console.log(response.data);
                var win = window.open(response.data, '_blank');
                win.focus();
            })
        }).catch(function(err) {
            console.log(err);
            alert("Something went wrong while opening Lyft.");
        })
    }

    $scope.callGoogleMaps = function() {
        if ($scope.currentLocationIdx === $scope.locations.length - 1 || !$scope.unvisited.length) {
            if ($scope.unvisited.length) {
                alert("It seems that you skipped a few destinations along your trip! To recalculate a new itinerary, please hit the back button")
            } else {
                alert("It seems that you've reached the end of your trip. We hope you enjoyed using our app and our suggestion!");
            }
            return;
        }

        var params2 = {
            start_address: $scope.locations[$scope.currentLocationIdx].address,
            end_address: $scope.locations[$scope.currentLocationIdx + 1].address,
        }

        console.log(params2);

        $http.post("/api/v1/googleuniversal_link", params2).then(function(response){
            console.log(response.data);
            var win = window.open(response.data, '_blank');
            win.focus();
        }).catch(function(err) {
            console.log(err);
            alert("Something went wrong while opening Google Maps.");
        });
    }

    // init variables
    $scope.locations;
    console.log("CHECK ME OUT! TRIP CODE: ",$stateParams.trip_code);
    $scope.markers = []
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
})
