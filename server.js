/*************************************
//
// averagelanguageoftwitter app
//
**************************************/

// express magic
require('newrelic');
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
io.set('log level', 0); // reduce logging
var device  = require('express-device');
var twitter = require('./twitter.js');

var currentSummary;

twitter.getTweets(function(updateData){
	console.log('server tweet update');
});


setInterval(function(){
	console.log('getting summary');
	twitter.getSummary(function(summary){
			console.log('summary ',summary.length,' \n ');
			io.sockets.emit('update', summary);
			currentSummary = summary;
	});
}, 5000);



var runningPortNumber = process.env.PORT;

app.configure(function(){
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname +'/views');

	app.use(device.capture());
});


// logs every request
app.use(function(req, res, next){
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});

	// goes onto the next function in line
	next();
});

app.get("/", function(req, res){
	res.render('index', {});
});


io.sockets.on('connection', function (socket) {
	console.log('socket io connected');
	io.sockets.emit('update', currentSummary);

});


server.listen(runningPortNumber);

