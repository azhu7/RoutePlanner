let route = require('../js/route_compute.js');
let dest = require('../js/utility.js').dest;
let db = require('../js/db.js');
let lyft = require('node-lyft');
let defaultClient = lyft.ApiClient.instance;
let CLIENTID = 'tXFXVn2qRVUf19Q1itJzRnCbm+ymnZGxusevwd+KFdMH0emtHEdt+2c5EWkXbT/NPu346Bg6ym2wEtXDgTGuCbCzCunEJCbTwza7r3QzWAYLlwTLReaEAUo=';


// Configure OAuth2 access token for authorization: Client Authentication
let clientAuth = defaultClient.authentications['Client Authentication'];
clientAuth.accessToken = CLIENTID;
let apiInstance = new lyft.PublicApi();


/* exports json objects */

exports.lyftestimate = function(req, res) {
    let destinations = req.body;
    let est_cost_cents_min = 0;
    let est_cost_cents_max = 0;
    let est_time_hours = 0;
    let est_dist_miles = 0;
    let asynCalls = [];

    for (let i = 0; i < destinations.length - 1; ++i) {
        start = destinations[i]['geometry']['location'];
        end = destinations[i + 1]['geometry']['location'];

        let opts = { 
            'endLat': end.lat, // Latitude of the ending location
            'endLng': end.lng // Longitude of the ending location
        };

        asynCalls.push(apiInstance.getCost(start.lat, start.lng, opts));
    }

    Promise.all(asynCalls)
        .then((data) => {
            let num_valid_data = 0;
            for (let i = 0; i < data.length; ++i) {
                let d = data[i]["cost_estimates"];

                if (d.length != 0) {
                    num_valid_data++;
                }

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

            if (num_valid_data < destinations.length - 1) {
                // Bad request if any pair is too far to Lyft
                res.sendStatus(400);
            }
            else {
                res.json({
                    estimate: {
                        est_cost_cents_min: est_cost_cents_min/100,
                        est_cost_cents_max: est_cost_cents_max/100,
                        est_time_hours: est_time_hours/3600,
                        est_dist_miles: est_dist_miles
                    }
                });
            }
        })
        .catch((e) => {
            console.log("error getting ride estimates");
            res.sendStatus(400);
        });
}

exports.lyftride_type = function(req, res) {
    console.log(req.body);
    apiInstance.getRideTypes(dest.lat, dest.lng).then((data) => {
        let types = [];
        ride_types = data["ride_types"];
        for (let i = 0; i < ride_types.length; ++i) {
            let ride_type = ride_types[i]["ride_type"];

            // universal links currenly allow only lyft and lyft_plus ride_types
            if (ride_type === "lyft" || ride_type === "lyft_plus") {
                types.push(ride_type);
            }
        }

        res.send(types);
    }, (error) => {
        console.log("error getting ride types");
        res.sendStatus(400);
    });
}

exports.lyftuniversal_link = function(req, res) {
    let ride_type = req.body["ride_type"];
    let start_lat = req.body["start_lat"];
    let start_lng = req.body["start_lng"];
    let end_lat = req.body["end_lat"];
    let end_lng = req.body["end_lng"];

    if (ride_type !== "lyft" || ride_type !== "lyft_plus") {
        console.log("incorrect ride type for lyft link");
        res.sendStatus(400);
    }

    let link = "https://lyft.com/ride?id=" + ride_type + "&pickup[latitude]=" + start_lat + "&pickup[longitude]=" + start_lng + "&partner=" + CLIENTID + "&destination[latitude]=" + end_lat + "&destination[longitude]=" + end_lng;

    res.send(link);
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

exports.starttrip = function(req, res) {
    console.log(req.body);

    let leader = req.body['user'];
    let destinations = req.body['path'];

    let trip_code = db.add_trip(leader, destinations);
    res.json({ trip_code: trip_code });
}

exports.gettripinfo = function(req, res) {
    let trip_code = req.body['trip_code'];
    console.log(trip_code);
    db.get_trip(trip_code, function(trip) {
        res.json(trip);
    });
}