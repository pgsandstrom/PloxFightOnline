(function () {
	"use strict";

	var ploxfight = window.ploxfight = window.ploxfight || {};

	//TODO: dubbletter av konstanter
	ploxfight.TILE_HEIGHT = 100;
	ploxfight.TILE_SIZE = 50;
	ploxfight.shape = {};
	ploxfight.shape.SQUARE = "SQUARE";
	ploxfight.shape.CIRCLE = "CIRCLE";
	ploxfight.shape.LINE = "LINE";

	var PLAYER_IMAGE_SIZE = 50;
	var BARREL_IMAGE_SIZE = 50;

	var $canvas = $("#canvas");
	ploxfight.canvasX = $canvas.offset().left;
	ploxfight.canvasY = $canvas.offset().top;

	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	var image_player = document.getElementById('player');
	var image_player_hit = document.getElementById('player-hit');
	var image_player_tumbling = document.getElementById('player-tumbling');
	//var image_opponent = document.getElementById('opponent');
	//var image_opponent_hit = document.getElementById('opponent-hit');
	//var image_opponent_tumbling = document.getElementById('opponent-tumbling');
	var image_opponent;
	var image_opponent_hit;
	var image_opponent_tumbling;


	var image_tile1 = document.getElementById('tile-1');
	var image_tile2 = document.getElementById('tile-2');
	var image_tile3 = document.getElementById('tile-3');
	var image_tile_breaking_1 = document.getElementById('tile-breaking-1');
	var image_tile_breaking_2 = document.getElementById('tile-breaking-2');
	var image_tile_breaking_3 = document.getElementById('tile-breaking-3');
	var image_tile_breaking_4 = document.getElementById('tile-breaking-4');
	var image_tile_breaking_5 = document.getElementById('tile-breaking-5');
	var image_tile_falling_1 = document.getElementById('tile-falling-1');
	var image_water = document.getElementById('water');
	var image_barrel = document.getElementById('barrel');

	ploxfight.Renderer = function Renderer() {
		this.startTime = Date.now();
	};

	var Renderer = ploxfight.Renderer;

	Renderer.prototype.startRender = function () {
		var renderer = this;
		var repeater = function (stalled) {
			setTimeout(function () {
				var startTime = Date.now();
				renderer.render();
				//var e = new Date().getTime() + (20);	// Faked waiting for testing purposes
				//while (new Date().getTime() <= e) {}
				var time = Date.now() - startTime;
				if (time > 15 && startTime > renderer.startTime + 300) {
					console.log("SLOW RENDER TIC: " + time);
				}
				//console.log("RENDER TIC: " + time);
				if (renderer.game.running) {
					repeater(time);
				}
			}, ploxfight.RENDER_TIC_TIME - stalled);
		};
		repeater(0);
	};

	Renderer.prototype.render = function (game) {
		this.game = game;
		var board = this.game.board;

		for (var y = 0; y < board.length; y++) {
			var row = board[y];
			for (var x = 0; x < row.length; x++) {
				var tile = row[x];
				//console.log("tile at " + x * 50 + "," + y * 50);
				if (tile.health >= 750) {
					context.drawImage(image_tile1, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.health >= 500) {
					context.drawImage(image_tile2, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.health > 0) {
					context.drawImage(image_tile3, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.breaking > 800) {
					context.drawImage(image_tile_breaking_1, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.breaking > 600) {
					context.drawImage(image_tile_breaking_2, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.breaking > 400) {
					context.drawImage(image_tile_breaking_3, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.breaking > 200) {
					context.drawImage(image_tile_breaking_4, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.breaking > 0) {
					context.drawImage(image_tile_breaking_5, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				} else if (tile.height > -ploxfight.TILE_HEIGHT) {
					context.drawImage(image_water, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
					var object = {
						x: (x + 0.5) * ploxfight.TILE_SIZE,
						y: (y + 0.5) * ploxfight.TILE_SIZE,
						height: tile.height
					};
					renderObject(object, image_tile_falling_1, ploxfight.TILE_SIZE);
				} else {
					context.drawImage(image_water, x * ploxfight.TILE_SIZE, y * ploxfight.TILE_SIZE);
				}
			}
		}

		for (var i = 0; i < this.game.players.length; i++) {
			var player = this.game.players[i];
			this.renderDude(player);
		}

		for (var i = 0; i < this.game.barrels.length; i++) {
			this.renderBarrel(this.game.barrels[i]);
		}

		for (var i = 0; i < this.game.bullets.length; i++) {
			this.renderBullet(this.game.bullets[i]);
		}


		//paint a circle over the character:
		//context.beginPath();
		//context.arc(player.x, player.y, 3, 0, 2 * Math.PI, false);
		//context.fillStyle = 'green';
		//context.fill();
		//context.lineWidth = 5;
		//context.strokeStyle = '#003300';
		//context.stroke();
	};

	Renderer.prototype.renderBarrel = function (barrel) {
		renderObject(barrel, image_barrel, BARREL_IMAGE_SIZE);
	};

	Renderer.prototype.renderDude = function (dude) {
		var image;
		if (dude.tumbleProgress <= 0) {
			if (dude.id === 0) {
				image = image_player;
			} else {
				image = image_opponent;
			}
		} else {
			if (dude.id === 0) {
				image = image_player_tumbling;
			} else {
				image = image_opponent_tumbling;
			}
		}
		renderObject(dude, image, PLAYER_IMAGE_SIZE);
	};

	var renderObject = function (object, image, imageSize) {
		context.translate(object.x, object.y);
		context.rotate(-object.degree);
		var scale = ((object.height + ploxfight.TILE_HEIGHT) / ploxfight.TILE_HEIGHT);
		var size = imageSize * scale;
		var offset = -(imageSize / 2)	// The image should be drawn with the middle on our (x,y), not the corner.
			+ (imageSize / 2) * (-scale + 1); // When the image shrinks, we need to adjust offset. 0 when scale=1, 0.5 when scale=0.
		context.drawImage(image, offset, offset, size, size);
		context.rotate(object.degree);
		context.translate(-object.x, -object.y);

		if (object.shape === ploxfight.shape.SQUARE) {
			paintSquareBorder(object);
			if (object.fist !== undefined) {
				paintSquareBorder(object.fist);
			}
		}
	};

	Renderer.prototype.renderBullet = function (bullet) {
		context.beginPath();
		context.moveTo(bullet.start.x, bullet.start.y);
		context.lineTo(bullet.end.x, bullet.end.y);
		context.stroke();
	};

	var paintSquareBorder = function (square) {
		var lines = ploxfight.getSquareLines(square);
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			context.beginPath();
			context.moveTo(line.start.x, line.start.y);
			context.lineTo(line.end.x, line.end.y);
			context.stroke();
		}
	};

	function fixImage(context, x, y, width, height, filter) {

		if (filter === 1) {
			return;
		}

		//var timeInMs = Date.now();
		var imageData = context.getImageData(x, y, width, height);
		var data = imageData.data;

		for (var i = 0; i < data.length; i += 4) {
			// red
			if (filter === 2) {
				data[i] = 255 - data[i];
			}
			// green
			if (filter === 3) {
				data[i + 1] = 255 - data[i + 1];
			}
			// blue
			if (filter === 4) {
				data[i + 2] = 255 - data[i + 2];
			}
		}

		// overwrite original image
		context.putImageData(imageData, x, y);

		//timeInMs = Date.now() - timeInMs;
		//console.log(timeInMs);
	}

	ploxfight.prepareImages = function () {
		var canvasTemp = document.getElementById('canvas-temp');
		var contextTemp = canvasTemp.getContext('2d');
		var data;

		contextTemp.drawImage(image_player, 0, 0, 50, 50);
		fixImage(contextTemp, 0, 0, 50, 50, 2);
		data = canvasTemp.toDataURL();
		image_opponent = new Image();
		image_opponent.src = data;
		contextTemp.clearRect(0, 0, 50, 50);

		contextTemp.drawImage(image_player_hit, 0, 0, 50, 50);
		fixImage(contextTemp, 0, 0, 50, 50, 2);
		data = canvasTemp.toDataURL();
		image_opponent_hit = new Image();
		image_opponent_hit.src = data;
		contextTemp.clearRect(0, 0, 50, 50);

		contextTemp.drawImage(image_player_tumbling, 0, 0, 50, 50);
		fixImage(contextTemp, 0, 0, 50, 50, 2);
		data = canvasTemp.toDataURL();
		image_opponent_tumbling = new Image();
		image_opponent_tumbling.src = data;
		contextTemp.clearRect(0, 0, 50, 50);
	};


	//TODO: Dessa �r bara fulinflyttad h�r fr�n collision.js. Skapa en graphics.js eller n�tt som vi har b�de i klient � server?
	ploxfight.getSquareLines = function (square) {
		var squareCorners = ploxfight.getSquareCorners(square);

		var result = [];
		for (var y = 0; y < squareCorners.length; y++) {
			var first;
			if (y === 0) {
				first = squareCorners[squareCorners.length - 1];
			} else {
				first = squareCorners[y - 1];
			}
			var second = squareCorners[y];
			result.push(new ploxfight.Line(first, second));
		}
		return result;
	};
	ploxfight.getSquareCorners = function (object) {
		var degree = -object.degree;	// WARNING: I use minus here and I'm not sure why it is needed...

		var TLx_pre = -object.shapeWidth / 2;
		var TLy_pre = -object.shapeHeight / 2;
		var TLx = object.x + ploxfight.rotateX(TLx_pre, TLy_pre, degree);
		var TLy = object.y + ploxfight.rotateY(TLx_pre, TLy_pre, degree);

		var TRx_pre = object.shapeWidth / 2;
		var TRy_pre = -object.shapeHeight / 2;
		var TRx = object.x + ploxfight.rotateX(TRx_pre, TRy_pre, degree);
		var TRy = object.y + ploxfight.rotateY(TRx_pre, TRy_pre, degree);

		var BLx_pre = -object.shapeWidth / 2;
		var BLy_pre = object.shapeHeight / 2;
		var BLx = object.x + ploxfight.rotateX(BLx_pre, BLy_pre, degree);
		var BLy = object.y + ploxfight.rotateY(BLx_pre, BLy_pre, degree);

		var BRx_pre = object.shapeWidth / 2;
		var BRy_pre = object.shapeHeight / 2;
		var BRx = object.x + ploxfight.rotateX(BRx_pre, BRy_pre, degree);
		var BRy = object.y + ploxfight.rotateY(BRx_pre, BRy_pre, degree);

		return [
			{
				x: TLx,
				y: TLy
			},
			{
				x: TRx,
				y: TRy
			},
			{
				x: BRx,
				y: BRy
			},
			{
				x: BLx,
				y: BLy
			}
		];

	};
	ploxfight.rotateX = function (x, y, degree) {
		return x * Math.cos(degree) - y * Math.sin(degree);
	};
	ploxfight.rotateY = function (x, y, degree) {
		return x * Math.sin(degree) + y * Math.cos(degree);
	};
})();