const Vector = require('victor');

exports.rightNormal = function(vector) {
  return new Vector(vector.y, -vector.x);
};

exports.leftNormal = function(vector) {
  return this.rightNormal(vector).invert();
};
