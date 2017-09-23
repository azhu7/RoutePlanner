/**
route_compute.js
Set of functions for computing various routes, given an array of destinations ([latitude, longitude, address])
*/

let solver = require('node-tspsolver');

// Given two destinations ([latitude, longitude, address]), 
// return the cost to travel from start to end.
function get_cost(start, end) {
    return 1;
}

// Given an array of destinations ([latitude, longitude, address]), 
// return a matrix of costs.
function get_cost_matrix(destinations) {
    let costs = new Array(destinations.length);
    for (let i = 0; i < costs.length; i++) {
        costs[i] = new Array(destinations.length);
    }

    for (let start = 0; start < destinations.length; start++) {
        costs[start][start] = 0;  // Costs nothing to travel to itself
        for (let end = start + 1; end < destinations.length; end++) {
            let cost = get_cost(destinations[start], destinations[end]);
            costs[start][end] = cost;
            costs[end][start] = cost;
        }
    }

    for (let i = 0; i < costs.length; i++) {
        for (let j = 0; j < costs.length; j++) {
            console.log(costs[i][j] + ' ');
        }
        console.log('\n');
    }

    return costs;
}

function optimal_route(destinations, round_trip, callback) {
    solver
        .solveTsp(get_cost_matrix(destinations), round_trip, {})
        .then(function(result) {
            callback(result);
        });
}

function worst_route(destinations, round_trip, callback) {
    let costs = get_cost_matrix(destinations);

    // Invert to make "best" paths "worst" and vice versa
    for (let i = 0; i < costs.length; i++) {
        for (let j = 0; j < costs.length; j++) {
            costs[i][j] *= -1;
        }
    }

    solver
        .solveTsp(costs, round_trip, {})
        .then(function(result) {
            callback(result);
        })
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

optimal_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], true, function(result) {
    console.log(result);
});

worst_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], true, function(result) {
    console.log(result);
});

random_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], function(result) {
    console.log(result);
});

random_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], function(result) {
    console.log(result);
});

random_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], function(result) {
    console.log(result);
});

