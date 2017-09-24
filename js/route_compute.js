/**
route_compute.js
Set of functions for computing various routes, given an array of destinations
*/

let solver = require('node-tspsolver');
let estimator = require('./lyft.js');
let dest = require('./utility.js').dest;
let distance = require('google-distance-matrix');
distance.key('AIzaSyDXlg2yAdgUtISR7VqeNUkH6LjehNaszaQ');
distance.units('imperial');

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
            for (var i = 0; i < start.length; i++) {
                for (var j = i + 1; j < end.length; j++) {
                    var origin = distances.origin_addresses[i];
                    var destination = distances.destination_addresses[j];
                    if (distances.rows[0].elements[j].status == 'OK') {
                        var distance = distances.rows[i].elements[j].distance.text;
                        //console.log('Distance from ' + origin + ' to ' + destination + ' is ' + distance);
                        cost_matrix[i][j] = parseFloat(distance.slice(0, distance.length - 3));
                        cost_matrix[j][i] = parseFloat(distance.slice(0, distance.length - 3));
                    } else {
                        throw (destination + ' is not reachable by land from ' + origin);
                    }
                }

                cost_matrix[i][i] = 0.01;
            }

            callback(cost_matrix);
        }
    });
}

function optimal_route(destinations, round_trip, callback) {
    get_cost_matrix(destinations, function(cost_matrix) {
        for (let i = 0; i < cost_matrix.length; i++) {
            console.log(cost_matrix[i]);
        }

        tsp(destinations, cost_matrix, round_trip, callback);
    });
}

function worst_route(destinations, round_trip, callback) {
    get_cost_matrix(destinations, function(cost_matrix) {
        //Invert to make "best" paths "worst" and vice versa
        for (let i = 0; i < cost_matrix.length; i++) {
            for (let j = 0; j < cost_matrix.length; j++) {
                cost_matrix[i][j] = 100 / cost_matrix[i][j];
            }
        }

        for (let i = 0; i < cost_matrix.length; i++) {
            console.log(cost_matrix[i]);
        }

        tsp(destinations, cost_matrix, round_trip, callback);
    });
}

function tsp(destinations, cost_matrix, round_trip, callback) {
    solver
        .solveTsp(cost_matrix, round_trip, {})
        .then(function(result) {
            callback(result.map(function(idx) { return destinations[idx]; }));
        });
}

function random_route(destinations, callback) {
    let counter = destinations.length;

    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = destinations[counter];
        destinations[counter] = destinations[index];
        destinations[index] = temp;
    }

    callback(destinations);
}

optimal_route([new dest(37, -121, "d1"), new dest(37.1, -122, "d2"), new dest(37.0250, -122, "d3"), new dest(37.2, -122, "d4")], false, function(result) {
    console.log("OPTIMAL:");
    console.log(result);
});

worst_route([new dest(37, -121, "d1"), new dest(37.1, -122, "d2"), new dest(37.0250, -122, "d3"), new dest(37.2, -122, "d4")], false, function(result) {
    console.log("WORST:");
    console.log(result);
});

// random_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], function(result) {
//     console.log(result);
// });

// random_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], function(result) {
//     console.log(result);
// });

// random_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], function(result) {
//     console.log(result);
// });
