(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	var canvasTemp = document.getElementById('canvas-temp');
	var contextTemp = canvasTemp.getContext('2d');

	var playerImages = [];
	ploxfight.playerImages = playerImages;

	ploxfight.prepareImages = function () {

		var image_player1 = document.getElementById('player');
		var image_player1_hit = document.getElementById('player-hit');
		var image_player1_tumbling = document.getElementById('player-tumbling');

		var originalPlayer = new PlayerGraphic(image_player1, image_player1_hit, image_player1_tumbling);

		playerImages.push(originalPlayer);
		playerImages.push(createPlayer(2, originalPlayer));
		playerImages.push(createPlayer(3, originalPlayer));
		playerImages.push(createPlayer(4, originalPlayer));


	};

	var createPlayer = function (playerNumber, originalPlayer) {
		var data;

		contextTemp.drawImage(originalPlayer.player, 0, 0, 50, 50);
		fixImage(contextTemp, 0, 0, 50, 50, playerNumber);
		data = canvasTemp.toDataURL();
		var newPlayer = new Image();
		newPlayer.src = data;
		contextTemp.clearRect(0, 0, 50, 50);

		contextTemp.drawImage(originalPlayer.playerHit, 0, 0, 50, 50);
		fixImage(contextTemp, 0, 0, 50, 50, playerNumber);
		data = canvasTemp.toDataURL();
		var newPlayer_hit = new Image();
		newPlayer_hit.src = data;
		contextTemp.clearRect(0, 0, 50, 50);

		contextTemp.drawImage(originalPlayer.playerTumbling, 0, 0, 50, 50);
		fixImage(contextTemp, 0, 0, 50, 50, playerNumber);
		data = canvasTemp.toDataURL();
		var newPlayer_tumbling = new Image();
		newPlayer_tumbling.src = data;
		contextTemp.clearRect(0, 0, 50, 50);

		return new PlayerGraphic(newPlayer, newPlayer_hit, newPlayer_tumbling);
	};

	var fixImage = function (context, x, y, width, height, filter) {

		if (filter === 0) {
			return;
		}

		//var timeInMs = Date.now();
		var imageData = context.getImageData(x, y, width, height);
		var data = imageData.data;

		for (var i = 0; i < data.length; i += 4) {
			// red
			if (filter === 1) {
				data[i] = 255 - data[i];
			}
			// green
			if (filter === 2) {
				data[i + 1] = 255 - data[i + 1];
			}
			// blue
			if (filter === 3) {
				data[i + 2] = 255 - data[i + 2];
			}
		}

		// overwrite original image
		context.putImageData(imageData, x, y);

		//timeInMs = Date.now() - timeInMs;
		//console.log(timeInMs);
	};

	var PlayerGraphic = function PlayerGraphic(player, playerHit, playerTumbling) {
		this.player = player;
		this.playerHit = playerHit;
		this.playerTumbling = playerTumbling;
	};

})();
