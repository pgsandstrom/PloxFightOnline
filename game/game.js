(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.RENDER_TIC_TIME = 33;
	ploxfight.GAME_TIC_TIME = 33;

	ploxfight.PLAYER_SPEED = 6;
	ploxfight.TUMBLE_SPEED = 12;
	ploxfight.FIST_TIME = 300;
	ploxfight.TUMBLE_TIME = 300;

	ploxfight.BULLET_LIFETIME = 20;

	ploxfight.BOARD_SIZE = 12;
	ploxfight.TILE_SIZE = 50;
	ploxfight.TILE_HEIGHT = 100;	//the board is at height 0, the water is at -100
	ploxfight.HEIGHT_KILL_CONTROL = -12;	//the board is at height 0, the water is at -100

	var $canvas = $("#canvas");
	ploxfight.canvasX = $canvas.offset().left;
	ploxfight.canvasY = $canvas.offset().top;

	ploxfight.key_forward = false;
	ploxfight.key_left = false;
	ploxfight.key_right = false;
	ploxfight.key_back = false;
	ploxfight.key_hit = false;

	ploxfight.mouseX = 0;
	ploxfight.mouseY = 0;

	$(window).load(function () {
		ploxfight.prepareImages();
		ploxfight.game = ploxfight.gameTest();
	});


	ploxfight.Game = function Game(eventTrigger) {
		this.eventTrigger = eventTrigger;
		this.playerIdGenerator = 0;
		this.running = true;
		this.board = this.newBoard();
		this.player = this.newPlayer();
		this.opponents = [];
		this.opponents.push(this.newOpponent());

		this.bullets = [];

		this.barrels = [];
		this.barrels.push(new ploxfight.Barrel());
		this.barrels.push(new ploxfight.Barrel());

		ploxfight.startControl();

		this.renderer = new ploxfight.Renderer(this);
		this.renderer.startRender();

		this.tic = new ploxfight.Tic(this);
		this.tic.startTic();
	};

	var Game = ploxfight.Game;

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

	Game.prototype.newPlayer = function () {
		return new Player(this, this.playerIdGenerator++, 175, 175);
	};

	Game.prototype.newOpponent = function () {
		return new Player(this, this.playerIdGenerator++, 425, 425);
	};

	Game.prototype.playerDeath = function (deadDude) {
		for (var i = 0; i < this.opponents.length; i++) {
			var dude = this.opponents[i];
			if (dude.id === deadDude.id) {
				this.opponents.splice(i, 1);
				break;
			}
		}
		if (this.player.id === deadDude.id) {
			this.stop();
		}
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

	Game.prototype.stop = function () {
		this.running = false;
		ploxfight.stopControl();
	};

	ploxfight.Player = function Player(game, id, x, y) {
		this.type = "dude";
		this.game = game;
		this.id = id;
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
		this.tumbleProgress = 0;
	};

	var Player = ploxfight.Player;

	Player.prototype.shoot = function () {
		var bullet = ploxfight.getBullet(this);
		this.game.addBullet(bullet);
	};

	Player.prototype.bulletHit = function (bullet) {
		this.death();
		this.game.removeBullet(bullet);
	};

	Player.prototype.death = function () {
		this.game.playerDeath(this);
	};

	ploxfight.Barrel = function Barrel(x, y) {
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


})();