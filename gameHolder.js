var gameCreator = require('./game/gameCreator');

var GameHolder = function GameHolder(io) {
	this.io = io;
	this.players = 0;
	this.game = gameCreator.create(this);
};

GameHolder.prototype.addPlayer = function (playerId) {
	this.players++;
	if (this.players === 1) {
		this.startGame();
	}
	this.game.addPlayer(playerId);
};

GameHolder.prototype.removePlayer = function (playerId) {
	this.players--;
	//this.game.removePlayer(playerId);
};

GameHolder.prototype.startGame = function () {
	console.log("Start GameHolder!");
	this.game.start();
};

GameHolder.prototype.updatePosition = function (playerId, position) {
	this.playerPositionMap[playerId] = position;
};

GameHolder.prototype.sendGame = function (game) {
	//var gameJson = JSON.stringify(game);
	var gameJson = game.toJson();
	var jsonString = JSON.stringify(gameJson);
	//console.log(jsonString);
	this.io.emit('update', jsonString);
	//console.asdfasdfsadf();
};

var gameHolder;

var action = function () {
	console.log("omg action");
};

var addPlayer = function (io, playerId) {
	if (gameHolder === undefined) {
		gameHolder = new GameHolder(io);
	}
	gameHolder.addPlayer(playerId);
};

var removePlayer = function (playerId) {
	gameHolder.removePlayer(playerId);
	if (gameHolder.players === 0) {
		console.log("stopping game");
		gameHolder = undefined;
	}
};

var updatePosition = function (playerId) {
	gameHolder.removePlayer(playerId);

};


exports.action = action;
exports.addPlayer = addPlayer;
exports.removePlayer = removePlayer;
exports.updatePosition = updatePosition;