(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.gameTest = function () {
		var eventTrigger = function (game) {
			//TODO: denna ska gå på tid, inte tics...
			if (game.tic.ticCount % 100 === 0) {
				game.opponents.push(this.newOpponent());
			}
		};

		return new ploxfight.Game(eventTrigger);
	};

})();