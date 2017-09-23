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

function add_trip(leader_, destinations_) {
    var code = generate_trip_code();
    var new_trip = { 
        trip_code: code,
        members: [leader_],
        leader: leader_,
        destinations: destinations_,
        current_stop: 0 };
    
    db.collection("trips").insertOne(new_trip, function(err, trip) {
        if (err) throw err;
        console.log("Added new trip: " + trip);
    }
}

function generate_trip_code() {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
}

/**

USERS
    user_id         number (P_KEY)
    email           string not null
    trips           array<trip_id>
    current_trip    trip_id

TRIPS
    trip_id         number (P_KEY)
    trip_code       string?
    members         array<user_id>
    leader          user_id
    destinations    array<array<number>>  // { latitude, longitude, travel_time }
    current_stop    number
    
    
Login:
    Add user to USERS if not exist

Begin trip:
    Add locations to LOCATIONS if not exist
    Save trip info to TRIPS
    
Next destination:
    Query trip destination from TRIPS
    
Arrive:
    Update current_stop in TRIPS
    
Finish:
    Set current_trip to NULL for all members

*/









