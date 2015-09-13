(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.localGame = function localGame(renderer) {
		this.renderer = renderer;
	};

	var localGame = ploxfight.localGame;

	localGame.prototype.start = function () {
		ploxfight.prepareImages();
		console.log("loaded");
		setTimeout(function () {
			console.log("starting");

			ploxfight.startControl();
			var renderer = new ploxfight.Renderer();
			var io = new ploxfight.IO(renderer);
			io.start();

		}, 500);

	};

})();