var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.collection("customers").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});


function add_user(email_) {
    var new_user = { email: email_, trips: [] };
    db.collection("users").insertOne(new_user, function(err, user) {
        if (err) throw err;
        console.log("Added new user: " + user.email);
    });
}

function add_location(latitude_, longitude_) {
    var new_location = { latitude: latitude_, longitude: longitude_ };
    db.collection("locations").insertOne(new_location, function(err, location) {
        if (err) throw err;
        console.log("Added new location: " + location.latitude + ", " + location.longitude);
    });
}

function add_trip() {
    
}

function generate_trip_code() {
    
}

/**

USERS
    user_id         number (P_KEY)
    email           string not null
    trips           array<number>

TRIPS
    trip_id         number (P_KEY)
    trip_hash       number
    users           array<user_id>
    leader          user_id
    destinations    array<location_id>
    current_stop    number
    
LOCATIONS
    location_id     number (P_KEY)
    latitude        number
    longitude       number

    
Login:
    Add user to USERS if not exist

Begin trip:
    Add locations to LOCATIONS if not exist
    Save trip info to TRIPS
    
Next destination:
    Query trip destination from TRIPS
    
Arrive:
    Update current_stop in TRIPS

*/