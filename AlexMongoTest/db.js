var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/mydb';
var db;

// Connect to MongoDB.
MongoClient.connect(url, function(err, db_) {
    if (err) throw err;
    db = db_;
});

// Add user to users collection. No effect if user already exists.
function add_user(email_) {
    var query = { email: email_ };
    var new_user = { $set: { email: email_ } };

    db.collection('users').update(query, new_user, {upsert: true}, function(err, res) {
        if (err) throw err;
        console.log('res: ' + res);
        console.log('Added user ' + email_);
    });
}

// Add trip to specified user.
function add_user_trip(email_, trip_code_) {
    var query = { email: email_ };
    var update_user = { $addToSet: { trips : trip_code_ } };
    db.collection('users').updateOne(query, update_user, function(err, res) {
        if (err) throw err;
    });
}

// Return and pass user info into supplied callback.
function get_user(email_, callback) {
    var query = { email: email_ };
    db.collection('users').findOne(query, function(err, res) {
        if (err) throw err;
        callback(res);
    });
}

// Add trip to trips collection.
function add_trip(leader_, destinations_) {
    var code = generate_trip_code();
    var new_trip = { 
        trip_code: code,
        members: [leader_],
        leader: leader_,
        destinations: destinations_,
        travel_times: [],               // Will be populated when we determine route
        current_stop: 0 };
    
    db.collection('trips').insertOne(new_trip, function(err, trip) {
        if (err) throw err;
        console.log('Added new trip for ' + leader_);
    });
    
    add_user_trip(leader_, new_trip['trip_code']);
    return new_trip['trip_code'];
}

// Add member to specified trip. No result if member already part of trip.
function add_trip_member(trip_code_, email) {
    var query = { trip_code : trip_code_ };
    var update_trip = { $addToSet: { members : email } }
    db.collection('trips').updateOne(query, update_trip, function(err, res) {
        if (err) throw err;
        console.log('Added new trip member: ' + email + ' to trip ' + trip_code_);
    });
    
    add_user_trip(email, trip_code_);
}

// Retrieve and pass trip info into supplied callback.
function get_trip(trip_code_, callback) {
    var query = { trip_code: trip_code_ };
    db.collection('trips').findOne(query, function(err, res) {
        if (err) throw err;
        callback(res);
    });
}

// Generate random 6-digit trip code.
function generate_trip_code() {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ('000' + firstPart.toString(36)).slice(-3);
    secondPart = ('000' + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

// Move specified trip current_stop to next destination.
// Return false if at end of trip. Otherwise, return true.
function check_in(trip_code_) {
    var query = { trip_code : trip_code_ };
    var update_trip = { $inc: { current_stop: 1 } };
    db.collection('trips').updateOne(query, update_trip, function(err, res) {
        if (err) throw err;
    });

    db.collection('trips').findOne(query, function(err, trip) {
        if (err) throw err;
        return (trip['current_stop'] >= trip['destinations'].length)
    })
}

// Print contents of specified collection.
function print_table(name) {
    db.collection(name).find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
    });
}

function basic_test() {
    // Create index to enforce unique keys.
    setTimeout(function() {
        db.collection("users").createIndex({ email: 1 }, { unique: true }, function(err, result) {
            if (err) throw err;
            console.log("Created unique email index for users collection");
        });

        db.collection("trips").createIndex({ trip_code: 1 }, { unique: true }, function(err, result) {
            if (err) throw err;
            console.log("Created unique trip_code index for trips collection");
        });
    }, 1000);

    // Add users, trips, and members.
    setTimeout(function() {
        add_user('alex@');
        add_user('albert@');
        add_user('lingene@');
        add_user('jerry@');

        var alex_trip_code = add_trip('alex@', [[0, 0, "d0"], [1, 1, "d1"], [2, 2, "d2"]]);
        var albert_trip_code = add_trip('albert@', [[3, 3, "d3"], [4, 4, "d4"], [5, 5, "d5"]]);

        add_trip_member(alex_trip_code, 'lingene@');
        add_trip_member(alex_trip_code, 'lingene@');  // Should not insert this
        add_trip_member(alex_trip_code, 'jerry@');
        add_trip_member(albert_trip_code, 'alex@');
        add_trip_member(albert_trip_code, 'lingene@');
    }, 2000);


    // Print information.
    setTimeout(function() {
        add_user('alex@');  // Should not insert this, should not reset element 'alex@'

        // Print albert's info and albert's trip's info
        get_user('albert@', function(user) {
            console.log(user);
            get_trip(user['trips'][0], function(trip) {
                console.log(trip);
            })
        });

        print_table('users');
        print_table('trips');
    }, 3000);

    // Delete collections.
    setTimeout(function() {
        db.collection('users').drop(function(err, result) {
            if (err) throw err;
            if (result) console.log('Users collection deleted');
        });
        
        db.collection('trips').drop(function(err, result) {
            if (err) throw err;
            if (result) console.log('Trips collection deleted');
        });
    }, 5000);

    // Close MongoClient
    setTimeout(function() {
        db.close();
    }, 7000);
}

basic_test();

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
    destinations    array<array<number>>  // { latitude, longitude, address }
    travel_times    array<number>         // correponds to destinations
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









