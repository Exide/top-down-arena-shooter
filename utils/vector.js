const Vector = require('victor');

exports.rightNormal = function(vector) {
  return new Vector(vector.y, -vector.x);
};

exports.leftNormal = function(vector) {
  return this.rightNormal(vector).invert();
};

exports.dot = function(a, b) {
  return new Vector(a.x, a.y).dot(new Vector(b.x, b.y));
};

exports.normalize = function(vector) {
  return new Vector(vector.x, vector.y).normalize();
};
