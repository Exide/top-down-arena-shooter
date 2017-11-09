const uuid = require('uuid/v4');
const Vector = require('victor');
const {degreesToRadians} = require('../../utils/math');

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
 *    360 ----+---- 90
 *            |
 *            |
 *           180
 */

class Entity {

  constructor(position, rotation) {
    this.id = uuid();
    this.position = position;
    this.rotationDegrees = rotation;
    
    this.degreesPerSecond = 360;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.distancePerSecond = 5;
    this.velocity = new Vector(0, 0);
    this.isThrustingForward = false;
    this.isThrustingBackward = false;
    this.hasChanged = false;
  }

  update(deltaTimeSeconds) {
    this.hasChanged = false;
    this.updatePosition(deltaTimeSeconds);
    this.updateRotation(deltaTimeSeconds);
  }

  updatePosition(deltaTimeSeconds) {
    if (this.isThrustingForward || this.isThrustingBackward) {
      let adjustedSpeed = 0;

      if (this.isThrustingForward) adjustedSpeed += this.distancePerSecond * deltaTimeSeconds;
      if (this.isThrustingBackward) adjustedSpeed -= this.distancePerSecond * deltaTimeSeconds;

      if (adjustedSpeed !== 0) {
        // determine forward vector
        let rotationRadians = degreesToRadians(this.rotationDegrees);
        let x = Math.sin(rotationRadians);
        let y = Math.cos(rotationRadians);
        let forward = new Vector(x, y);

        // get distance multiplier
        let distance = new Vector(adjustedSpeed, adjustedSpeed);

        // calculate change in position
        let translation = forward.multiply(distance);
        this.velocity.add(translation);
      }
    }

    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.position.add(this.velocity);
      this.hasChanged = true;
    }
  }

  updateRotation(deltaTimeSeconds) {
    let rotationChange = 0;
    let adjustedSpeed = this.degreesPerSecond * deltaTimeSeconds;

    if (this.isRotatingLeft) rotationChange -= adjustedSpeed;
    if (this.isRotatingRight) rotationChange += adjustedSpeed;

    this.rotationDegrees += rotationChange;
    if (rotationChange !== 0) this.hasChanged = true;

    if (this.rotationDegrees < 0) this.rotationDegrees += 360;
    if (this.rotationDegrees > 360) this.rotationDegrees -= 360;
  }

  serialize() {
    return `${this.id},${this.position.x},${this.position.y},${this.rotationDegrees}`;
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

exports.Entity = Entity;
