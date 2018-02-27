const vector = require('./vector');

exports.checkForSeparation = function (a, b) {
  let output = {
    a: a,
    b: b,
    aPoints: a.getPointsInWorldSpace(),
    bPoints: b.getPointsInWorldSpace()
  };
  let overlap = Number.MAX_VALUE;
  let smallest;
  let normals = [];
  normals.push(...a.getNormalsInWorldSpace());
  normals.push(...b.getNormalsInWorldSpace());
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
      if (o < overlap) {
        overlap = o;
        smallest = axis;
      }
    }
  }

  if (output.isColliding && smallest) {
    let mtv = vector.directionFromUnit(smallest, overlap);
    let v = {
      x: b.position.x - a.position.x,
      y: b.position.y - a.position.y
    };
    let dot = vector.dot(v, smallest);
    if (dot < 0) {
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
 * @param {[{x, y}]} points a list of 2d points
 * @param {{x, y}} axis a vector to project onto
 * @returns {{min, max}} location on the axis
 */
exports.project = (points, axis) => {
  let min = vector.dot(axis, points[0]);
  let max = min;

  for (let i = 1; i < points.length; i++) {
    let p = vector.dot(axis, points[i]);
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
