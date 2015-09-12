var control = require('./control');

"use strict";
var HIT_FREQUENCY = 1200;

var waitTime = 1000;
var hitTimer = HIT_FREQUENCY;


var ai = function (game, dude) {

	// These are needed since the AI changes his angle here instead of in the "control" code.
	// The angle is changed here because I'm lazy.
	if (dude.height < ploxfight.HEIGHT_KILL_CONTROL) {
		return;
	}
	if (dude.tumbleProgress > 0) {
		return;
	}

	dude.degree = 15;

	var moves = {};

	//dude motion:
	if (waitTime <= 0) {
		moves[ploxfight.MOVE_FORWARD] = true;
	} else {
		waitTime -= ploxfight.GAME_TIC_TIME;
	}

	// Make the AI attack:
	//if (hitTimer <= 0) {
	//	moves[ploxfight.MOVE_HIT] = true;
	//	hitTimer = HIT_FREQUENCY;
	//} else {
	//	hitTimer -= ploxfight.GAME_TIC_TIME;
	//}

	dude.setMoves(moves);
};

exports.ai = ai;