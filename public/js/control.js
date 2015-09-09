(function () {
	var ploxfight = window.ploxfight = window.ploxfight || {};

	ploxfight.MOVE_FORWARD = "MOVE_FORWARD";
	ploxfight.MOVE_BACKWARD = "MOVE_BACKWARD";
	ploxfight.MOVE_LEFT = "MOVE_LEFT";
	ploxfight.MOVE_RIGHT = "MOVE_RIGHT";
	ploxfight.MOVE_HIT = "MOVE_HIT";


	ploxfight.startControl = function () {

		$(document).click(function (event) {
			console.log("click");
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

//$("#restart").click(function (event) {
//	ploxfight.game.stop();
//	ploxfight.game = ploxfight.gameTest();
//});

})();