let db = require('./db.js');

function basic_test() {
    db.open();
    
    // Add users, trips, and members.
    setTimeout(function() {
        db.add_user('alex@');
        db.add_user('albert@');
        db.add_user('lingene@');
        db.add_user('jerry@');

        let alex_trip_code = db.add_trip('alex@', [[0, 0, 'd0'], [1, 1, 'd1'], [2, 2, 'd2']]);
        let albert_trip_code = db.add_trip('albert@', [[3, 3, 'd3'], [4, 4, 'd4'], [5, 5, 'd5']]);

        db.add_trip_member(alex_trip_code, 'lingene@');
        db.add_trip_member(alex_trip_code, 'lingene@');  // Should not insert this
        db.add_trip_member(alex_trip_code, 'jerry@');
        db.add_trip_member(albert_trip_code, 'alex@');
        db.add_trip_member(albert_trip_code, 'lingene@');

        db.check_in(alex_trip_code);
        db.check_in(alex_trip_code);
        db.check_in(albert_trip_code);
    }, 2000);


    // Print information.
    setTimeout(function() {
        db.add_user('alex@');  // Should not insert this, should not reset element 'alex@'

        // Print albert's info and albert's trip's info
        db.get_user('albert@', function(user) {
            console.log(user);
            db.get_trip(user['trips'][0], function(trip) {
                console.log(trip);
            })
        });

        db.print_collection('users');
        db.print_collection('trips');
    }, 3000);

    // Delete collections.
    setTimeout(function() {
        db.drop_collection('users');
        db.drop_collection('trips');
    }, 5000);

    // Close MongoClient
    setTimeout(function() {
        db.close();
    }, 7000);
}

basic_test();