exports.getNumberBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

exports.getNumber = () => {
  return Math.random();
};

exports.getNumberInSeries = function () {
  let series = Array.prototype.slice.call(arguments, 1);
  return series[Math.floor(Math.random() * series.length)];
};

exports.flipCoin = function () {
  return Math.random() > 0.50;
};
