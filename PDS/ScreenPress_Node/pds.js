var express = require('express'), app = express(), http = require('http'), server = http.createServer(app), io = require('socket.io').listen(server), request = require("request");

server.listen(5000);

// Sample url : http://hostname/WordPressfolder/
var mainUrl = "http://localhost/WordPressfolder/";

// Array difference
function arr_diff(a1, a2) {
	var a = [], diff = [];
	for (var i = 0; i < a1.length; i++)
		a[a1[i]] = true;
	for (var i = 0; i < a2.length; i++)
		if (a[a2[i]])
			delete a[a2[i]];
		else
			a[a2[i]] = true;
	for (var k in a)
	diff.push(k);
	return diff;
}

// text shorter
String.prototype.trunc = String.prototype.trunc ||
function(n) {
	return this.length > n ? this.substr(0, n - 1) + '...' : this;
};

// routing

// a convenient variable to refer to the HTML directory
var html_dir = './';

// routes to serve the static HTML files
app.get('/simulator', function(req, res) {
	res.sendfile(html_dir + 'simulator.html');
});

app.get('/display', function(req, res) {
	res.sendfile(html_dir + 'display.html');
});

// displaynames and simulators which are currently connected to the chat
var displaynames = {};
var simulators = {};
// display collection length
var displayColLength = {};
// display image collection
var displayImages = {};
// rooms which are currently available in chat
var rooms = ['room1', 'room2', 'room3'];

//Retrieving the user data
function userRetriver(userId) {

	request({
		url : mainUrl + "wp-content/themes/twentyfourteen/pds.php?ptype=users&userId=" + userId,
		json : true
	}, function(error, response, body) {
		// console.log(111);
		if (!error && response.statusCode === 200) {
			// console.log(222);
			if ( typeof body === 'object') {
				// console.log(333);
				var count = Object.keys(body).length;
				// console.log(body);
				//console.log(count);

				if (count != 0) {
					io.sockets.emit('userProfile', body);
					console.log("Profile data is sent");
				}
			}
		}
	});
}

//Retrieving new data based on the changes on the zones
function curationRetriver(zones) {

	request({
		url : mainUrl + "wp-content/themes/twentyfourteen/pds.php?ptype=curation&zones=" + zones,
		json : true
	}, function(error, response, body) {
		// console.log(111);
		if (!error && response.statusCode === 200) {
			// console.log(222);
			// console.log(body);
			if ( typeof body === 'object') {
				// console.log(333);
				 console.log(body);
				var count = Object.keys(body).length;
				// console.log(body);
				//console.log(count);

				if (count != 0) {
					io.sockets.emit('displayData', body);
					console.log("Display data is sent");
				}
			}
		}
	});
}

io.sockets.on('connection', function(socket) {

	// when the client emits 'adddisplay', this listens and executes
	socket.on('addsimulator', function(simulator) {
		// store the displayname in the socket session for this client
		socket.simulator = simulator;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's simulator to the global list
		simulators[socket.id] = simulator;
		// send client to room 1
		socket.join('room1');

		console.log(1);

	});

	// when the client emits 'adddisplay', this listens and executes
	socket.on('adddisplay', function(displayname) {
		// store the displayname in the socket session for this client
		socket.displayname = displayname;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's displayname to the global list
		displaynames[socket.id] = displayname;
		// send client to room 1
		socket.join('room1');

		io.sockets.emit('updatedisplays', displaynames);
		// wallRetriver(displayname);
		console.log(1);

	});

	socket.on('addUser', function(tUser) {
		console.log(tUser);
		userRetriver(tUser);
	});

	socket.on('updateZones', function(zones) {

		curationRetriver(zones);
		console.log(zones);
	});

	// when the display disconnects.. perform this
	socket.on('disconnect', function() {
		if (socket.displayname) {
			// remove the displayname from global displaynames list
			delete displaynames[socket.id];
			delete displayColLength[socket.id];
			// update list of displays in chat, client-side

			io.sockets.emit('updatedisplays', displaynames);
			// echo globally that this client has left

			socket.leave(socket.room);
		}
		if (socket.simulator) {
			// remove the displayname from global displaynames list
			delete simulators[socket.id];
			delete displayColLength[socket.id];
			// update list of displays in chat, client-side

			io.sockets.emit('updatedisplays', simulators);
			// echo globally that this client has left

			socket.leave(socket.room);
		}
	});
});
