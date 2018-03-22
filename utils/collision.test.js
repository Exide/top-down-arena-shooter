const collision = require('./collision');
const {Entity, EntityType} = require('../server/src/entity');
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
  let entity = new Entity(EntityType.ASTEROID, new Point(2, 1), 0, 1, 1);
  entity.velocity = new Vector(-1, 1);
  collision.applyBounce(entity, edge);
  expect(entity.velocity).toEqual(new Vector(0.7, 0.7));
});
