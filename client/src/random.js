export const getRandomNumberBetween = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const getRandomNumber = () => {
  return Math.random();
};
