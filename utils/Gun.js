const moment = require('moment');
const {Point} = require('./point');
const Component = require('./Component');
const GameObject = require('./GameObject');
const Transform = require('./Transform');
const BoundingBox = require('./BoundingBox');
const RigidBody = require('./RigidBody');
const Material = require('./Material');
const EntityService = require('../server/src/EntityService');
const NetworkService = require('../server/src/NetworkService');

class Gun extends Component {

  static builder() {
    return new GunBuilder();
  }

  constructor(muzzleVelocity, rateOfFire) {
    super('Gun');
    this.muzzleVelocity = muzzleVelocity;
    this.rateOfFire = rateOfFire;
    this.isFiring = false;
    this.lastShotFired = moment.utc();
  }

  update(deltaTimeSeconds) {
    if (this.isFiring) {
      let msSinceLastShotFired = moment.utc().diff(this.lastShotFired);
      let msBetweenShots = 1000 / this.rateOfFire;
      if (msSinceLastShotFired > msBetweenShots) {
        this.lastShotFired = moment.utc();
        let bullet = this.createBullet();
        console.log('bullet created:', bullet);
        EntityService.get().add(bullet);
        NetworkService.get().broadcast(`add|${bullet.serialize()}`);
      }
    }
  }

  createBullet() {
    let shipTransform = this.parent.getComponent('Transform');
    let shipBoundingBox = this.parent.getComponent('BoundingBox');
    let shipRigidBody = this.parent.getComponent('RigidBody');

    let bullet = new GameObject('Bullet');

    let shipFrontCenter = shipBoundingBox.getPointInWorldSpace(new Point(0, shipBoundingBox.height / 2 + 5));
    bullet.addComponent(Transform.builder()
      .withPosition(shipFrontCenter)
      .withRotation(shipTransform.rotation)
      .build());

    bullet.addComponent(BoundingBox.builder()
      .withWidth(4)
      .withHeight(4)
      .build());

    let velocity = shipTransform.getForwardVector()
      .normalize()
      .multiplyScalar(this.muzzleVelocity)
      .add(shipRigidBody.velocity);

    bullet.addComponent(RigidBody.builder()
      .withVelocity(velocity)
      .build());

    bullet.addComponent(Material.builder()
      .withFriction(0.9)
      .withElasticity(0.9)
      .build());

    return bullet;
  }

  startFiring() {
    if (!this.isFiring) {
      this.isFiring = true;
    }
  }

  stopFiring() {
    if (this.isFiring) {
      this.isFiring = false;
    }
  }

}

module.exports = Gun;

class GunBuilder {

  constructor() {
    // todo: determine a sane default values
    this.muzzleVelocity = 1;
    this.rateOfFire = 1;
  }

  withMuzzleVelocity(muzzleVelocity) {
    this.muzzleVelocity = muzzleVelocity;
    return this;
  }

  withRateOfFire(rateOfFire) {
    this.rateOfFire = rateOfFire;
    return this;
  }

  build() {
    return new Gun(this.muzzleVelocity, this.rateOfFire);
  }

}
