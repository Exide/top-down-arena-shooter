const {Vector} = require('./vector');
const {Point} = require('./point');

exports.checkForSeparation = function (a, b) {
  // todo: remove this migration code
  let aPoints, aNormals;
  try {
    aPoints = a.getPointsInWorldSpace();
    if (aPoints === undefined) throw new TypeError();
    aNormals = a.getEdgeNormals();
    if (aNormals === undefined) throw new TypeError();
  } catch (error) {
    aPoints = a.getComponent('BoundingBox').getPointsInWorldSpace();
    aNormals = a.getComponent('BoundingBox').getEdgeNormals();
  }

  // todo: remove this migration code
  let bPoints, bNormals;
  try {
    bPoints = b.getPointsInWorldSpace();
    if (bPoints === undefined) throw new TypeError();
    bNormals = b.getEdgeNormals();
    if (bNormals === undefined) throw new TypeError();
  } catch (error) {
    bPoints = a.getComponent('BoundingBox').getPointsInWorldSpace();
    bNormals = b.getComponent('BoundingBox').getEdgeNormals();
  }

  let isColliding = false;
  let smallestOverlap = Number.MAX_VALUE;
  let closestAxis;
  let normals = [];
  normals.push(...aNormals);
  normals.push(...bNormals);
  normals.map(v => v.normalize());
  let axes = normals.filter(this.removeDuplicates);

  for (let i = 0; i < axes.length; i++) {
    let axis = axes[i];
    let p1 = this.project(aPoints, axis);
    let p2 = this.project(bPoints, axis);

    if (!this.overlaps(p1, p2)) {
      isColliding = false;
      break;
    } else {
      isColliding = true;
      let o = this.getOverlap(p1, p2);
      if (o < smallestOverlap) {
        smallestOverlap = o;
        closestAxis = axis;
      }
    }
  }

  let mtv;

  if (isColliding && closestAxis) {
    mtv = closestAxis.denormalize(smallestOverlap);

    // todo: remove this migration code
    let aPosition;
    try {
      aPosition = a.position;
      if (aPosition === undefined) throw new TypeError();
    } catch (error) {
      aPosition = a.getComponent('Transform').position;
    }

    // todo: remove this migration code
    let bPosition;
    try {
      bPosition = b.position;
      if (bPosition === undefined) throw new TypeError();
    } catch (error) {
      bPosition = b.getComponent('Transform').position;
    }

    let aToB = bPosition.clone().subtract(aPosition);
    let product = aToB.dot(closestAxis);
    if (product > 0) {
      mtv = mtv.invert();
    }
  }

  return {
    a: a,
    b: b,
    isColliding: isColliding,
    mtv: mtv
  };
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
