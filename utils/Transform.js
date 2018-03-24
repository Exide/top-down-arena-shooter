const Component = require('./Component');
const {Vector} = require('./vector');
const {Point} = require('./point');

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
