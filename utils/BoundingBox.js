const Component = require('./Component');
const {Point} = require('./point');
const {Edge} = require('./edge');
const {degreesToRadians} = require('./math');

class BoundingBox extends Component {

  static builder() {
    return new BoundingBoxBuilder();
  }

  constructor(width, height) {
    super('BoundingBox');
    this.width = width;
    this.height = height;
    this.points = [
      new Point(-(width/2), height/2),
      new Point(width/2, height/2),
      new Point(width/2, -height/2),
      new Point(-(width/2), width/2)
    ];
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
    let transform = this.parent.getComponent('Transform');
    return [
      new Point(transform.position.x - (this.width / 2), transform.position.y + this.height / 2),
      new Point(transform.position.x + (this.width / 2), transform.position.y + this.height / 2),
      new Point(transform.position.x + (this.width / 2), transform.position.y - this.height / 2),
      new Point(transform.position.x - (this.width / 2), transform.position.y - this.height / 2)
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
    let transform = this.parent.getComponent('Transform');
    let position = transform.position;
    let rotation = -degreesToRadians(transform.rotation);
    let x = Math.cos(rotation) * (p.x - position.x) - Math.sin(rotation) * (p.y - position.y) + position.x;
    let y = Math.sin(rotation) * (p.x - position.x) + Math.cos(rotation) * (p.y - position.y) + position.y;
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

module.exports = BoundingBox;

class BoundingBoxBuilder {

  constructor() {
    this.height = [];
  }

  withWidth(width) {
    this.width = width;
    return this;
  }

  withHeight(height) {
    this.height = height;
    return this;
  }

  build() {
    return new BoundingBox(this.width, this.height);
  }

}
