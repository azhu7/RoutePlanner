/**
db_tests.js
Test class demonstrating basic db functionalities.
*/

let db = require('../js/db.js');
let dest = require('../js/utility.js').dest;

let test_user_collection_name = 'users';
let test_trip_collection_name = 'trips';

function basic_test() {
    db.open(test_user_collection_name, test_trip_collection_name);

    let ann_arbor = new dest(42.2808, -83.7430, 'Ann Arbor');
    let detroit = new dest(42.3314, -83.0458, 'Detroit');
    let canton = new dest(42.3086, -83.4821, 'Canton');
    let dearborn = new dest(42.3223, -83.1763, 'Dearborn');
    let rochester = new dest(42.6806, -83.1338, 'Rochester');
    let novi = new dest(42.4806, -83.4755, 'Novi');

    setTimeout(function() {
        db.drop_collection(test_user_collection_name);
        db.drop_collection(test_trip_collection_name);
    }, 500)

    setTimeout(function() {
        db.close();
    }, 1000)

    setTimeout(function() {
        db.open(test_user_collection_name, test_trip_collection_name);
    }, 1500)

    // Add users, trips, and members.
    setTimeout(function() {
        db.add_user('alex@umich.edu', '111-111-1111', test_user_collection_name);
        db.add_user('albert@umich.edu', '222-222-2222', test_user_collection_name);
        db.add_user('lingene@umich.edu', '333-333-3333', test_user_collection_name);
        db.add_user('jerry@umich.edu', '444-444-4444', test_user_collection_name);

        let alex_trip_code = db.add_trip(
            'alex@umich.edu', 
            [ann_arbor, detroit, canton],
            test_user_collection_name,
            test_trip_collection_name
        );
        let albert_trip_code = db.add_trip(
            'albert@umich.edu',
            [dearborn, rochester, novi],
            test_user_collection_name,
            test_trip_collection_name
        );

        db.add_trip_member(alex_trip_code, 'lingene@umich.edu', test_user_collection_name, test_trip_collection_name);
        db.add_trip_member(alex_trip_code, 'lingene@umich.edu', test_user_collection_name, test_trip_collection_name);  // Should not insert this
        db.add_trip_member(alex_trip_code, 'jerry@umich.edu', test_user_collection_name, test_trip_collection_name);
        db.add_trip_member(albert_trip_code, 'alex@umich.edu', test_user_collection_name, test_trip_collection_name);
        db.add_trip_member(albert_trip_code, 'lingene@umich.edu', test_user_collection_name, test_trip_collection_name);

        //db.check_in(alex_trip_code, detroit, function(_) {}, test_trip_collection_name);
        //db.check_in(alex_trip_code, canton, function(_) {}, test_trip_collection_name);
        //db.check_in(albert_trip_code, novi, function(_) {}, test_trip_collection_name);
    }, 2000);

    // Print information.
    setTimeout(function() {
        db.add_user('alex@umich.edu', test_user_collection_name);  // Should not insert this, should not reset element 'alex@'

        // Print albert's info and albert's trip's info
        db.get_user('albert@umich.edu', function(user) {
            console.log(user);
            db.get_trip(user['trips'][0], function(trip) {
                console.log(trip);
            }, test_trip_collection_name)
        }, test_user_collection_name);

        db.print_collection(test_user_collection_name);
        db.print_collection(test_trip_collection_name);
    }, 3000);

    // Close MongoClient
    setTimeout(function() {
        db.close();
    }, 5000);
}

basic_test();
