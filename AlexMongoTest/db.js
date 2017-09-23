let crypto = require('crypto');
let MongoClient = require('mongodb').MongoClient;
let url = 'mongodb://localhost:27017/mydb';
let db = null;

module.exports = {
    open: function() {
        // Connect to MongoDB.
        MongoClient.connect(url, function(err, db_) {
            if (err) throw err;
            db = db_;
            console.log('db: MongoClient opened');

            // Create index to enforce unique keys.
            db.collection('users').createIndex({ email: 1 }, { unique: true }, function(err, result) {
                if (err) throw err;
                console.log('db: Created unique email index for users collection');
            });

            db.collection('trips').createIndex({ trip_code: 1 }, { unique: true }, function(err, result) {
                if (err) throw err;
                console.log('db: Created unique trip_code index for trips collection');
            });
        });
    },

    // Add user to users collection. No effect if user already exists.
    add_user: function(email_) {
        let query = { email: email_ };
        let new_user = { $set: { email: email_ } };

        db.collection('users').update(query, new_user, {upsert: true}, function(err, res) {
            if (err) throw err;
            console.log('db: Added user ' + email_);
        });
    },

    // Add trip to specified user.
    add_user_trip: function(email_, trip_code_) {
        let query = { email: email_ };
        let update_user = { $addToSet: { trips : trip_code_ } };
        db.collection('users').updateOne(query, update_user, function(err, res) {
            if (err) throw err;
            console.log('db: Added trip to ' + email_);
        });
    },

    // Return and pass user info into supplied callback.
    get_user: function(email_, callback) {
        let query = { email: email_ };
        db.collection('users').findOne(query, function(err, res) {
            if (err) throw err;
            callback(res);
        });
    },

    // Add trip to trips collection.
    add_trip: function(leader_, destinations_) {
        let code = generate_trip_code();
        let new_trip = { 
            trip_code: code,
            members: [leader_],
            leader: leader_,
            destinations: destinations_,
            travel_times: [],               // Will be populated when we determine route
            current_stop: 0
        };
        
        db.collection('trips').insertOne(new_trip, function(err, trip) {
            if (err) throw err;
            console.log('db: Created new trip ' + new_trip['trip_code'] + ' for ' + leader_);
        });
        
        module.exports.add_user_trip(leader_, new_trip['trip_code']);
        return new_trip['trip_code'];
    },

    // Add member to specified trip. No result if member already part of trip.
    add_trip_member: function(trip_code_, email) {
        let query = { trip_code : trip_code_ };
        let update_trip = { $addToSet: { members : email } }
        db.collection('trips').updateOne(query, update_trip, function(err, res) {
            if (err) throw err;
            console.log('db: Added new trip member: ' + email + ' to trip ' + trip_code_);
        });
        
        module.exports.add_user_trip(email, trip_code_);
    },

    // Retrieve and pass trip info into supplied callback.
    get_trip: function(trip_code_, callback) {
        let query = { trip_code: trip_code_ };
        db.collection('trips').findOne(query, function(err, res) {
            if (err) throw err;
            callback(res);
        });
    },

    // Move specified trip current_stop to next destination.
    // Return false if at end of trip. Otherwise, return true.
    check_in: function(trip_code_) {
        let query = { trip_code : trip_code_ };
        let update_trip = { $inc: { current_stop: 1 } };
        db.collection('trips').updateOne(query, update_trip, function(err, res) {
            if (err) throw err;
        });

        db.collection('trips').findOne(query, function(err, trip) {
            if (err) throw err;
            console.log('db: Checked in to trip ' + trip_code_);
            return (trip['current_stop'] >= trip['destinations'].length)
        })
    },

    // Print contents of specified collection.
    print_collection: function(name) {
        db.collection(name).find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log('db: Printing collection ' + name);
            console.log(result);
        });
    },

    // Drop the specified collection.
    drop_collection: function(name) {
        db.collection(name).drop(function(err, res) {
            if (err) throw err;
            console.log('db: Collection ' + name + ' dropped');
        });
    },

    // Close the db.
    close: function() {
        db.close();
        console.log('db: MongoClient closed');
    }
};

// Generate random 6-digit trip code.
function generate_trip_code() {
    let firstPart = (Math.random() * 46656) | 0;
    let secondPart = (Math.random() * 46656) | 0;
    firstPart = ('000' + firstPart.toString(36)).slice(-3);
    secondPart = ('000' + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
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









