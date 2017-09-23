var solver = require('node-tspsolver');

// Given two destinations ([latitude, longitude, address]), 
// return the cost to travel from start to end.
function get_cost(start, end) {
    return 1;
}

// Given an array of destinations ([latitude, longitude, address]), 
// return a matrix of costs.
function get_cost_matrix(destinations) {
    var costs = new Array(destinations.length);
    for (var i = 0; i < costs.length; i++) {
        costs[i] = new Array(destinations.length);
    }

    for (var start = 0; start < destinations.length; start++) {
        costs[start][start] = 0;  // Costs nothing to travel to itself
        for (var end = start + 1; end < destinations.length; end++) {
            var cost = get_cost(destinations[start], destinations[end]);
            costs[start][end] = cost;
            costs[end][start] = cost;
        }
    }

    for (var i = 0; i < costs.length; i++) {
        for (var j = 0; j < costs.length; j++) {
            console.log(costs[i][j] + ' ');
        }
        console.log('\n');
    }

    return costs;
}

function tsp(destinations, round_trip, callback) {
    solver
        .solveTsp(get_cost_matrix(destinations), round_trip, {})
        .then(function(result) {
            callback(result);
        });
}

tsp([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], true, function(result) {
    console.log(result);
});