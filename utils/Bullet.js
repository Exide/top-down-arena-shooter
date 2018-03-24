const uuid = require('uuid/v4');
const Transform = require('./Transform');
const BoundingBox = require('./BoundingBox');
const RigidBody = require('./RigidBody');
const Material = require('./Material');

class Bullet {

  static builder() {
    return new BulletBuilder();
  }

  constructor(transform, boundingBox, rigidBody, material) {
    this.id = uuid();
    this.name = 'Bullet';
    this.transform = transform;
    this.boundingBox = boundingBox;
    this.rigidBody = rigidBody;
    this.material = material;
    this.hasChanged = false;
  }

  serialize() {
    return `${this.id},${this.name},${this.transform.position.x},${this.transform.position.y},${this.transform.rotation},${this.boundingBox.width},${this.boundingBox.height}`;
  }

  update(deltaTimeSeconds) {
    this.hasChanged = false;
    let transformUpdated = this.transform.update(deltaTimeSeconds);
    let boundingBoxUpdated = this.boundingBox.update(deltaTimeSeconds);
    let rigidBodyUpdated = this.rigidBody.update(deltaTimeSeconds);
    let materialUpdated = this.material.update(deltaTimeSeconds);
    this.hasChanged = transformUpdated || boundingBoxUpdated || rigidBodyUpdated || materialUpdated;
  }

}

module.exports = Bullet;

class BulletBuilder {

  constructor() {
    this.transform = Transform.builder().build();
    this.boundingBox = BoundingBox.builder().build();
    this.rigidBody = RigidBody.builder().build();
    this.material = Material.builder().build();
  }

  withTransform(transform) {
    this.transform = transform;
    return this;
  }

  withBoundingBox(boundingBox) {
    this.boundingBox = boundingBox;
    return this;
  }

  withRigidBody(rigidBody) {
    this.rigidBody = rigidBody;
    return this;
  }

  withMaterial(material) {
    this.material = material;
    return this;
  }

  build() {
    return new Bullet(this.transform, this.boundingBox, this.rigidBody, this.material);
  }

}
