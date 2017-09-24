/**
route_compute.js
Set of functions for computing various routes, given an array of destinations
*/

let solver = require('node-tspsolver');
let estimator = require('./lyft.js');
let distance = require('google-distance-matrix');
distance.key('AIzaSyDXlg2yAdgUtISR7VqeNUkH6LjehNaszaQ');
distance.units('imperial');

module.exports = {
    optimal_route: function(destinations, round_trip, callback) {
        get_cost_matrix(destinations, function(cost_matrix) {
            tsp(cost_matrix, round_trip, callback);
        });
    },

    worst_route: function(destinations, round_trip, callback) {
        get_cost_matrix(destinations, function(cost_matrix) {
            //Invert to make "best" paths "worst" and vice versa
            for (let i = 0; i < cost_matrix.length; i++) {
                for (let j = 0; j < cost_matrix.length; j++) {
                    cost_matrix[i][j] = 100 / cost_matrix[i][j];
                }
            }

            tsp(cost_matrix, round_trip, callback);
        });
    },

    random_route: function(destinations, round_trip, callback) {
        let counter = destinations.length;

        while (counter > 0) {
            let index = Math.floor(Math.random() * counter);
            counter--;
            let temp = destinations[counter];
            destinations[counter] = destinations[index];
            destinations[index] = temp;
        }

        if (round_trip) {
            destinations.push(destinations[0]);
        }
        
        callback(destinations);
    }
}

// Given destinations and a cost matrix, compute the optimal path.
function tsp(cost_matrix, round_trip, callback) {
    solver
        .solveTsp(cost_matrix, round_trip, {})
        .then(function(result) {
            callback(result);
        });
}

// Given an array of destinations ([latitude, longitude, address]), 
// return a matrix of costs.
function get_cost_matrix(destinations, callback) {
    let cost_matrix = new Array(destinations.length);
    for (let i = 0; i < cost_matrix.length; i++) {
        cost_matrix[i] = new Array(destinations.length);
    }

    var start = destinations.map(function(item) { return item.lat + ',' + item.lng; });
    var end = destinations.map(function(item) { return item.lat + ',' + item.lng; });

    distance.matrix(start, end, function(err, distances) {
        if (err) throw err;
        if (!distances) throw 'No distances';
        else if (distances.status === 'OK') {
            try {
                for (var i = 0; i < start.length; i++) {
                    for (var j = i + 1; j < end.length; j++) {
                        var origin = distances.origin_addresses[i];
                        var destination = distances.destination_addresses[j];
                        if (distances.rows[0].elements[j].status == 'OK') {
                            var distance = distances.rows[i].elements[j].distance.text;
                            //console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance);
                            cost_matrix[i][j] = parseFloat(distance.slice(0, distance.length - 3).split(',').join(''));
                            cost_matrix[j][i] = parseFloat(distance.slice(0, distance.length - 3).split(',').join(''));
                            console.log(cost_matrix[j][i]);
                        } else {
                            cost_matrix[i][j] = 1000;
                            cost_matrix[j][i] = 1000;
                            //throw (destination + ' is not reachable by land from ' + origin);
                        }
                    }

                    cost_matrix[i][i] = 0.01;
                }

                callback(cost_matrix);
            } catch (err) {
                console.log("Cost matrix error: " + err);
                throw err;
            }
        }
    });
}