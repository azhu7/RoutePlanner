let route = require('../js/route_compute.js');
let dest = require('../js/utility.js').dest;
let lyft = require('node-lyft');
let defaultClient = lyft.ApiClient.instance;


// Configure OAuth2 access token for authorization: Client Authentication
let clientAuth = defaultClient.authentications['Client Authentication'];
clientAuth.accessToken = 'tXFXVn2qRVUf19Q1itJzRnCbm+ymnZGxusevwd+KFdMH0emtHEdt+2c5EWkXbT/NPu346Bg6ym2wEtXDgTGuCbCzCunEJCbTwza7r3QzWAYLlwTLReaEAUo=';
let apiInstance = new lyft.PublicApi();


/* exports json objects */

exports.lyftestimate = function(req, res) {
    let destinations = req.body.destinations;
    let est_cost_cents_min = 0;
    let est_cost_cents_max = 0;
    let est_time_hours = 0;
    let est_dist_miles = 0;
    let asynCalls = [];

    for (let i = 0; i < destinations.length - 1; ++i) {
        start = destinations[i];
        end = destinations[i + 1];

        let opts = { 
            'endLat': end.lat, // Latitude of the ending location
            'endLng': end.lng // Longitude of the ending location
        };

        asynCalls.push(apiInstance.getCost(start.lat, start.lng, opts));
    }

    Promise.all(asynCalls)
        .then((data) => {
            for (let i = 0; i < data.length; ++i) {
                let d = data[i]["cost_estimates"];
                for (let j = 0; j < d.length; ++j) {
                    let estimate = d[j];
                    if (estimate["ride_type"] !== "lyft") {
                        continue;
                    }
                    est_cost_cents_min += estimate["estimated_cost_cents_min"];
                    est_cost_cents_max += estimate["estimated_cost_cents_max"];
                    est_time_hours += estimate["estimated_duration_seconds"];
                    est_dist_miles += estimate["estimated_distance_miles"];
                }
            }

            res.json({
                estimate: {
                    est_cost_cents_min: est_cost_cents_min/100,
                    est_cost_cents_max: est_cost_cents_max/100,
                    est_time_hours: est_time_hours/3600,
                    est_dist_miles: est_dist_miles
                }
            });
        })
        .catch((e) => {
            res.json(400);
        });
}

exports.lyftride_type = function(req, res) {
    console.log('hello');
	res.json({hello: "world"});
}

exports.generatepath = function(req, res, next) {
    let destinations = [];
    for (let i = 0; i < req.body[0].length; ++i) {
        let location = req.body[0][i]['geometry']['location'];
        destinations.push(new dest(location['lat'], location['lng'], req.body[0][i]['formatted_address']));
    }

    switch (req.body[1]) {
        case 'optimal':
            route.optimal_route(destinations, true, function(ordering) {
                res.send(ordering.map(function(idx) { return destinations[idx]; }));
            });
            break;
        case 'random':
            route.random_route(destinations, true, function(ordering) {
                res.send(ordering);
            });
            break;
        case 'worst':
            route.worst_route(destinations, true, function(ordering) {
                res.send(ordering.map(function(idx) { return destinations[idx]; }));
            });
            break;
        case 'priority':
            res.send(destinations);
            break;
    }
}
