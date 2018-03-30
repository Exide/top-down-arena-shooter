const Transform = require('./Transform');

let transform = Transform.builder()
  .withRotation(135)
  .build();

test('getForwardVector', () => {
  let vector = transform.getForwardVector();
  expect(vector.x).toBeCloseTo(0.707, 3);
  expect(vector.y).toBeCloseTo(-0.707, 3);
});
