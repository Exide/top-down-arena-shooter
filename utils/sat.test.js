const SAT = require('./sat');
const {Vector} = require('./vector');
const {Point} = require('./point');
const {Entity, EntityType} = require('../server/src/entity');

describe('project', () => {

  test('simple', () => {
    let points = [
      new Point(-5, 15),
      new Point( 5, 15),
      new Point( 5,  5),
      new Point(-5,  5)
    ];
    let axis = new Vector(0, 1);
    let projection = SAT.project(points, axis);
    expect(projection).toEqual({min: 5, max: 15});
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

describe('checkForSeparation', () => {

  //  ·   ·   ·   ·   ·   ·   ·
  //
  //  ·   ·   a0--·---a1  ·   ·
  //          |       |
  //  ·   b0--·---·---·---b1  ·
  //      |   |       |   |
  //  ·   ·   a3--·---a2  ·   ·
  //      |               |
  //  ·   b3--·---·---·---b2  ·
  //
  //  0   ·   ·   ·   ·   ·   ·

  test('no separation', () => {
    let a = new Entity(EntityType.ASTEROID, new Point(3, 3), 0, 2, 2);
    let b = new Entity(EntityType.ASTEROID, new Point(3, 2), 0, 4, 2);
    let output = SAT.checkForSeparation(a, b);
    expect(output.a).toEqual(a);
    expect(output.b).toEqual(b);
    expect(output.isColliding).toBeTruthy();
    expect(output.mtv).toEqual(new Vector(0, 1));
  });

  //  ·   ·   ·   ·   ·   ·   ·   ·
  //
  //  ·   a0--·---a1  b0--·---b1  ·
  //      |       |   |       |
  //  ·   ·   ·   ·   ·   ·   ·   ·
  //      |       |   |       |
  //  ·   a3--·---a2  b3--·---b2  ·
  //
  //  0   ·   ·   ·   ·   ·   ·   ·

  test('seperation', () => {
    let a = new Entity(EntityType.ASTEROID, new Point(2, 2), 0, 2, 2);
    let b = new Entity(EntityType.ASTEROID, new Point(5, 2), 0, 2, 2);
    let output = SAT.checkForSeparation(a, b);
    expect(output.a).toEqual(a);
    expect(output.b).toEqual(b);
    expect(output.isColliding).toBeFalsy();
    expect(output.mtv).not.toBeDefined();
  });

  //  ·   ·   ·   ·   ·   ·
  //
  //  ·   a2--·---a3  ·   ·
  //      |       |
  //  ·   ·   b0--·---b1  ·
  //      |   |   |   |
  //  ·   a1--·---a0  ·   ·
  //          |       |
  //  ·   ·   b3--·---b2  ·
  //
  //  0   ·   ·   ·   ·   ·

  test('backup before moving laterally', () => {
    let a = new Entity(EntityType.ASTEROID, new Point(2, 3), 0, 2, 2);
    let b = new Entity(EntityType.ASTEROID, new Point(3, 2), 0, 2, 2);
    let output = SAT.checkForSeparation(a, b);
    expect(output.a).toEqual(a);
    expect(output.b).toEqual(b);
    expect(output.isColliding).toBeTruthy();
    expect(output.mtv).toEqual(new Vector(0, 1));
  });

});
