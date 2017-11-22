exports.centeredToTopLeft = (x, y, width, height) => {
  return {
    x: x + (width / 2),
    y: -y + (height / 2)
  }
};

exports.topLeftToCentered = (x, y, width, height) => {
  return {
    x: x - (width / 2),
    y: -y + (height / 2)
  }
};
