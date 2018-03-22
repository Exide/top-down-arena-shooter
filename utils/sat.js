const {Vector} = require('./vector');
const {Point} = require('./point');

exports.checkForSeparation = function (a, b) {
  let output = {
    a: a,
    b: b,
    aPoints: a.getPointsInWorldSpace(),
    bPoints: b.getPointsInWorldSpace(),
    aNormals: a.getEdgeNormals(),
    bNormals: b.getEdgeNormals()
  };
  let smallestOverlap = Number.MAX_VALUE;
  let closestAxis;
  let normals = [];
  normals.push(...output.aNormals);
  normals.push(...output.bNormals);
  normals.map(v => v.normalize());
  let axes = normals.filter(this.removeDuplicates);

  for (let i = 0; i < axes.length; i++) {
    let axis = axes[i];
    let p1 = this.project(output.aPoints, axis);
    let p2 = this.project(output.bPoints, axis);

    if (!this.overlaps(p1, p2)) {
      output.isColliding = false;
      break;
    } else {
      output.isColliding = true;
      let o = this.getOverlap(p1, p2);
      if (o < smallestOverlap) {
        smallestOverlap = o;
        closestAxis = axis;
      }
    }
  }

  if (output.isColliding && closestAxis) {
    let mtv = closestAxis.denormalize(smallestOverlap);
    let aToB = b.position.clone().subtract(a.position);
    let product = aToB.dot(closestAxis);
    if (product > 0) {
      mtv = mtv.invert();
    }
    output.mtv = mtv;
  }

  return output;
};

exports.removeDuplicates = (normal, index, self) => {
  return self.findIndex(n => n.x === normal.x && n.y === normal.y) === index;
};

/**
 * Projects each point onto the axis and returns the minimum and maximum values.
 *
 * @param {[Point]} points
 * @param {Vector} axis
 * @returns {{min, max}} location on the axis
 */
exports.project = (points, axis) => {
  let min = axis.dot(points[0]);
  let max = min;

  for (let i = 1; i < points.length; i++) {
    let p = axis.dot(points[i]);
    if (p < min) {
      min = p;
    } else if (p > max) {
      max = p;
    }
  }

  return {min: min, max: max};
};

/**
 * Checks if two projections on the same axis are overlapping.
 *
 * @param a first entity projection
 * @param b second entity projection
 * @returns {boolean}
 */
exports.overlaps = (a, b) => {
  return !(b.max < a.min || a.max < b.min);
};

/**
 * Determines how much overlap exists between two projections on the same axis.
 *
 * @param a first entity projection
 * @param b second entity projection
 * @returns {number} amount of overlap
 */
exports.getOverlap = (a, b) => {
  return (a.max < b.max) ? a.max - b.min : b.max - a.min;
};
