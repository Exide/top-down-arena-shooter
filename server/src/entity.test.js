const {Entity, EntityType} = require('./entity');

//                 50    100   150
//                  |_____|_____|
//
//
//                        n3
//                        |
//                        |
//  150--          p3-----e3----p0
//      |           |           |
//      |           |           |
//  100--    n2----e2     +     e0----n0
//      |           |           |
//      |           |           |
//   50--          p2-----e1----p1
//                        |
//                        |
//                        n1

let type = EntityType.ASTEROID;
let position = {x: 100, y: 100};
let rotation = 90;
let width = 100;
let height = 100;
let entity = new Entity(type, position, rotation, width, height);

test('getPointsInLocalSpace', () => {
  let points = entity.getPointsInLocalSpace();
  expect(points[0]).toEqual({x: 50, y: 150});
  expect(points[1]).toEqual({x: 150, y: 150});
  expect(points[2]).toEqual({x: 150, y: 50});
  expect(points[3]).toEqual({x: 50, y: 50});
});

test('getPointsInWorldSpace', () => {
  let points = entity.getPointsInWorldSpace();
  expect(points[0]).toEqual({x: 150, y: 150});
  expect(points[1]).toEqual({x: 150, y: 50});
  expect(points[2]).toEqual({x: 50, y: 50});
  expect(points[3]).toEqual({x: 50, y: 150});
});

test('getEdgesInWorldSpace', () => {
  let edges = entity.getEdgesInWorldSpace();
  expect(edges[0]).toEqual({x: 0, y: -100});
  expect(edges[1]).toEqual({x: -100, y: 0});
  expect(edges[2]).toEqual({x: 0, y: 100});
  expect(edges[3]).toEqual({x: 100, y: 0});
});

test('getNormalsInWorldSpace', () => {
  let normals = entity.getNormalsInWorldSpace();
  expect(normals[0]).toEqual({x: 1, y: 0});
  expect(normals[1]).toEqual({x: 0, y: -1});
  expect(normals[2]).toEqual({x: -1, y: 0});
  expect(normals[3]).toEqual({x: 0, y: 1});
});
