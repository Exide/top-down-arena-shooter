const SAT = require('./sat');

describe('project', () => {

  test('simple', () => {
    let points = [
      {x: -5, y: 15},
      {x: 5, y: 15},
      {x: 5, y: 5},
      {x: -5, y: 5}
    ];
    let axis = {x: 0, y: 1};
    expect(SAT.project(points, axis)).toEqual({min: 5, max: 15});
  });

});

describe('overlaps', () => {

  test('normal case of overlap', () => {
    let a = {min: 0, max: 4};
    let b = {min: 2, max: 6};
    expect(SAT.overlaps(a, b)).toBeTruthy();
  });

  test('normal case of no overlap', () => {
    let a = {min: 1, max: 3};
    let b = {min: 4, max: 7};
    expect(SAT.overlaps(a, b)).toBeFalsy();
  });

  test('normal case of no overlap, reversed', () => {
    let a = {min: 3, max: 6};
    let b = {min: 0, max: 2};
    expect(SAT.overlaps(a, b)).toBeFalsy();
  });

  test('touching', () => {
    let a = {min: 0, max: 3};
    let b = {min: 3, max: 6};
    expect(SAT.overlaps(a, b)).toBeTruthy();
  });

  test('containment', () => {
    let a = {min: 0, max: 7};
    let b = {min: 1, max: 4};
    expect(SAT.overlaps(a, b)).toBeTruthy();
  });

  test('same projections', () => {
    let a = {min: 0, max: 2};
    let b = {min: 0, max: 2};
    expect(SAT.overlaps(a, b)).toBeTruthy();
  });

});
