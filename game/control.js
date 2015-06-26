(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.MOVE_FORWARD = "MOVE_FORWARD";
	ploxfight.MOVE_BACKWARD = "MOVE_BACKWARD";
	ploxfight.MOVE_LEFT = "MOVE_LEFT";
	ploxfight.MOVE_RIGHT = "MOVE_RIGHT";
	ploxfight.MOVE_HIT = "MOVE_HIT";

	ploxfight.updateDude = function (dude, moves) {

		if (dude.height < ploxfight.HEIGHT_KILL_CONTROL) {
			return;
		}

		if (dude.tumbleProgress > 0) {
			return;
		}

		//xForce and yForce is calculated twice for human controlled players currently. Could be optimized
		var xForce = Math.sin(dude.degree);
		var yForce = Math.cos(dude.degree);

		var playerSpeed = ploxfight.PLAYER_SPEED;
		if ((moves[ploxfight.MOVE_FORWARD] || moves[ploxfight.MOVE_BACKWARD]) && (moves[ploxfight.MOVE_LEFT] || moves[ploxfight.MOVE_RIGHT])) {
			playerSpeed = Math.sqrt((playerSpeed * playerSpeed) / 2);
		}

		// Den utkommeterade koden i rörelsen är den gamla konstiga kontrollen
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

	ploxfight.startControl = function () {

		$(document).click(function (event) {
			ploxfight.key_hit = true;
			event.preventDefault();
			return false;
		});

		$(document).dblclick(function (event) {
			event.preventDefault();
			return false;
		});

		ploxfight.mouseX = 300;
		ploxfight.mouseY = 300;
		$(document).mousemove(function (event) {
			ploxfight.mouseX = event.pageX;
			ploxfight.mouseY = event.pageY;
		});

		$(document).keydown(function (e) {
			if (e.which == 87) { //w
				ploxfight.key_forward = true;
			}
			if (e.which == 65) { //a
				ploxfight.key_left = true;
			}
			if (e.which == 83) { //s
				ploxfight.key_back = true;
			}
			if (e.which == 68) { //d
				ploxfight.key_right = true;
			}
		});

		$(document).keyup(function (e) {
			if (e.which == 87) { //w
				ploxfight.key_forward = false;
			}
			if (e.which == 65) { //a
				ploxfight.key_left = false;
			}
			if (e.which == 83) { //s
				ploxfight.key_back = false;
			}
			if (e.which == 68) { //d
				ploxfight.key_right = false;
			}
		});
	};

	ploxfight.stopControl = function () {
		$(document).off()
	};

	$("#restart").click(function (event) {
		ploxfight.game.stop();
		ploxfight.game = ploxfight.gameTest();
	});
})();
