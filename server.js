// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)


// configuration =================
var db = require('./AlexMongoTest/db.js')
db.open();
// mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io

app.use(express.static(__dirname));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
// app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

app.post('/login',function(req,res,next) {
    console.log("")
    db.add_user(req.body.email)
    db.print_collection("users")
    console.log("req.query: ",req.body);
    res.json(200);
})

app.get('*',function(req,res) {
    res.sendFile( __dirname + '/index.html');
})


// listen (start app with node server.js) ======================================
app.listen(8080);

console.log("App listening on port 8080");
