exports.RelativeDirection = Object.freeze({
  Left: Symbol.for('Left'),
  Right: Symbol.for('Right'),
  Up: Symbol.for('Up'),
  Down: Symbol.for('Down'),
  Forward: Symbol.for('Forward'),
  Backward: Symbol.for('Backward')
});

exports.degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

exports.radiansToDegrees = (radians) => {
  return radians * (180 / Math.PI);
};

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
