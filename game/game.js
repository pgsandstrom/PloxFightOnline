var tic = require('./tic');
var gameObjects = require('./gameObjects');

ploxfight.RENDER_TIC_TIME = 33;
ploxfight.GAME_TIC_TIME = 33;

ploxfight.PLAYER_SPEED = 6;
ploxfight.TUMBLE_SPEED = 12;
ploxfight.FIST_TIME = 300;
ploxfight.TUMBLE_TIME = 300;
ploxfight.JUMP_TIME = 1000;

ploxfight.BULLET_LIFETIME = 20;

ploxfight.BOARD_SIZE = 12;
ploxfight.TILE_SIZE = 50;
ploxfight.TILE_HEIGHT = 100;	//the board is at height 0, the water is at -100

var newGame = function (gameHolder, eventTrigger) {
	return new Game(gameHolder, eventTrigger);
};

var Game = function Game(gameHolder, eventTrigger) {
	this.gameHolder = gameHolder;
	this.eventTrigger = eventTrigger;
	this.playerIdGenerator = 0;
	this.running = true;
	this.board = this.newBoard();
	this.players = [];
	//this.players.push(this.newOpponent());

	this.bullets = [];

	this.barrels = [];
	this.barrels.push(new Barrel(this));
	this.barrels.push(new Barrel(this));

	//ploxfight.startControl();

	//this.renderer = new ploxfight.Renderer(this);
	//this.renderer.startRender();

	this.tic = tic.newTic(gameHolder, this);
	//this.tic.startTic();
};

Game.prototype.toJson = function () {
	var gameJson = {};
	gameJson.board = this.board;
	gameJson.players = [];
	gameJson.players = this.players.map(function (player) {
		return player.toJson();
	});
	gameJson.bullets = this.bullets;
	gameJson.barrels = this.barrels.map(function (barrel) {
		return barrel.toJson();
	});
	return gameJson;
};

Game.prototype.newBoard = function () {
	var board = [];

	for (var y = 0; y < ploxfight.BOARD_SIZE; y++) {
		var row = [];
		board.push(row);
		for (var x = 0; x < ploxfight.BOARD_SIZE; x++) {
			if (y < 2 || y > ploxfight.BOARD_SIZE - 3 || x < 2 || x > ploxfight.BOARD_SIZE - 3) {
				row.push(newTile(0));
			} else {
				row.push(newTile());
			}
		}
	}
	return board;
};

var newTile = function (health) {
	var tileHeath = health !== undefined ? health : Math.floor(250 + Math.random() * 750);
	var breaking = health === 0 ? 0 : 1000;
	var height = health === 0 ? -ploxfight.TILE_HEIGHT : 0;
	return {
		health: tileHeath,
		breaking: breaking,
		height: height
	}
};

Game.prototype.addPlayer = function (playerId) {
	//TODO: g�r n�got med playerId
	var player;
	if (this.players.length == 0) {
		player = new Player(this, playerId, 175, 175, false);
	} else {
		player = new Player(this, playerId, 425, 425, false);
	}
	this.players.push(player);
};

Game.prototype.newOpponent = function () {
	return new Player(this, this.playerIdGenerator++, 425, 425, true);
};

Game.prototype.findPlayer = function (playerId) {
	for (var i = 0; i < this.players.length; i++) {
		var dude = this.players[i];
		if (dude.id === playerId) {
			return dude;
		}
	}
};

Game.prototype.playerDeath = function (deadDude) {
	var alivePlayers = 0;
	for (var i = 0; i < this.players.length; i++) {
		var dude = this.players[i];
		if (dude.id === deadDude.id) {
			this.players.splice(i, 1);
			break;
		} else {
			if (!dude.ai) {
				alivePlayers++;
			}
		}
	}

	if (alivePlayers < 2) {
		this.restart(1000);
	}

};

Game.prototype.restart = function (delay) {
	var thisGame = this;
	setTimeout(function () {
		thisGame.stop();
		thisGame.gameHolder.restartGame();
	}, delay);
};

Game.prototype.addBullet = function (bullet) {
	this.bullets.push(bullet);
};

Game.prototype.removeBullet = function (deadBullet) {
	for (var i = 0; i < this.bullets.length; i++) {
		var bullet = this.bullets[i];
		if (bullet.id === deadBullet.id) {
			this.bullets.splice(i, 1);
			break;
		}
	}
};

Game.prototype.start = function () {
	this.tic.startTic();
};

Game.prototype.stop = function () {
	this.running = false;
};

ploxfight.Player = function Player(game, id, x, y, ai) {
	this.type = "dude";
	this.game = game;
	this.id = id;
	this.ai = ai;
	this.groupId = id;
	this.health = 100;
	this.height = 0;
	this.degree = 0;
	this.x = x;
	this.y = y;
	this.shape = ploxfight.shape.SQUARE;
	this.shapeWidth = 50;
	this.shapeHeight = 20;
	this.pushability = 100;

	this.loadFist = false;
	// "Progress" things are ongoing if they are above 0
	this.tumbleProgress = 0;
	this.jumpProgress = 0;

	this.moves = undefined;
};

var Player = ploxfight.Player;

Player.prototype.toJson = function () {
	var playerJson = {};
	playerJson.type = this.type;
	playerJson.id = this.id;
	playerJson.groupId = this.groupId;
	playerJson.health = this.health;
	playerJson.height = this.height;
	playerJson.degree = this.degree;
	playerJson.x = this.x;
	playerJson.y = this.y;
	playerJson.shape = this.shape;
	playerJson.shapeWidth = this.shapeWidth;
	playerJson.shapeHeight = this.shapeHeight;
	playerJson.pushability = this.pushability;
	playerJson.loadFist = this.loadFist;
	playerJson.tumbleProgress = this.tumbleProgress;
	return playerJson;
};

Player.prototype.shoot = function () {
	var bullet = new gameObjects.Bullet(this);
	this.game.addBullet(bullet);
};

Player.prototype.bulletHit = function (bullet) {
	this.death();
	this.game.removeBullet(bullet);
};

Player.prototype.death = function () {
	console.log("death");
	this.game.playerDeath(this);
};

Player.prototype.setMoves = function (moves) {
	this.moves = moves;
};

ploxfight.Barrel = function Barrel(game,x, y) {
	this.game = game;
	this.type = "barrel";
	this.health = 100;
	this.height = 0;
	this.degree = 0;
	this.x = x !== undefined ? x : Math.floor(125 + Math.random() * 375);
	this.y = y !== undefined ? y : Math.floor(125 + Math.random() * 375);
	this.shape = ploxfight.shape.CIRCLE;
	this.radius = 25;
	this.pushability = 100;
};

var Barrel = ploxfight.Barrel;

Barrel.prototype.bulletHit = function(bullet) {
	this.game.removeBullet(bullet);
};

Barrel.prototype.toJson = function () {
	var bulletJson = {};
	bulletJson.type = this.type;
	bulletJson.health = this.health;
	bulletJson.height = this.height;
	bulletJson.x = this.x;
	bulletJson.y = this.y;
	bulletJson.shape = this.shape;
	bulletJson.radius = this.radius;
	bulletJson.degree = this.degree;
	return bulletJson;
};

exports.newGame = newGame;