var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

require("./game/globals");
var gameInstance = require('./gameHolder.js');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.sendfile('index.html');
});

io.on('connection', function (socket) {
	var playerId = socket.id;


	console.log("connection: " + playerId);
	gameInstance.addPlayer(io, playerId);

	socket.on('moves', function (moves) {
		gameInstance.updateMoves(playerId, moves);
	});

	socket.on('disconnect', function () {
		console.log("disconnect: " + playerId);
		gameInstance.removePlayer(playerId);
	});
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});