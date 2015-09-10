var game = require('./game');

var create = function (gameHolder) {
	var eventTrigger = function (game) {
		//TODO: denna ska gå på tid, inte tics...
		//if (game.tic.ticCount % 100 === 0) {
		//	game.players.push(this.newOpponent());
		//}
	};

	return new game.newGame(gameHolder, eventTrigger);
};


exports.create = create;