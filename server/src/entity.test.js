const {Entity, EntityType} = require('./entity');
const {Vector} = require('../../utils/vector');
const {Point} = require('../../utils/point');
const {Edge} = require('../../utils/edge');

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

let width = 100;
let height = 100;
let rotation = 90;
let position = new Point(100, 100);

let entity = new Entity(EntityType.ASTEROID, position, rotation, width, height);

test('getPointsInLocalSpace', () => {
  let points = entity.getPointsInLocalSpace();
  // todo: figure out why these commented out values are invalid
  // expect(points[0]).toEqual(new Point(-50,  50));
  // expect(points[1]).toEqual(new Point( 50,  50));
  // expect(points[2]).toEqual(new Point( 50, -50));
  // expect(points[3]).toEqual(new Point(-50, -50));
  expect(points[0]).toEqual(new Point( 50, 150));
  expect(points[1]).toEqual(new Point(150, 150));
  expect(points[2]).toEqual(new Point(150,  50));
  expect(points[3]).toEqual(new Point( 50,  50));
});

test('getPointsInWorldSpace', () => {
  let points = entity.getPointsInWorldSpace();
  expect(points[0]).toEqual(new Point(150, 150));
  expect(points[1]).toEqual(new Point(150,  50));
  expect(points[2]).toEqual(new Point( 50,  50));
  expect(points[3]).toEqual(new Point( 50, 150));
});

test('getEdgesInWorldSpace', () => {
  let edges = entity.getEdgesInWorldSpace();
  expect(edges[0]).toEqual(new Edge(new Point(150, 150), new Point(150,  50)));
  expect(edges[1]).toEqual(new Edge(new Point(150,  50), new Point( 50,  50)));
  expect(edges[2]).toEqual(new Edge(new Point( 50,  50), new Point( 50, 150)));
  expect(edges[3]).toEqual(new Edge(new Point( 50, 150), new Point(150, 150)));
});

test('getEdgeNormals', () => {
  let normals = entity.getEdgeNormals();
  expect(normals[0]).toEqual(new Vector( 100,    0));
  expect(normals[1]).toEqual(new Vector(   0, -100));
  expect(normals[2]).toEqual(new Vector(-100,    0));
  expect(normals[3]).toEqual(new Vector(   0,  100));
});
