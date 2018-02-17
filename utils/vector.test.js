const vector = require('./vector');

test('leftNormal', () => {
  let edge = {x: 100, y: 0};
  let normal = vector.leftNormal(edge);
  expect(normal).toEqual({x: 0, y: 100});
});

test('normalize', () => {
  let direction = {x: 100, y: 0};
  let unit = vector.normalize(direction);
  expect(unit).toEqual({x: 1, y: 0});
});

test('directionFromUnit', () => {
  let unit = {x: 1, y: 0};
  let magnitude = 100;
  let direction = vector.directionFromUnit(unit, magnitude);
  expect(direction).toEqual({x: 100, y: 0});
});
