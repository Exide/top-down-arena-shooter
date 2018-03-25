const collision = require('./collision');
const GameObject = require('./GameObject');
const Transform = require('./Transform');
const BoundingBox = require('./BoundingBox');
const RigidBody = require('./RigidBody');
const Material = require('./Material');
const {Vector} = require('./vector');
const {Point} = require('./point');
const {Edge} = require('./edge');

//  ·   ·   ·   ·
//
//  ·   |   ·   ·
//      | +
//  ·   |`  ·   ·
//      |'.
//  ·   |  `·   ·
//
//  0   ·   ·   ·

test('bounce as expected', () => {
  let edge = new Edge(new Point(1, 3), new Point(1, 1));
  let entity = new GameObject('Ship');
  entity.addComponent(Transform.builder()
    .withPosition(new Point(2, 1))
    .withRotation(0)
    .build());
  entity.addComponent(BoundingBox.builder()
    .withWidth(1)
    .withHeight(1)
    .build());
  entity.addComponent(RigidBody.builder()
    .withVelocity(new Vector(-1, 1))
    .build());
  entity.addComponent(Material.builder()
    .withFriction(0.5)
    .withElasticity(0.5)
    .build());
  collision.applyBounce(entity, edge);
  expect(entity.getComponent('RigidBody').velocity).toEqual(new Vector(0.5, 0.5));
});
