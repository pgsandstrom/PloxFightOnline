var control = require('./control');

"use strict";
var HIT_FREQUENCY = 1200;

var waitTime = 1000;
var hitTimer = HIT_FREQUENCY;


var ai = function (game, dude) {

	//if (dude.height < ploxfight.HEIGHT_KILL_CONTROL) {
	//	return;
	//}
	//
	//if (dude.tumbleProgress > 0) {
	//	return;
	//}

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

	dude.setMoves(moves);
};

exports.ai = ai;