const Component = require('./Component');
const {degreesToRadians} = require('./math');
const {Vector} = require('./vector');

class Thruster extends Component {

  static builder() {
    return new ThrusterBuilder();
  }

  constructor(distancePerSecond, degreesPerSecond, maximumVelocity) {
    super('Thruster');
    this.isThrustingForward = false;
    this.isThrustingBackward = false;
    this.distancePerSecond = distancePerSecond;
    this.isRotatingRight = false;
    this.isRotatingLeft = false;
    this.degreesPerSecond = degreesPerSecond;
    this.maximumVelocity = maximumVelocity;
  }

  update(deltaTimeSeconds) {
    let positionChanged = this.updatePosition(deltaTimeSeconds);
    let rotationChanged = this.updateRotation(deltaTimeSeconds);
    return positionChanged || rotationChanged;
  }

  updatePosition(deltaTimeSeconds) {
    if (this.isThrustingForward || this.isThrustingBackward) {
      let transform = this.parent.getComponent('Transform');
      let rigidBody = this.parent.getComponent('RigidBody');
      let distanceChange = 0;

      if (this.isThrustingForward) {
        distanceChange += this.distancePerSecond * deltaTimeSeconds;
      }

      if (this.isThrustingBackward) {
        distanceChange -= this.distancePerSecond * deltaTimeSeconds;
      }

      if (distanceChange !== 0) {
        // determine forward vector
        let rotationRadians = degreesToRadians(transform.rotation);
        let x = Math.sin(rotationRadians);
        let y = Math.cos(rotationRadians);
        let forward = new Vector(x, y);

        // get distance multiplier
        let distance = new Vector(distanceChange, distanceChange);

        // calculate change in position
        let translation = forward.multiply(distance);
        rigidBody.velocity.add(translation);

        // enforce maximum velocity
        if (rigidBody.velocity.magnitude() > this.maximumVelocity) {
          rigidBody.velocity.normalize().multiplyScalar(this.maximumVelocity);
        }

        return true;
      }
    }

    return false;
  }

  updateRotation(deltaTimeSeconds) {
    if (this.isRotatingLeft || this.isRotatingRight) {
      let transform = this.parent.getComponent('Transform');
      let degreesChange = 0;

      if (this.isRotatingLeft) {
        degreesChange -= this.degreesPerSecond * deltaTimeSeconds;
      }

      if (this.isRotatingRight) {
        degreesChange += this.degreesPerSecond * deltaTimeSeconds;
      }

      if (degreesChange !== 0) {
        transform.rotation += degreesChange;
        if (transform.rotation < 0) transform.rotation += 360;
        if (transform.rotation > 360) transform.rotation -= 360;
        return true;
      }
    }

    return false;
  }

  startRotating(direction) {
    if (direction !== 'left' && direction !== 'right')
      throw new Error('the "direction" parameter must be "left" or "right"');

    if (direction === 'left' && this.isRotatingLeft === false)
      this.isRotatingLeft = true;

    if (direction === 'right' && this.isRotatingRight === false)
      this.isRotatingRight = true;
  }

  stopRotating(direction) {
    if (direction !== 'left' && direction !== 'right')
      throw new Error('the "direction" parameter must be "left" or "right"');

    if (direction === 'left' && this.isRotatingLeft === true)
      this.isRotatingLeft = false;

    if (direction === 'right' && this.isRotatingRight === true)
      this.isRotatingRight = false;
  }

  startThrusting(direction) {
    if (direction !== 'forward' && direction !== 'backward')
      throw new Error('the "direction" parameter must be "forward" or "backward"');

    if (direction === 'forward' && this.isThrustingForward === false)
      this.isThrustingForward = true;

    if (direction === 'backward' && this.isThrustingBackward === false)
      this.isThrustingBackward = true;
  }

  stopThrusting(direction) {
    if (direction !== 'forward' && direction !== 'backward')
      throw new Error('the "direction" parameter must be "forward" or "backward"');

    if (direction === 'forward' && this.isThrustingForward === true)
      this.isThrustingForward = false;

    if (direction === 'backward' && this.isThrustingBackward === true)
      this.isThrustingBackward = false;
  }

}

module.exports = Thruster;

class ThrusterBuilder {

  constructor() {
    this.distancePerSecond = 5;
    this.degreesPerSecond = 360;
    this.maximumVelocity = 5;
  }

  withDistancePerSecond(distance) {
    this.distancePerSecond = distance;
    return this;
  }

  withDegreesPerSecond(degrees) {
    this.degreesPerSecond = degrees;
    return this;
  }

  withMaximumVelocity(max) {
    this.maximumVelocity = max;
    return this;
  }

  build() {
    return new Thruster(this.distancePerSecond, this.degreesPerSecond, this.maximumVelocity);
  }

}
