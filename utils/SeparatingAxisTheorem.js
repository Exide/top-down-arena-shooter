const Vector = require('victor');

exports.test = function (a, b) {
  let output = [];

  let normals = [];
  normals.push(...a.getNormalsInWorldSpace());
  normals.push(...b.getNormalsInWorldSpace());

  for (let i = 0; i < normals.length; ++i) {
    let result = getEntitiesOnAxis(a, b, normals[i]);
    output.push(result);

    // if (result.overlap < 0) {
    //   return output;
    // }
  }

  // let absoluteOverlap = Math.abs(output.overlap);
  // if (absoluteOverlap < response['overlap']) {
  //   response['overlap'] = absoluteOverlap;
  //   response['overlapN'].copy(axis);
  //   if (overlap < 0) {
  //     response['overlapN'].reverse();
  //   }
  // }

  return output;
};

function getEntitiesOnAxis(a, b, axis) {
  let output = {
    axis: axis,
    overlap: 0,
    aInB: false,
    bInA: false
  };

  let aPoints = a.getPointsInWorldSpace();
  let bPoints = b.getPointsInWorldSpace();

  let aRangeOnAxis = output.a = projectPointsOnAxis(aPoints, axis);
  let bRangeOnAxis = output.b = projectPointsOnAxis(bPoints, axis);

  let offset = b.position.subtract(a.position);
  let projectedOffset = offset.dot(axis);
  bRangeOnAxis = offsetRange(bRangeOnAxis, projectedOffset);

  if (aRangeOnAxis.min > bRangeOnAxis.max || bRangeOnAxis.min > aRangeOnAxis.max) {
    output.overlap = getShortestOverlap(aRangeOnAxis, bRangeOnAxis);
    return output;
  }

  if (aRangeOnAxis.min < bRangeOnAxis.min) {
    // A is left of B
    if (aRangeOnAxis.max < bRangeOnAxis.max) {
      output.overlap = aRangeOnAxis.max - bRangeOnAxis.min;
    } else {
      // B completely inside A
      output.overlap = getShortestOverlap(aRangeOnAxis, bRangeOnAxis);
      output.bInA = true;
    }
  } else {
    // B is left of A
    if (aRangeOnAxis.max > bRangeOnAxis.max) {
      output.overlap = aRangeOnAxis.min - bRangeOnAxis.max;
    } else {
      // A completely inside B
      output.overlap = getShortestOverlap(aRangeOnAxis, bRangeOnAxis);
      output.aInB = true;
    }
  }

  return output;
}

function getShortestOverlap(aRange, bRange) {
  let option1 = aRange.max - bRange.min;
  let option2 = bRange.max - aRange.min;
  return option1 < option2 ? option1 : -option2;
}

function projectPointsOnAxis(points, axis) {
  let min = Number.MAX_VALUE;
  let max = -Number.MAX_VALUE;
  points.forEach(point => {
    let dot = new Vector(point.x, point.y).dot(axis);
    console.log('projectedPoint:', dot);
    if (dot < min) { min = dot; }
    if (dot > max) { max = dot; }
  });
  return {
    min: min,
    max: max
  }
}

function offsetRange(range, offset) {
  return {
    min: range.min + offset,
    max: range.max + offset
  }
}
