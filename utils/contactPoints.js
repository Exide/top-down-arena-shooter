const {Edge} = require('./edge');

// implementation based on http://www.dyn4j.org/2011/11/contact-points-using-clipping/

exports.findBestEdge = function (points, translation) {
  let indexOfFurthestPoint;
  let min = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; ++i) {
    let projection = points[i].dot(translation);
    if (projection < min) {
      min = projection;
      indexOfFurthestPoint = i;
    }
  }

  let point = points[indexOfFurthestPoint];
  let nextPoint = getNextPoint(points, indexOfFurthestPoint);
  let previousPoint = getPreviousPoint(points, indexOfFurthestPoint);

  let rightVector = point.clone().subtract(nextPoint);
  let leftVector = point.clone().subtract(previousPoint);

  let rightProjection = rightVector.dot(translation);
  let leftProjection = leftVector.dot(translation);

  if (leftProjection >= rightProjection) {
    return new Edge(previousPoint, point);
  } else {
    return new Edge(point, nextPoint);
  }
};

function getNextPoint(points, index) {
  if (index === points.length - 1) {
    return points[0];
  } else {
    return points[index + 1];
  }
}

function getPreviousPoint(points, index) {
  if (index === 0) {
    return points[points.length - 1];
  } else {
    return points[index - 1];
  }
}
