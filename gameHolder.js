var gameCreator = require('./game/gameCreator');

var PlayerHolder = function PlayerHolder(id, number) {
	this.id = id;
	this.number = number;
};

var GameHolder = function GameHolder(io) {
	this.io = io;
	this.players = [];
	this.playerCount = 0;
	this.game = gameCreator.create(this);
};

GameHolder.prototype.addPlayer = function (playerId, playerNumber) {
	this.playerCount++;
	if (playerNumber == undefined) {
		playerNumber = this.getLowestFreePlayerNumber();
	}
	this.players.push(new PlayerHolder(playerId, playerNumber));
	this.game.addPlayer(playerId, playerNumber);
};

GameHolder.prototype.removePlayer = function (playerId) {
	this.playerCount--;
	for (var i = 0; i < this.players.length; i++) {
		var dudeId = this.players[i].id;
		if (dudeId === playerId) {
			this.players.splice(i, 1);
			break;
		}
	}
	this.game.removePlayer(playerId);
};

GameHolder.prototype.startGame = function () {
	this.game.start();
	//this.io.emit("start");
};

GameHolder.prototype.restartGame = function () {
	console.log("Restarting game!");
	this.game.stop();
	this.game = gameCreator.create(this);
	var oldPlayers = this.players;
	this.players = [];
	this.playerCount = 0;
	var thisGameHolder = this;
	oldPlayers.forEach(function (player) {
		thisGameHolder.addPlayer(player.id, player.number);
	});
	this.game.start();
};

GameHolder.prototype.stopGame = function () {
	this.game.stop();
};

GameHolder.prototype.updateMoves = function (playerId, moves) {
	var player = this.game.getPlayer(playerId);
	if (player != undefined) {
		player.setMoves(moves);
	}
};

GameHolder.prototype.sendGame = function (game) {
	var gameJson = game.toJson();
	var jsonString = JSON.stringify(gameJson);
	this.io.emit('update', jsonString);
};

GameHolder.prototype.getLowestFreePlayerNumber = function () {
	if (this.players.length == 0) {
		return 0;
	}

	var playerSlots = new Array(64);
	this.players.forEach(function (player) {
		playerSlots[player.number] = true;
	});
	for (var i = 0; i < playerSlots.length; i++) {
		if (playerSlots[i] == undefined) {
			console.log("got player number " + i);
			return i;
		}
	}
	console.log("buggy bug");
};

var gameHolder;

var addPlayer = function (io, playerId) {
	if (gameHolder === undefined) {
		gameHolder = new GameHolder(io);
		gameHolder.addPlayer(playerId);
		gameHolder.startGame();
	} else {
		gameHolder.addPlayer(playerId);
	}
};

var removePlayer = function (playerId) {
	gameHolder.removePlayer(playerId);
	if (gameHolder.playerCount === 0) {
		//console.log("stopping game");
		gameHolder.stopGame();
		gameHolder = undefined;
	}
};

var updateMoves = function (playerId, moves) {
	gameHolder.updateMoves(playerId, moves);
};


exports.addPlayer = addPlayer;
exports.removePlayer = removePlayer;
exports.updateMoves = updateMoves;