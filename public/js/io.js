(function () {
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.IO = function IO(renderer) {
		this.renderer = renderer;
	};

	var IO = ploxfight.IO;

	IO.prototype.start = function () {
		var thisIO = this;

		var socket = io();
		//	$('form').submit(function () {
		//		socket.emit('chat message', $('#m').val());
		//		$('#m').val('');
		//		return false;
		//	});

		socket.on('start', function (msg) {
			console.log("received start message!");
			ploxfight.startControl();
		});

		socket.on('chat message', function (msg) {
			//console.log("received message: " + msg);
//		$('#messages').append($('<li>').text(msg));
		});

		socket.on('update', function (msg) {
			console.log("received update: " + msg);
			var object = $.parseJSON(msg);
			console.log("the data is: ", JSON.stringify(object, null, 2));
			thisIO.renderer.render(object);
		});

		//socket.emit('chat message', "rofl");

		ploxfight.sendControl = function () {
			var moves = {};

			//player motion:
			moves[ploxfight.MOVE_FORWARD] = ploxfight.key_forward;
			moves[ploxfight.MOVE_BACKWARD] = ploxfight.key_back;
			moves[ploxfight.MOVE_LEFT] = ploxfight.key_left;
			moves[ploxfight.MOVE_RIGHT] = ploxfight.key_right;
			moves[ploxfight.MOVE_HIT] = ploxfight.key_hit;
		};

	};

})();