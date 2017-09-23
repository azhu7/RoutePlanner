let lyft = require('node-lyft');
let defaultClient = lyft.ApiClient.instance;

// Configure OAuth2 access token for authorization: Client Authentication
let clientAuth = defaultClient.authentications['Client Authentication'];
clientAuth.accessToken = 'tXFXVn2qRVUf19Q1itJzRnCbm+ymnZGxusevwd+KFdMH0emtHEdt+2c5EWkXbT/NPu346Bg6ym2wEtXDgTGuCbCzCunEJCbTwza7r3QzWAYLlwTLReaEAUo=';

let apiInstance = new lyft.PublicApi();

function dest(lat, lng, address) {
    this.lat = lat;
    this.lng = lng;
    this.address = address;
}

function estimate(min_price, max_price, time, miles) {
    this.min_price = min_price;
    this.max_price = max_price;
    this.time = time,
    this.miles = miles;
}

// takes in array of dest objects, calculates estimates using ride_type lyft
function getRideEstimate(destinations) {
    let est_cost_cents_min = 0;
    let est_cost_cents_max = 0;
    let est_time_seconds = 0;
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
                    est_time_seconds += estimate["estimated_duration_seconds"];
                    est_dist_miles += estimate["estimated_distance_miles"];
                }
            }
            let obj = new estimate(est_cost_cents_min/100, est_cost_cents_max/100, est_time_seconds/3600, est_dist_miles);
            console.log(obj);
            return obj;
        })
        .catch((e) => {
            throw e;
        });
}

/* Test Case */
// let d1 = new dest(37.7763, -122.3918, "blah");
// let d2 = new dest(37.7721, -122.4533, "blah");
// let d3 = new dest(37.2341, -122.1029, "blah");
// let d4 = new dest(37.2352, -122.1032, "blah");
// let arr = [d1, d2, d3, d4];
// getRideEstimate(arr);
