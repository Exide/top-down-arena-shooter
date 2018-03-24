const Component = require('./Component');
const {Vector} = require('./vector');

class RigidBody extends Component {

  static builder() {
    return new RigidBodyBuilder();
  }

  constructor(velocity) {
    super('RigidBody');
    this.velocity = velocity;
  }

  update(deltaTimeSeconds) {
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      let transform = this.parent.getComponent('Transform');
      transform.position.add(this.velocity);
      return true;
    } else {
      return false;
    }
  }

}

module.exports = RigidBody;

class RigidBodyBuilder {

  constructor() {
    this.velocity = new Vector(0, 0);
  }

  withVelocity(velocity) {
    this.velocity = velocity;
    return this;
  }

  build() {
    return new RigidBody(this.velocity);
  }

}
