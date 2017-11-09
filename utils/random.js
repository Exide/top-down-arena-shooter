exports.getNumberBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

exports.getNumber = () => {
  return Math.random();
};
