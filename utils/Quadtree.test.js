const quadtree = require('./Quadtree');
const Entity = require('./Entity');
const Transform = require('./Transform');
const BoundingBox = require('./BoundingBox');
const {Point} = require('./point');

test('simple scene', () => {
  let entities = [];

  let boundingBox = BoundingBox.builder()
    .withWidth(100)
    .withHeight(100)
    .build();

  let entityOne = new Entity('Something');
  entityOne.addComponent(Transform.builder().withPosition(new Point(0, 0)).build());
  entityOne.addComponent(boundingBox);
  entities.push(entityOne);

  let entityTwo = new Entity('Something');
  entityTwo.addComponent(Transform.builder().withPosition(new Point(-250, 250)).build());
  entityTwo.addComponent(boundingBox);
  entities.push(entityTwo);

  let entityThree = new Entity('Something');
  entityThree.addComponent(Transform.builder().withPosition(new Point(250, 250)).build());
  entityThree.addComponent(boundingBox);
  entities.push(entityThree);

  let entityFour = new Entity('Something');
  entityFour.addComponent(Transform.builder().withPosition(new Point(-250, -250)).build());
  entityFour.addComponent(boundingBox);
  entities.push(entityFour);

  let entityFive = new Entity('Something');
  entityFive.addComponent(Transform.builder().withPosition(new Point(250, -250)).build());
  entityFive.addComponent(boundingBox);
  entities.push(entityFive);

  let tree = new quadtree.Node(0, 0, 1000, 1000);
  tree.insertMany(entities);
  let state = tree.dump();

  expect(state.quads[0]).toEqual([entityOne.id, entityTwo.id]);
  expect(state.quads[1]).toEqual([entityOne.id, entityThree.id]);
  expect(state.quads[2]).toEqual([entityOne.id, entityFour.id]);
  expect(state.quads[3]).toEqual([entityOne.id, entityFive.id]);
});

test('entity wider than a single quad', () => {
  let entities = [];

  let entityOne = new Entity('Something');
  entityOne.addComponent(Transform.builder().withPosition(new Point(0, 750)).build());
  entityOne.addComponent(BoundingBox.builder().withWidth(1500).withHeight(100).build());
  entities.push(entityOne);

  let entityTwo = new Entity('Something');
  entityTwo.addComponent(Transform.builder().withPosition(new Point(250, 250)).build());
  entityTwo.addComponent(BoundingBox.builder().withWidth(100).withHeight(100).build());
  entities.push(entityTwo);

  let entityThree = new Entity('Something');
  entityThree.addComponent(Transform.builder().withPosition(new Point(750, 250)).build());
  entityThree.addComponent(BoundingBox.builder().withWidth(100).withHeight(100).build());
  entities.push(entityThree);

  let tree = new quadtree.Node(0, 0, 2000, 2000);
  tree.insertMany(entities);
  let state = tree.dump();

  expect(state.quads[0]).toEqual([entityOne.id]);
  expect(state.quads[1].quads[0]).toEqual([entityOne.id]);
  expect(state.quads[1].quads[1]).toEqual([entityOne.id]);
  expect(state.quads[1].quads[2]).toEqual([entityTwo.id]);
  expect(state.quads[1].quads[3]).toEqual([entityThree.id]);
  expect(state.quads[2]).toEqual([]);
  expect(state.quads[3]).toEqual([]);
});
