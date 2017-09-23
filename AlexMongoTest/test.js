var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/mydb';
var db;

MongoClient.connect(url, function(err, db_) {
    if (err) throw err;
    db = db_;
});

function add_user(email_) {
    var new_user = { email: email_, trips: [] };
    db.collection('users').insertOne(new_user, function(err, user) {
        if (err) throw err;
        console.log('Added new user: ' + email_);
    });
}

function add_user_trip(email_, trip_code_) {
    var query = { email: email_ };
    var update_trip = { $addToSet: { trips : trip_code_ } };
    db.collection('users').updateOne(query, update_trip, function(err, res) {
        if (err) throw err;
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
    
    db.collection('trips').insertOne(new_trip, function(err, trip) {
        if (err) throw err;
        console.log('Added new trip for ' + leader_);
    });
    
    add_user_trip(leader_, new_trip['trip_code']);
}

function add_trip_member(trip_code_, email) {
    var query = { trip_code : trip_code_ };
    var new_member = { $addToSet: { members : email } }
    db.collection('trips').updateOne(query, new_member, function(err, res) {
        if (err) throw err;
        console.log('Added new trip member: ' + email + ' to trip ' + trip_code_);
    });
    
    add_user_trip(email, trip_code_);
}

function generate_trip_code() {
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ('000' + firstPart.toString(36)).slice(-3);
    secondPart = ('000' + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

function print_table(name) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection(name).find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
      });
    });
}

setTimeout(function() {
    add_user('alex@');
    add_user('albert@');
    add_user('lingene@');
    add_user('jerry@');
    add_trip('alex@', ['d1', 'd2', 'd3']);
    add_trip('albert@', ['d4', 'd5', 'd6']);
    db.collection('trips').findOne({ leader: 'alex@' }, (function(err, result) {
        if (err) throw err;
        add_trip_member(result['trip_code'], 'lingene@');
        add_trip_member(result['trip_code'], 'lingene@');
        add_trip_member(result['trip_code'], 'jerry@');
    }));
    
    db.collection('trips').findOne({ leader: 'albert@' }, (function(err, result) {
        if (err) throw err;
        add_trip_member(result['trip_code'], 'alex@');
        add_trip_member(result['trip_code'], 'lingene@');
    }));
}, 1000);

setTimeout(function() {
    print_table('users');
    print_table('trips');
}, 3000);

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

setTimeout(function() {
    db.close();
}, 7000);

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









