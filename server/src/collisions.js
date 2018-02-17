const SAT = require('../../utils/sat');
const moment = require('moment');

const now = () => {
  return moment().utc().toISOString();
};

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

    let collidingPairs = pairs
      .map(pair => {
        let result = SAT.checkForSeparation(pair[0], pair[1]);
        if (result.isColliding) {
          return result;
        } else {
          return undefined;
        }
      })
      .filter(collidingPair => collidingPair !== undefined);

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

function removeDuplicates(collision, index, array) {
  return index === array.findIndex(c => {
    let same = c.collider.id === collision.collider.id && c.collidee.id === collision.collidee.id;
    let inverse = c.collider.id === collision.collidee.id && c.collidee.id === collision.collider.id;
    return same || inverse;
  });
}

// collision outcomes
// dynamic v. dynamic = both entities reverse and cut velocity by 30%
// dynamic v. static = dynamic entity reverses and cuts velocity by 30%

exports.resolveCollisions = function (collisions) {
  collisions.forEach(collision => {
    console.log(`${now()} | collision | ${collision.collider.id} > ${collision.collidee.id} - x:${collision.mtv.x}, y:${collision.mtv.y}`);

    if (collision.collider.dynamic) knockBack(collision.collider, collision.collidee, collision.mtv);
    if (collision.collidee.dynamic) knockBack(collision.collidee, collision.collider, collision.mtv);
  });
};

function knockBack(collider, collidee, mtv) {
  // move the collider out of the collision
  collider.position.x += mtv.x;
  collider.position.y += mtv.y;
  // reverse velocity
  collider.velocity.x = -(collider.velocity.x * 0.7);
  collider.velocity.y = -(collider.velocity.y * 0.7);
}
