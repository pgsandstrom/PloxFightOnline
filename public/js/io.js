(function () {
	"use strict";
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.IO = function IO(renderer) {
		this.renderer = renderer;
	};

	var IO = ploxfight.IO;

	IO.prototype.start = function () {
		var thisIO = this;

		var socket = io();

		socket.on('start', function (msg) {
			//console.log("received start message!");
		});

		socket.on('update', function (msg) {
			//console.log("received update: " + msg);
			var object = $.parseJSON(msg);
			//console.log("the data is: ", JSON.stringify(object, null, 2));
			thisIO.renderer.render(object);

			// TODO: √r detta det b‰sta? En sendControl f√∂r varje update...
			ploxfight.sendMoves();
		});

		ploxfight.sendMoves = function () {

			var xForce = ploxfight.mouseX - ploxfight.canvasX;
			var yForce = ploxfight.mouseY - ploxfight.canvasY;

			var moves = {};

			//player motion:
			moves[ploxfight.MOVE_FORWARD] = ploxfight.key_forward;
			moves[ploxfight.MOVE_BACKWARD] = ploxfight.key_back;
			moves[ploxfight.MOVE_LEFT] = ploxfight.key_left;
			moves[ploxfight.MOVE_RIGHT] = ploxfight.key_right;
			moves[ploxfight.MOVE_HIT] = ploxfight.key_hit;
			moves[ploxfight.MOVE_JUMP] = ploxfight.key_jump;
			moves[ploxfight.MOUSE_X] = xForce;
			moves[ploxfight.MOUSE_Y] = yForce;

			ploxfight.key_hit = false;

			socket.emit('moves', moves);
		};

	};

})();