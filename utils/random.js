exports.getRandomNumberBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

exports.getRandomNumber = () => {
  return Math.random();
};
