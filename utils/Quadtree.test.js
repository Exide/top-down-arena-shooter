const quadtree = require('./Quadtree');

test('simple scene', () => {
  let tree = new quadtree.Node(0, 0, 1000, 1000);
  let entities = [];
  entities.push({id: 1, position: {x: 0, y: 0}, width: 100, height: 100});
  entities.push({id: 2, position: {x: -250, y: 250}, width: 100, height: 100});
  entities.push({id: 3, position: {x: 250, y: 250}, width: 100, height: 100});
  entities.push({id: 4, position: {x: -250, y: -250}, width: 100, height: 100});
  entities.push({id: 5, position: {x: 250, y: -250}, width: 100, height: 100});
  tree.insertMany(entities);
  let state = tree.dump();
  expect(state.quads[0]).toEqual([1, 2]);
  expect(state.quads[1]).toEqual([1, 3]);
  expect(state.quads[2]).toEqual([1, 4]);
  expect(state.quads[3]).toEqual([1, 5]);
});

test('entity wider than a single quad', () => {
  let tree = new quadtree.Node(0, 0, 2000, 2000);
  let entities = [];
  entities.push({id: 1, position: {x: 0, y: 750}, width: 1500, height: 100});
  entities.push({id: 2, position: {x: 250, y: 250}, width: 100, height: 100});
  entities.push({id: 3, position: {x: 750, y: 250}, width: 100, height: 100});
  tree.insertMany(entities);
  let state = tree.dump();
  expect(state.quads[0]).toEqual([1]);
  expect(state.quads[1].quads[0]).toEqual([1]);
  expect(state.quads[1].quads[1]).toEqual([1]);
  expect(state.quads[1].quads[2]).toEqual([2]);
  expect(state.quads[1].quads[3]).toEqual([3]);
  expect(state.quads[2]).toEqual([]);
  expect(state.quads[3]).toEqual([]);
});
