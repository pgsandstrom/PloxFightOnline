(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};


	ploxfight.Tic = function Tic(game) {
		this.game = game;
		this.ticCount = 0;
	};

	var Tic = ploxfight.Tic;

	Tic.prototype.startTic = function () {
		this.ticRepeater(0);
	};

	Tic.prototype.ticRepeater = function (stalled) {
		var tic = this;
		setTimeout(function () {
			var startTime = Date.now();
			tic.tic();
			var time = Date.now() - startTime;
			if (time > 15) {
				console.log("SLOW GAME TIC: " + time);
			}
			//console.log("GAME   TIC: " + time);
			if (tic.game.running) {
				tic.ticRepeater(time);
			}
		}, ploxfight.GAME_TIC_TIME - stalled);
	};

	Tic.prototype.tic = function () {

		this.ticCount++;

		this.game.eventTrigger(this.game);

		//TODO: Nu buggar det loss då vi uppdaterar fist-position före player-position osv :(
		this.updateBoard();

		//all control stuff:
		this.handleControl(this.game.player);
		this.resetControl(this.game.player);
		for (var i = 0; i < this.game.opponents.length; i++) {
			var dude = this.game.opponents[i];
			ploxfight.ai(this.game, dude);
		}

		this.updateCollisions();

	};

	Tic.prototype.updateBoard = function () {
		this.updateTiles();
		this.updateBarrels();
		this.checkPlayerState(this.game.player);
		for (var i = 0; i < this.game.opponents.length; i++) {
			var dude = this.game.opponents[i];
			this.checkPlayerState(dude);
		}

		for (var i = 0; i < this.game.bullets.length; i++) {
			var bullet = this.game.bullets[i];
			var isOld = bullet.update();
			if(isOld) {
				this.game.removeBullet(bullet);
			}
		}
	};

	Tic.prototype.updateTiles = function () {
		var board = this.game.board;
		for (var y = 0; y < board.length; y++) {
			var row = board[y];
			for (var x = 0; x < board.length; x++) {
				var tile = row[x];
				// If tile is dead, animate:
				if (tile.health <= 0) {
					if (tile.breaking > 0) {
						tile.breaking -= ploxfight.GAME_TIC_TIME;
					} else {
						this.objectFall(tile);
					}
				}
			}
		}
	};

	Tic.prototype.updateBarrels = function () {
		for (var i = 0; i < this.game.barrels.length; i++) {
			var barrel = this.game.barrels[i];
			var tile = this.game.board[(barrel.y / ploxfight.TILE_SIZE) | 0][(barrel.x / ploxfight.TILE_SIZE) | 0];
			if (tile.breaking <= 0) {
				this.objectFall(barrel);
			}
		}

	};

	Tic.prototype.checkPlayerState = function (dude) {
		if (dude.height <= -ploxfight.TILE_HEIGHT) {
			dude.death();
		}

		// update the tile the dude is standing on:
		var tile = this.game.board[(dude.y / ploxfight.TILE_SIZE) | 0][(dude.x / ploxfight.TILE_SIZE) | 0];
		if (tile.breaking <= 0) {
			this.objectFall(dude);
		} else {
			if (tile.health > 0) {
				tile.health -= 5;
			}
			if (tile.breaking > 0 && dude.height < 0) {	// Abort falling
				dude.height = 0;
			}
		}

		if (dude.loadFist === true || (dude.fist !== undefined && dude.fist.fistProgress > 0)) {
			var fistProgress = (dude.fist !== undefined ? dude.fist.fistProgress - ploxfight.GAME_TIC_TIME : ploxfight.FIST_TIME);
			dude.fist = ploxfight.getFist(dude);
			dude.fist.fistProgress = fistProgress;
			dude.loadFist = false;
		} else {
			dude.fist = undefined;
		}

		if (dude.tumbleProgress > 0) {
			dude.tumbleProgress -= ploxfight.GAME_TIC_TIME;
			var xForce = Math.sin(dude.degree);
			var yForce = Math.cos(dude.degree);
			var speed = ploxfight.TUMBLE_SPEED;
			ploxfight.performMove(dude, xForce, yForce, speed);
		}
	};

	Tic.prototype.objectFall = function (object) {
		if (object.height > -ploxfight.TILE_HEIGHT) {
			object.height = object.height - 2;
			if (object.height < -ploxfight.TILE_HEIGHT) {
				object.height = -ploxfight.TILE_HEIGHT;
			}
		}
	};

	Tic.prototype.handleControl = function (player) {

		if (player.height < ploxfight.HEIGHT_KILL_CONTROL) {
			return;
		}

		if (player.tumbleProgress > 0) {
			return;
		}

		//var preX = game.player.x;
		//var preY = game.player.y;

		//player direction:
		var xForce = ploxfight.mouseX - (ploxfight.canvasX + player.x);
		var yForce = ploxfight.mouseY - (ploxfight.canvasY + player.y);
		var degree = Math.atan2(xForce, yForce);
		player.degree = degree;

		var moves = {};

		//player motion:
		moves[ploxfight.MOVE_FORWARD] = ploxfight.key_forward;
		moves[ploxfight.MOVE_BACKWARD] = ploxfight.key_back;
		moves[ploxfight.MOVE_LEFT] = ploxfight.key_left;
		moves[ploxfight.MOVE_RIGHT] = ploxfight.key_right;
		moves[ploxfight.MOVE_HIT] = ploxfight.key_hit;

		ploxfight.updateDude(player, moves);

		//var postX = game.player.x;
		//var postY = game.player.y;
		//var diffX = Math.abs(postX - preX);
		//var diffY = Math.abs(postY - preY);
		//var totalMoved = Math.sqrt(diffX * diffX + diffY * diffY);
		//console.log("moved: " + totalMoved);
	};

	Tic.prototype.resetControl = function (player) {
		ploxfight.key_hit = false;
	};

	Tic.prototype.updateCollisions = function () {
		var collisionables = [];

		this.addPlayerCollision(collisionables, this.game.player);
		for (var i = 0; i < this.game.opponents.length; i++) {
			this.addPlayerCollision(collisionables, this.game.opponents[i]);
		}

		collisionables.push.apply(collisionables, this.game.barrels);
		for (var i = 0; i < collisionables.length; i++) {
			var object1 = collisionables[i];
			for (var j = i + 1; j < collisionables.length; j++) {
				var object2 = collisionables[j];
				ploxfight.checkCollisions(object1, object2);
			}
		}

		var bullets = this.game.bullets;
		for (var i = 0; i < bullets.length; i++) {
			var bullet = bullets[i];
			var hitObject = ploxfight.checkCollisionLine(bullet, collisionables);
			if (hitObject !== undefined) {
				hitObject.bulletHit(bullet);
			}
		}
	};

	Tic.prototype.addPlayerCollision = function (collisionables, dude) {
		collisionables.push(dude);

		if (dude.fist !== undefined) {
			collisionables.push(dude.fist);
		}
	};

})();
