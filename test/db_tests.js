/**
db_tests.js
Test class demonstrating basic db functionalities.
*/

let db = require('../js/db.js');
let dest = require('../js/utility.js').dest;

let test_user_collection_name = 'users_test';
let test_trip_collection_name = 'trips_test';

function basic_test() {
    db.open(test_user_collection_name, test_trip_collection_name);

    // Add users, trips, and members.
    setTimeout(function() {
        db.add_user('alex@', '111-111-1111', test_user_collection_name);
        db.add_user('albert@', '222-222-2222', test_user_collection_name);
        db.add_user('lingene@', '333-333-3333', test_user_collection_name);
        db.add_user('jerry@', '444-444-4444', test_user_collection_name);

        let alex_trip_code = db.add_trip('alex@', [new dest(0, 0, 'd0'), new dest(1, 1, 'd1'), new dest(2, 2, 'd2')], test_user_collection_name, test_trip_collection_name);
        let albert_trip_code = db.add_trip('albert@', [new dest(3, 3, 'd3'), new dest(4, 4, 'd4'), new dest(5, 5, 'd5')], test_user_collection_name, test_trip_collection_name);

        db.add_trip_member(alex_trip_code, 'lingene@', test_user_collection_name, test_trip_collection_name);
        db.add_trip_member(alex_trip_code, 'lingene@', test_user_collection_name, test_trip_collection_name);  // Should not insert this
        db.add_trip_member(alex_trip_code, 'jerry@', test_user_collection_name, test_trip_collection_name);
        db.add_trip_member(albert_trip_code, 'alex@', test_user_collection_name, test_trip_collection_name);
        db.add_trip_member(albert_trip_code, 'lingene@', test_user_collection_name, test_trip_collection_name);

        db.check_in(alex_trip_code, new dest(0, 0, 'd0'), test_trip_collection_name);
        db.check_in(alex_trip_code, new dest(2, 2, 'd2'), test_trip_collection_name);
        db.check_in(albert_trip_code, new dest(5, 5, 'd5'), test_trip_collection_name);
    }, 2000);

    // Print information.
    setTimeout(function() {
        db.add_user('alex@', test_user_collection_name);  // Should not insert this, should not reset element 'alex@'

        // Print albert's info and albert's trip's info
        db.get_user('albert@', function(user) {
            console.log(user);
            db.get_trip(user['trips'][0], function(trip) {
                console.log(trip);
            }, test_trip_collection_name)
        }, test_user_collection_name);

        db.print_collection(test_user_collection_name);
        db.print_collection(test_trip_collection_name);
    }, 3000);

    // Delete collections.
    setTimeout(function() {
        db.drop_collection(test_user_collection_name);
        db.drop_collection(test_trip_collection_name);
    }, 5000);

    // Close MongoClient
    setTimeout(function() {
        db.close();
    }, 7000);
}

basic_test();