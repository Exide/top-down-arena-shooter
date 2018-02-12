const SAT = require('../../utils/sat');

// collision matrix
// dynamic DOES collide with dynamic
// static DOES collide with dynamic
// static DOESNT collide with static

exports.detectCollisions = function (sceneGraph) {
  let collisions = [];

  sceneGraph.get().forEach(entities => {
    let dynamics = entities.filter(e => e.dynamic);
    let statics = entities.filter(e => !e.dynamic);
    let pairs = buildUniquePairs(dynamics);

    statics.forEach(s => {
      dynamics.forEach(d => {
        pairs.push([s, d]);
      });
    });

    let collidingPairs = pairs.filter(pair => SAT.isColliding(pair[0], pair[1]));
    collisions.push(...collidingPairs);
  });

  return collisions.filter(removeDuplicates);
};

function buildUniquePairs(entities) {
  let pairs = [];

  if (entities.length < 2) return pairs;

  for (let i = 0; i < entities.length - 1; ++i) {
    for (let j = i; j < entities.length - 1; ++j) {
      pairs.push([entities[i], entities[j+1]]);
    }
  }

  return pairs;
}

function removeDuplicates(pair, index, array) {
  return index === array.findIndex(p => {
    let same = p[0].id === pair[0].id && p[1].id === pair[1].id;
    let inverse = p[0].id === pair[1].id && p[1].id === pair[0].id;
    return same || inverse;
  });
}
