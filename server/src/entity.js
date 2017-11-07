const uuid = require('uuid/v4');

class Entity {

  constructor(position, rotation) {
    this.id = uuid();
    this.position = position;
    this.rotationDegrees = rotation;
    
    this.degreesPerSecond = 360;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.hasChanged = false;
  }

  update(deltaTimeSeconds) {
    let rotationChange = 0;
    let adjustedSpeed = this.degreesPerSecond * deltaTimeSeconds;

    if (this.isRotatingLeft) rotationChange -= adjustedSpeed;
    if (this.isRotatingRight) rotationChange += adjustedSpeed;

    this.hasChanged = rotationChange !== 0;
    this.rotationDegrees += rotationChange;

    if (this.rotationDegrees < 0) this.rotationDegrees += 360;
    if (this.rotationDegrees > 360) this.rotationDegrees -= 360;
  }

  serialize() {
    return `${this.id},${this.position.join(',')},${this.rotationDegrees}`;
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

}

exports.Entity = Entity;
