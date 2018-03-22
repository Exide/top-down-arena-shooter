const contactPoints = require('./contactPoints');
const {Vector} = require('./vector');
const {Point} = require('./point');

describe('axis aligned boxes', () => {

  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //
  //  ·   ·   ·   ·   ·   ·   ·   ·   a0--·---·---·---·---·---a1  ·
  //                                  |                       |
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //                                  |                       |
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //                                  |                       |
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //                                  |                       |
  //  ·   ·   ·   ·   b0--·---·---·---·---·---·---·---b1  ·   ·   ·
  //                  |               |               |       |
  //  ·   ·   ·   ·   ·   ·   ·   ·   a3--·---·---·---·---·---a2  ·
  //                  |                               |
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //                  |                               |
  //  ·   ·   ·   ·   b4--·---·---·---·---·---·---·---b2  ·   ·   ·
  //
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //
  //  0   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·

  test("box A's best edge", () => {
    let points = [
      new Point( 8, 9),
      new Point(14, 9),
      new Point(14, 4),
      new Point( 8, 4)
    ];
    let translation = new Vector(0, 1);
    let edge = contactPoints.findBestEdge(points, translation);
    expect(edge.a).toEqual(points[2]);
    expect(edge.b).toEqual(points[3]);
  });

  test("box B's best edge", () => {
    let points = [
      new Point( 4, 5),
      new Point(12, 5),
      new Point(12, 2),
      new Point( 4, 2)
    ];
    let translation = new Vector(0, -1);
    let edge = contactPoints.findBestEdge(points, translation);
    expect(edge.a).toEqual(points[0]);
    expect(edge.b).toEqual(points[1]);
  });

});

describe('not axis aligned boxes', () => {

  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //
  //  ·   ·   ·   ·   ·   a1  ·   ·   ·   ·   ·   ·   ·   ·
  //                    .' '.
  //  ·   ·   ·   ·   ·'  ·  '·   ·   ·   ·   ·   ·   ·   ·
  //                .'         '.
  //  ·   ·   ·   ·'  ·   ·   ·  '·   ·   ·   ·   ·   ·   ·
  //            .'                 '.
  //  ·   ·   a0  ·   ·   ·   ·   ·  '·   ·   ·   ·   ·   ·
  //           '.                      '.
  //  ·   ·   ·  '·   ·   ·   ·   ·   ·  'a2  ·   ·   ·   ·
  //               '.                   .'
  //  ·   ·   ·   ·  '·   ·   ·   ·   ·'  ·   ·   ·   ·   ·
  //                   '.           .'
  //  ·   ·   ·   ·   b0--·---·---·---·---·---·---·---b1  ·
  //                  |    '.   .'                    |
  //  ·   ·   ·   ·   ·   ·  'a3  ·   ·   ·   ·   ·   ·   ·
  //                  |                               |
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //                  |                               |
  //  ·   ·   ·   ·   b4--·---·---·---·---·---·---·---b2  ·
  //
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //
  //  0   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·

  test("box A's best edge", () => {
    let points = [
      new Point(2,  8),
      new Point(5, 11),
      new Point(9,  7),
      new Point(6,  4)
    ];
    let translation = new Vector(0, 1);
    let edge = contactPoints.findBestEdge(points, translation);
    expect(edge.a).toEqual(points[2]);
    expect(edge.b).toEqual(points[3]);
  });

  test("box B's best edge", () => {
    let points = [
      new Point( 4, 5),
      new Point(12, 5),
      new Point(12, 2),
      new Point( 4, 2)
    ];
    let translation = new Vector(0, -1);
    let edge = contactPoints.findBestEdge(points, translation);
    expect(edge.a).toEqual(points[0]);
    expect(edge.b).toEqual(points[1]);
  });

});

describe('depth needs adjustment', () => {


  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   a0_ ·   ·   ·   ·   ·
  //                                          /   ` ` - . _
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   · ` a1  ·
  //                                         /                /
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //                                        /                /
  //  ·   ·   ·   ·   b0--·---·---·---·---·---·---·---b1  ·   ·   ·
  //                  |                    /          |     /
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   a3_ ·   ·   ·   ·   ·   ·
  //                  |                       ` ` - . |    /
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   · ` a2  ·   ·
  //                  |                               |
  //  ·   ·   ·   ·   b4--·---·---·---·---·---·---·---b2  ·   ·   ·
  //
  //  ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·
  //
  //  0   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·

  test("box A's best edge", () => {
    let points = [
      new Point(10, 8),
      new Point(14, 7),
      new Point(13, 3),
      new Point( 9, 4)
    ];
    let translation = new Vector(0.323, 1.666);
    let edge = contactPoints.findBestEdge(points, translation);
    expect(edge.a).toEqual(points[2]);
    expect(edge.b).toEqual(points[3]);
  });

  test("box B's best edge", () => {
    let points = [
      new Point( 4, 5),
      new Point(12, 5),
      new Point(12, 2),
      new Point( 4, 2)
    ];
    let translation = new Vector(0, -1);
    let edge = contactPoints.findBestEdge(points, translation);
    expect(edge.a).toEqual(points[0]);
    expect(edge.b).toEqual(points[1]);
  });

});
