const random = require('./random');

describe('getNumberBetween', () => {

  test('is exclusive', () => {
    let number = random.getNumberBetween(0, 1);
    expect(number).toBeGreaterThan(0);
    expect(number).toBeLessThan(1);
  });

});
