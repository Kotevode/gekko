const _ = require('lodash');

const CandleBatcher = require('../core/candleBatcher');
const SignalMatrix = require('./indicators/signal-matrix');

var log = require('../core/log');

var strat = {};

var maSig = (tf) => {
	if (tf.ma30.outReal > tf.ma50.outReal && tf.ma50.outReal > tf.ma70.outReal)
		return 1
	else if (tf.ma30.outReal < tf.ma50.outReal && tf.ma50.outReal < tf.ma70.outReal)
		return -1;
	else
		return 0;
}

var adxSig = (tf) => {
	if (tf.adx.outReal > 15)
		if (tf.plus_di.outReal > tf.minus_di.outReal)
			return 1;
		else
			return -1;
	else
		return 0;
}

var rsiSig = (tf) => {
	if (tf.rsi.outReal < 30)
		return 1;
	else if (tf.rsi.outReal > 70)
		return -1;
	else
		return 0;
}

var stochrsiSig = (tf) => {
	if (tf.stochrsi.outFastK < 20 && tf.stochrsi.outFastD < 20)
		return 1;
	else if (tf.stochrsi.outFastK > 80 && tf.stochrsi.outFastD > 80)
		return -1;
	else
		return 0;
}

var cdlSigs = (tf) => {
	return _.reduce(tf, (cdl, i, k) => {
		if (!/cdl.+/.test(k))
			return cdl;
		cdl[k] = i.outInteger / 100;
		return cdl;
	}, {})
}

var normalize = (results) => {
	return _.reduce(results, (normalized, tf, key) => {
		var signals = {
			ma: maSig(tf),
			adx: adxSig(tf),
			rsi: rsiSig(tf),
			stochrsi: stochrsiSig(tf)
		};
		signals = Object.assign(
			signals,
			cdlSigs(tf)
		);
		normalized[key] = signals;
		return normalized;
	}, {})
}
// Prepare everything our strat needs
strat.init = function() {
	let matrix = new SignalMatrix({
		_1m: 1,
		_5m: 5,
		_10m: 10,
		_15m: 15,
		_30m: 30,
		_45m: 45,
		_1h: 60,
		_3h: 180,
		_5h: 300,
		_12h: 720,
		_1d: 1440
	})
	this.requiredHistory = 60 * 24 * 70;
	this.addIndicators(matrix);
	this.addAsyncIndicator('matrix', matrix);
}

strat.addIndicators = function(matrix) {
	matrix.addTalibIndicator('ma30', 'ma', {
		optInTimePeriod: 30,
		optInMAType: 0
	});
	matrix.addTalibIndicator('ma50', 'ma', {
		optInTimePeriod: 50,
		optInMAType: 0
	});
	matrix.addTalibIndicator('ma70', 'ma', {
		optInTimePeriod: 70,
		optInMAType: 0
	});
	matrix.addTalibIndicator('adx', 'adx', {
		optInTimePeriod: 14
	})
	matrix.addTalibIndicator('plus_di', 'plus_di', {
		optInTimePeriod: 14
	})
	matrix.addTalibIndicator('minus_di', 'minus_di', {
		optInTimePeriod: 14
	})
	matrix.addTalibIndicator('rsi', 'rsi', {
		optInTimePeriod: 14
	});
	matrix.addTalibIndicator('stochrsi', 'stochrsi', {
		optInTimePeriod: 14,
		optInFastK_Period: 5,
		optInFastD_Period: 3,
		optInFastD_MAType: 0
	});
	matrix.addTalibIndicator('cdlabandonedbaby', 'cdlabandonedbaby', {
		optInPenetration: 0.3
	});
	matrix.addTalibIndicator('cdldoji', 'cdldoji');
	matrix.addTalibIndicator('cdldojistar', 'cdldojistar');
	matrix.addTalibIndicator('cdleveningdojistar', 'cdleveningdojistar', {
		optInPenetration: 0.3
	});
	matrix.addTalibIndicator('cdlhammer', 'cdlhammer');
	matrix.addTalibIndicator('cdlhangingman', 'cdlhangingman');
	matrix.addTalibIndicator('cdlinneck', 'cdlinneck');
	matrix.addTalibIndicator('cdlinvertedhammer', 'cdlinvertedhammer');
	matrix.addTalibIndicator('cdlkickingbylength', 'cdlkickingbylength');
	matrix.addTalibIndicator('cdlladderbottom', 'cdlladderbottom');
	matrix.addTalibIndicator('cdlmorningdojistar', 'cdlmorningdojistar', {
		optInPenetration: 0.3
	});
	matrix.addTalibIndicator('cdlonneck', 'cdlonneck');
	matrix.addTalibIndicator('cdlshootingstar', 'cdlshootingstar');
	matrix.addTalibIndicator('cdltristar', 'cdltristar');
	matrix.addTalibIndicator('cdlxsidegap3methods', 'cdlxsidegap3methods');
}

// What happens on every new candle?
strat.update = function(candle) {
	// log.info(candle.start);
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
	log.info(normalize(this.asyncIndicators.matrix.result));
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
