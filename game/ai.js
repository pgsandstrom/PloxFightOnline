(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	var HIT_FREQUENCY = 1200;

	var waitTime = 21231000;
	var hitTimer = HIT_FREQUENCY;


	ploxfight.ai = function (game, dude) {

		if (dude.height < ploxfight.HEIGHT_KILL_CONTROL) {
			return;
		}

		if (dude.tumbleProgress > 0) {
			return;
		}

		var xForce = game.player.x - dude.x;
		var yForce = game.player.y - dude.y;
		var degree = Math.atan2(xForce, yForce);
		dude.degree = degree;

		var moves = {};

		//dude motion:
		if (waitTime <= 0) {
			moves[ploxfight.MOVE_FORWARD] = true;
		} else {
			waitTime -= ploxfight.GAME_TIC_TIME;
		}

		//if (hitTimer <= 0) {
		//	moves[ploxfight.MOVE_HIT] = true;
		//	hitTimer = HIT_FREQUENCY;
		//} else {
		//	hitTimer -= ploxfight.GAME_TIC_TIME;
		//}

		ploxfight.updateDude(dude, moves);
	};

})();