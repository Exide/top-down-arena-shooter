const collision = require('./collision');
const {Entity, EntityType} = require('../server/src/entity');
const {Point} = require('./point');
const {Edge} = require('./edge');

//  ·   ·   ·   ·
//
//  ·   a   c   ·
//      | .`
//  ·   e`  ·   ·
//      |'.
//  ·   b  `d   ·
//
//  0   ·   ·   ·

test('bounce as expected', () => {
  let a = new Point(1, 3);
  let b = new Point(1, 1);
  let c = new Point(2, 3);
  let d = new Point(2, 1);
  let e = new Point(1, 2);
  let edge = new Edge(a, b);
  let entity = new Entity(EntityType.ASTEROID, d, 0, 1, 1);
  entity.velocity = e.clone().subtract(d);
  collision.applyBounce(entity, edge);
  expect(entity.velocity).toEqual(c.clone().subtract(e));
});
