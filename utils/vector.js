const Vector = require('victor');

exports.leftNormal = function(direction) {
  let origin = {x: 0, y: 0};
  let x = -(direction.y - origin.y);
  let y = direction.x - origin.x;
  return new Vector(x, y);
};

exports.dot = function(a, b) {
  return new Vector(a.x, a.y).dot(new Vector(b.x, b.y));
};

exports.normalize = function(vector) {
  return new Vector(vector.x, vector.y).normalize();
};
