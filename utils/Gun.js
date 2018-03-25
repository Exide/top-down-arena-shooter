const moment = require('moment');
const {sign} = require('./math');
const {Point} = require('./point');
const {Vector} = require('./vector');
const Component = require('./Component');
const GameObject = require('./GameObject');
const Transform = require('./Transform');
const BoundingBox = require('./BoundingBox');
const RigidBody = require('./RigidBody');
const Material = require('./Material');
const EntityService = require('../server/src/EntityService');

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
        let bullet = this.createBullet();
        console.log('bullet created:', bullet);
        EntityService.get().add(bullet);
      }
    }
  }

  createBullet() {
    let shipTransform = this.parent.getComponent('Transform');
    let shipBoundingBox = this.parent.getComponent('BoundingBox');
    let shipRigidBody = this.parent.getComponent('RigidBody');

    let bullet = new GameObject('Bullet');

    let frontTipOfTheShip = shipBoundingBox.getPointInWorldSpace(new Point(0, this.height / 2));
    bullet.addComponent(Transform.builder()
      .withPosition(frontTipOfTheShip)
      .withRotation(shipTransform.rotation)
      .build());

    bullet.addComponent(BoundingBox.builder()
      .withWidth(4)
      .withHeight(4)
      .build());

    let shipVelocity = shipRigidBody.velocity.clone();
    let vX = this.muzzleVelocity * sign(shipVelocity.x);
    let vY = this.muzzleVelocity * sign(shipVelocity.y);
    let initialVelocity = new Vector(vX, vY);
    bullet.addComponent(RigidBody.builder()
      .withVelocity(initialVelocity.add(shipVelocity))
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
