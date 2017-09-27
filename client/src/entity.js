export class Entity {

  constructor(id, position, rotation) {
    this.id = id;
    this.setPosition(position);
    this.setRotation(rotation);
  }
  
  setPosition(position) {
    this.position = position;
  }
  
  setRotation(rotation) {
    this.rotation = rotation;
  }
  
  getPosition() {
    return this.position;
  }
  
  getRotation() {
    return this.rotation;
  }

}