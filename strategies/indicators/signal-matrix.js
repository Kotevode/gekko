const _ = require('lodash');

const CandleBatcher = require('../../core/candleBatcher');
const AsyncIndicatorRunner = require('../../plugins/tradingAdvisor/asyncIndicatorRunner');

/**

config = {
	_5m: 5,
	_1h: 60,
	_5h: 300,
	_1d: 1440,
    ...
}

*/

function promisedProperties(object) {

  let promisedProperties = [];
  const objectKeys = Object.keys(object);

  objectKeys.forEach((key) => promisedProperties.push(object[key]));

  return Promise.all(promisedProperties)
    .then((resolvedValues) => {
      return resolvedValues.reduce((resolvedObject, property, index) => {
        resolvedObject[objectKeys[index]] = property;
        return resolvedObject;
      }, object);
    });

}

function SignalMatrix(timeframes) {
	this.result = {}
	this.rows = {}

	_.each(timeframes, function(candleSize, name) {
		let batcher = new CandleBatcher(candleSize);
		let runner = new AsyncIndicatorRunner();
		this.rows[name] = {
			batcher: batcher,
			runner: runner
		}
	}, this);
}

SignalMatrix.prototype.processCandle = function(candle, key) {
	const runner = this.rows[key].runner;
	return new Promise((resolve, reject) => {
		runner.processCandle(candle, function() {
			var indicators = Object.assign(
				{},
				runner.asyncIndicators,
				runner.talibIndicators,
				runner.tulipIndicators
			);
			var result = {}
			result = _.reduce(indicators, (result, i, k) => {
				result[k] = i.result;
				return result
			}, {});
			resolve(result);
		})
	})
}

SignalMatrix.prototype.update = function(candle, cb) {
	var promises = {};
	_.forEach(this.rows, function(row, key) {
		if (row.batcher.write([candle])) {
			const candle = row.batcher.calculatedCandles.pop();
			promises[key] = this.processCandle(candle, key);
		}
	}, this);
	if (!_.size(promises)) {
		cb(null, this.result);
		return
	}
	return promisedProperties(promises)
		.then((result) => {
			cb(null, Object.assign(
				this.result,
				result
			));
		}, this);
}

SignalMatrix.prototype.addTalibIndicator = function(name, type, parameters) {
	_.forEach(this.rows, (r) => {
		r.runner.addTalibIndicator(name, type, parameters);
	}, this)
}

module.exports = SignalMatrix;
