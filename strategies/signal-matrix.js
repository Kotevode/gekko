const CandleBatcher = require('../core/candleBatcher');
const SignalMatrix = require('./indicators/signal-matrix');

var log = require('../core/log');

var strat = {};

// Prepare everything our strat needs
strat.init = function() {
	let matrix = new SignalMatrix({
		"1m": 1,
		"5m": 5,
		"15m": 15,
	})
	matrix.addTalibIndicator('ma', 'ma', {
		optInTimePeriod: 14,
		optInMAType: 0
	});
	matrix.addTalibIndicator('rsi', 'rsi', {
		optInTimePeriod: 14
	});
	this.addAsyncIndicator('matrix', matrix);
}

// What happens on every new candle?
strat.update = function(candle) {
}

// For debugging purposes.
strat.log = function() {
}

// Based on the newly calculated
// information, check if we should
// update or not.
strat.check = function(candle) {
	log.info(candle.start);
	log.info(this.asyncIndicators.matrix.result);
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
