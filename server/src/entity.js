const uuid = require('uuid/v4');

class Entity {
  
  constructor(position, rotation) {
    this.id = uuid();
    this.position = position;
    this.rotation = rotation;
    
    this.rotationSpeed = 0.1;
    this.isRotatingLeft = false;
    this.isRotatingRight = false;
    this.hasChangedOrientation = false;
  }

  update() {
    this.hasChangedOrientation = false;
    
    if (this.isRotatingLeft) {
      this.rotation -= this.rotationSpeed;
      this.hasChangedOrientation = true;
    }

    if (this.isRotatingRight) {
      this.rotation += this.rotationSpeed;
      this.hasChangedOrientation = true;
    }
  }

  serialize() {
    return `${this.id},${this.position.join(',')},${this.rotation}`;
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
