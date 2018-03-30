const Component = require('./Component');
const {Vector} = require('./vector');
const {Point} = require('./point');
const {degreesToRadians} = require('./math');

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

class Transform extends Component {

  static builder() {
    return new TransformBuilder();
  }

  constructor(position, rotation, scale) {
    super('Transform');
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  getForwardVector() {
    let radians = degreesToRadians(this.rotation);
    let x = Math.sin(radians);
    let y = Math.cos(radians);
    return new Vector(x, y).normalize();
  }

}

module.exports = Transform;

class TransformBuilder {

  constructor() {
    this.position = new Point(0, 0);
    this.rotation = 0;
    this.scale = new Vector(1, 1);
  }

  withPosition(position) {
    this.position = position;
    return this;
  }

  withRotation(rotation) {
    this.rotation = rotation;
    return this;
  }

  withScale(scale) {
    this.scale = scale;
    return this;
  }

  build() {
    return new Transform(this.position, this.rotation, this.scale);
  }

}
