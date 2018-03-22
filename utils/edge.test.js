const {Edge} = require('./edge');
const {Point} = require('./point');
const {Vector} = require('./vector');

test('toVector', () => {
  let a = new Point(100, 100);
  let b = new Point(200, 100);
  let edge = new Edge(a, b);
  expect(edge.toVector()).toEqual(new Vector(100, 0));
});

test('toLeftNormal', () => {
  let a = new Point(100, 100);
  let b = new Point(200, 100);
  let edge = new Edge(a, b);
  expect(edge.toLeftNormal()).toEqual(new Vector(0, 100));
});
