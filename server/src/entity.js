const uuid = require('uuid/v4');
const {degreesToRadians} = require('../../utils/math');
const {Point} = require('../../utils/point');
const {Edge} = require('../../utils/edge');

/**
 *  Game axes (centered origin):
 *
 *           +Y
 *            |
 *            |
 *     -X ----0---- +X
 *            |
 *            |
 *           -Y
 *
 *  Game rotation (degrees):
 *
 *     -r <-- 0 --> +r
 *            |
 *            |
 *    270 ----+---- 90
 *            |
 *            |
 *           180
 */

const EntityType = Object.freeze({
  WALL: Symbol.for('Wall'),
  ASTEROID: Symbol.for('Asteroid')
});

exports.EntityType = EntityType;

class Entity {

  /**
   * @param {EntityType} type
   * @param {Point} position
   * @param {Number} rotation orientation in degrees
   * @param {Number} width
   * @param {Number} height
   */
  constructor(type, position, rotation, width, height) {
    this.id = uuid();
    this.type = type;
    this.position = position;
    this.rotationDegrees = rotation;
    this.width = width;
    this.height = height;
    this.hasChanged = false;
  }

  update(deltaTimeSeconds) {
  }

  serialize() {
    return `${this.id},${Symbol.keyFor(this.type)},${this.position.x},${this.position.y},${this.rotationDegrees},${this.width},${this.height}`;
  }

  /**
   *  Sprite points:
   *  
   *    1-----2   Note:
   *    |  ^  |     - Clockwise winding
   *    |     |     - Starts at the "front left" point
   *    4-----3
   */

  /**
   *  Returns four points in local space that make up the entity's sprite. Starts with the front left point and unwinds in clockwise order.
   */
  getPointsInLocalSpace() {
    return [
      new Point(this.position.x - (this.width / 2), this.position.y + this.height / 2),
      new Point(this.position.x + (this.width / 2), this.position.y + this.height / 2),
      new Point(this.position.x + (this.width / 2), this.position.y - this.height / 2),
      new Point(this.position.x - (this.width / 2), this.position.y - this.height / 2)
    ];
  }

  /**
   *  Returns four points in world space that make up the entity's sprite. Starts with the front left point and unwinds in clockwise order.
   */
  getPointsInWorldSpace() {
    return this.getPointsInLocalSpace().map(p => this.getPointInWorldSpace(p));
  }

  /**
   *  Returns a point in world space relative to the entity's position and rotation.
   */
  getPointInWorldSpace(p) {
    // See: https://math.stackexchange.com/a/814981
    let rotation = -degreesToRadians(this.rotationDegrees);
    let x = Math.cos(rotation) * (p.x - this.position.x) - Math.sin(rotation) * (p.y - this.position.y) + this.position.x;
    let y = Math.sin(rotation) * (p.x - this.position.x) + Math.cos(rotation) * (p.y - this.position.y) + this.position.y;
    return new Point(x, y);
  }

  /**
   *  Returns four edges in world space that correspond to the entity's sprite edges. Starts with the front edge and unwinds clockwise. 
   */
  getEdgesInWorldSpace() {
    let points = this.getPointsInWorldSpace();
    let edges = [];
    for (let i = 0; i < points.length; ++i) {
      let p1 = points[i];
      let p2 = i < points.length - 1 ? points[i + 1] : points[0];
      edges.push(new Edge(p1, p2));
    }
    return edges;
  }

  /**
   *  Returns four outer normals in world space relative to entity's sprite edges. Starts with the front edge and unwinds in clockwise order.
   */
  getEdgeNormals() {
    return this.getEdgesInWorldSpace().map(edge => edge.toLeftNormal());
  }

}

exports.Entity = Entity;
