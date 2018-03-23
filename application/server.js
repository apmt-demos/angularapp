// set up ======================================================================
var express = require('express');
var app = express(); 			
//var mongoose = require('mongoose'); 			
var port = process.env.PORT || 3000; 			
var database = require('./config/database'); 		
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');


// configuration ===============================================================
//mongoose.connect(database.remoteUrl, { useMongoClient: true }); 
app.use(express.static('./public')); 	
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request


// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
