const {Vector} = require('./vector');

test('toLeftNormal', () => {
  let vector = new Vector(100, 0);
  let normal = vector.toLeftNormal();
  expect(normal).toEqual(new Vector(0, 100));
});

test('denormalize', () => {
  let vector = new Vector(1, 0);
  let direction = vector.denormalize(100);
  expect(direction).toEqual(new Vector(100, 0));
});
