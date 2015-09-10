var gameCreator = require('./game/gameCreator');

var GameHolder = function GameHolder(io) {
	this.io = io;
	this.players = [];
	this.playerCount = 0;
	this.game = gameCreator.create(this);
};

GameHolder.prototype.addPlayer = function (playerId) {
	this.playerCount++;
	this.players.push(playerId);
	if (this.playerCount === 1) {
		this.startGame();
	}
	this.game.addPlayer(playerId);
};

GameHolder.prototype.removePlayer = function (playerId) {
	this.playerCount--;
	for (var i = 0; i < this.players.length; i++) {
		var dudeId = this.players[i];
		if (dudeId === playerId) {
			this.players.splice(i, 1);
			break;
		}
	}
	//this.game.removePlayer(playerId);
};

GameHolder.prototype.startGame = function () {
	console.log("Start GameHolder!");
	this.game.start();
	this.io.emit("start");
};

GameHolder.prototype.restartGame = function () {
	console.log("Restarting game!");
	this.game = gameCreator.create(this);
	var oldPlayers = this.players;
	this.players = [];
	this.playerCount = 0;
	var thisGameHolder = this;
	oldPlayers.forEach(function (playerId) {
		thisGameHolder.addPlayer(playerId);
	});
};

GameHolder.prototype.updateMoves = function (playerId, moves) {
	var player = this.game.findPlayer(playerId);
	if (player != undefined) {
		player.setMoves(moves);
	}
};

GameHolder.prototype.sendGame = function (game) {
	var gameJson = game.toJson();
	var jsonString = JSON.stringify(gameJson);
	this.io.emit('update', jsonString);
};

var gameHolder;

var addPlayer = function (io, playerId) {
	if (gameHolder === undefined) {
		gameHolder = new GameHolder(io);
	}
	gameHolder.addPlayer(playerId);
};

var removePlayer = function (playerId) {
	gameHolder.removePlayer(playerId);
	if (gameHolder.playerCount === 0) {
		console.log("stopping game");
		gameHolder = undefined;
	}
};

var updateMoves = function (playerId, moves) {
	gameHolder.updateMoves(playerId, moves);
};


exports.addPlayer = addPlayer;
exports.removePlayer = removePlayer;
exports.updateMoves = updateMoves;