const CandleBatcher = require('../core/candleBatcher');

var log = require('../core/log');

var strat = {};

// Prepare everything our strat needs
strat.init = function() {
	const timeframes = [
		1, 5, 10, 15, 30, 45, 60, 180, 300, 720, 1440
	]

	this.batchers = timeframes.map(function(frame) {
		var batcher = new CandleBatcher(frame);
		batcher.on('candle', this.updateTF);
		return batcher;
	}, this);
}

strat.updateTF = function(candle, candleSize) {
	log.info(candle.close + " " + candleSize + " mins")
}

// What happens on every new candle?
strat.update = function(candle) {
	this.batchers.forEach(b => {
		b.write([candle]);
		b.flush();
	});
}

strat.updateAll = function(candle) {
	log.info("update all");
}

// For debugging purposes.
strat.log = function() {
	log.info("Batcher");
}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function(candle) {
  // your code!
}

// Optional for executing code
// after completion of a backtest.
// This block will not execute in
// live use as a live gekko is
// never ending.
strat.end = function() {
  // your code!
}

module.exports = strat;
