let route = require('../js/route_compute.js');
let dest = require('../js/utility.js').dest;

route.optimal_route([new dest(37, -121, "d1"), new dest(37.1, -122, "d2"), new dest(37.0250, -122, "d3"), new dest(37.2, -122, "d4")], false, function(result) {
    console.log("OPTIMAL:");
    console.log(result);
});

route.worst_route([new dest(37, -121, "d1"), new dest(37.1, -122, "d2"), new dest(37.0250, -122, "d3"), new dest(37.2, -122, "d4")], false, function(result) {
    console.log("WORST:");
    console.log(result);
});

for (let i = 0; i < 3; i++) {
	route.random_route([[0, 0, "d1"], [1, 1, "d2"], [2, 2, "d3"]], function(result) {
		console.log("RANDOM:");
	    console.log(result);
	});
}