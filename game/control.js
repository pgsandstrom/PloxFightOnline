ploxfight.MOVE_FORWARD = "MOVE_FORWARD";
ploxfight.MOVE_BACKWARD = "MOVE_BACKWARD";
ploxfight.MOVE_LEFT = "MOVE_LEFT";
ploxfight.MOVE_RIGHT = "MOVE_RIGHT";
ploxfight.MOVE_HIT = "MOVE_HIT";
ploxfight.MOVE_JUMP = "MOVE_JUMP";
ploxfight.MOUSE_X = "MOUSE_X";
ploxfight.MOUSE_Y = "MOUSE_Y";

ploxfight.HEIGHT_KILL_CONTROL = -12;	//the board is at height 0, the water is at -100

var updateDude = function (dude, moves) {

	if (moves == undefined) {
		return;
	}

	if (dude.height < ploxfight.HEIGHT_KILL_CONTROL) {
		return;
	}

	if (dude.tumbleProgress > 0) {
		return;
	}

	if (!dude.ai) {
		var xForce = moves[ploxfight.MOUSE_X] - dude.x;
		var yForce = moves[ploxfight.MOUSE_Y] - dude.y;

		dude.degree = Math.atan2(xForce, yForce);
	}

	var playerSpeed = ploxfight.PLAYER_SPEED;
	if ((moves[ploxfight.MOVE_FORWARD] || moves[ploxfight.MOVE_BACKWARD]) && (moves[ploxfight.MOVE_LEFT] || moves[ploxfight.MOVE_RIGHT])) {
		playerSpeed = Math.sqrt((playerSpeed * playerSpeed) / 2);
	}

	// Den utkommeterade koden i r�relsen �r den gamla konstiga kontrollen
	if (moves[ploxfight.MOVE_FORWARD]) {
		//ploxfight.performMove(dude, xForce, yForce, playerSpeed);
		ploxfight.performMove(dude, 0, -1, playerSpeed)
	}
	if (moves[ploxfight.MOVE_BACKWARD]) {
		//ploxfight.performMove(dude, -xForce, -yForce, playerSpeed);
		ploxfight.performMove(dude, 0, 1, playerSpeed)
	}
	if (moves[ploxfight.MOVE_LEFT]) {
		//var leftDegree = dude.degree + Math.PI / 2;
		//var xForceLeft = Math.sin(leftDegree);
		//var yForceLeft = Math.cos(leftDegree);
		//ploxfight.performMove(dude, xForceLeft, yForceLeft, playerSpeed);
		ploxfight.performMove(dude, -1, 0, playerSpeed)
	}
	if (moves[ploxfight.MOVE_RIGHT]) {
		//var rightDegree = dude.degree - Math.PI / 2;
		//var xForceRight = Math.sin(rightDegree);
		//var yForceRight = Math.cos(rightDegree);
		//ploxfight.performMove(dude, xForceRight, yForceRight, playerSpeed);
		ploxfight.performMove(dude, 1, 0, playerSpeed)
	}

	if (moves[ploxfight.MOVE_HIT] && dude.fist === undefined) {
		dude.loadFist = true;
		dude.shoot();
	}

	if (moves[ploxfight.MOVE_JUMP] && dude.height === 0) {
		dude.jumpProgress = ploxfight.JUMP_TIME;
	}
};

ploxfight.performMove = function (object, xForce, yForce, speed) {
	var newPosition = ploxfight.getNewPosition(object.x, object.y, xForce, yForce, speed);
	object.x = newPosition.x;
	object.y = newPosition.y;
};

ploxfight.getNewPosition = function (x, y, xForce, yForce, speed) {
	var xAbs = Math.abs(xForce);
	var yAbs = Math.abs(yForce);

	var xQuota = xAbs / (xAbs + yAbs);
	var yQuota = 1 - xQuota;

	var xChange = xQuota;
	if (xForce < 0) {
		xChange *= -1;
	}
	var yChange = yQuota;
	if (yForce < 0) {
		yChange *= -1;
	}

	// We just multiply so it gets the length it is supposed to have
	var achievedSpeed = Math.sqrt(yChange * yChange + xChange * xChange);
	var adjust = speed / achievedSpeed;

	return {
		x: x + xChange * adjust,
		y: y + yChange * adjust
	};
};

exports.updateDude = updateDude;