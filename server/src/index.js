const config = require('../config.json');
const random = require('../../utils/random');
const EntityService = require('../../utils/EntityService');
const moment = require('moment');
const {Point} = require('../../utils/point');
const quadtree = require('../../utils/Quadtree');
const SAT = require('../../utils/sat');
const contactPoints = require('../../utils/contactPoints');
const {applyBounce} = require('../../utils/collision');
const GameObject = require('../../utils/Entity');
const Transform = require('../../utils/Transform');
const BoundingBox = require('../../utils/BoundingBox');
const RigidBody = require('../../utils/RigidBody');
const Material = require('../../utils/Material');
const Thruster = require('../../utils/Thruster');
const Gun = require('../../utils/Gun');
const NetworkService = require('../../utils/NetworkService');

const now = () => {
  return moment().utc().toISOString();
};

let sceneGraph;

console.log(`${now()} | index | generating wall entities`);

function buildWall(x, y, w, h) {
  let wall = new GameObject('Wall');

  wall.addComponent(Transform.builder()
    .withPosition(new Point(x, y))
    .build());

  wall.addComponent(BoundingBox.builder()
    .withWidth(w)
    .withHeight(h)
    .build());

  return wall;
}

let wallSize = 16;
EntityService.get().add(buildWall(-(config.map.width / 2) + (wallSize / 2), 0, wallSize, config.map.height));
EntityService.get().add(buildWall((config.map.width / 2) - (wallSize / 2), 0, wallSize, config.map.height));
EntityService.get().add(buildWall(0, (config.map.height / 2) - (wallSize / 2), config.map.width - (wallSize * 2), wallSize));
EntityService.get().add(buildWall(0, -(config.map.height / 2) + (wallSize / 2), config.map.width - (wallSize * 2), wallSize));

console.log(`${now()} | index | generating asteroid field entities`);

function buildAsteroid(x, y, r, size) {
  let asteroid = new GameObject('Asteroid');

  asteroid.addComponent(Transform.builder()
    .withPosition(new Point(x, y))
    .withRotation(r)
    .build());

  size = size || random.flipCoin() ? 16 : 34;
  asteroid.addComponent(BoundingBox.builder()
    .withWidth(size)
    .withHeight(size)
    .build());

  return asteroid;
}

for (let i = 0; i < 20; ++i) {
  let x = random.getNumberBetween(-config.map.width / 2 + 16, config.map.width / 2 - 16);
  let y = random.getNumberBetween(-config.map.height / 2 + 16, config.map.height / 2 - 16);
  let r = random.getNumberBetween(0, 360);
  EntityService.get().add(buildAsteroid(x, y, r));
}

let onConnect = (session) => {
  let entity = spawnPlayer(session.id);

  // send the current state of the game
  let serializedEntities = EntityService.get().entities.map(entity => entity.serialize());
  if (serializedEntities.length > 0) {
    NetworkService.get().send(session.id, `map|${config.map.width},${config.map.height}`);
    NetworkService.get().send(session.id, `initialize|${serializedEntities.join('|')}`);
  }

  EntityService.get().add(entity);

  NetworkService.get().broadcast(`add|${entity.serialize()}`);
  NetworkService.get().send(session.id, `identity|${entity.id}`);
};

let onMessage = (session, message) => {
  let entity = EntityService.get().entities.find(e => e.sessionId === session.id);
  let components = message.split('|');
  let command = components[0];
  switch (command) {

    case 'start-rotate':
      entity.getComponent('Thruster').startRotating(components[1]);
      break;

    case 'stop-rotate':
      entity.getComponent('Thruster').stopRotating(components[1]);
      break;

    case 'start-thrust':
      entity.getComponent('Thruster').startThrusting(components[1]);
      break;

    case 'stop-thrust':
      entity.getComponent('Thruster').stopThrusting(components[1]);
      break;

    case 'start-fire':
      entity.getComponent('Gun').startFiring();
      break;

    case 'stop-fire':
      entity.getComponent('Gun').stopFiring();
      break;

    default:
      console.log(`${now()} | ws | ${session.id} | message ignored: ${message}`);
      break;

  }
};

let onDisconnect = (session) => {
  let entity = EntityService.get().entities.find(e => e.sessionId === session.id);
  EntityService.get().remove(entity);
  NetworkService.get().broadcast(`remove|${entity.id}`);
};

NetworkService.get().start(onConnect, onMessage, onDisconnect);

let lastUpdate = moment();
let accumulatorSeconds = 0;
let deltaTimeSeconds = 1 / config.updatesPerSecond;

const loop = () => {
  let now = moment();
  accumulatorSeconds += moment.duration(now.diff(lastUpdate)).asSeconds();
  lastUpdate = now;
  if (accumulatorSeconds >= deltaTimeSeconds) {
    accumulatorSeconds -= deltaTimeSeconds;

    // destroy all entities that are marked
    for (let i = EntityService.get().entities.length - 1; i >= 0; i--) {
      let entity = EntityService.get().entities[i];
      if (entity.markedForDestruction) {
        EntityService.get().remove(entity);
        NetworkService.get().broadcast(`remove|${entity.id}`);
      }
    }

    // get all the entities that have changes
    let updatedEntities = EntityService.get().entities.filter(entity => {
      // todo: make update return a boolean instead of setting a boolean property
      entity.update(deltaTimeSeconds);
      return entity.hasChanged;
    });

    // perform collision detection/resolution
    sceneGraph = new quadtree.Node(0, 0, config.map.width, config.map.height);
    sceneGraph.insertMany(EntityService.get().entities.filter(e => !e.markedForDestruction));
    let collisions = detectCollisions(sceneGraph);
    resolveCollisions(collisions);

    // if we still have valid updates, send them out
    if (updatedEntities.length > 0) {
      let updatedEntitiesSerialized = updatedEntities
        .filter(e => !e.markedForDestruction)
        .map(e => e.serialize());
      NetworkService.get().broadcast(`update|${updatedEntitiesSerialized.join('|')}`);
    }
  }
  setImmediate(loop);
};

setImmediate(loop);

// collision matrix
// dynamic DOES collide with dynamic
// static DOES collide with dynamic
// static DOESNT collide with static

function detectCollisions(sceneGraph) {
  let collisions = [];

  sceneGraph.get().forEach(entities => {
    let dynamics = entities.filter(e => isDynamic(e));
    let statics = entities.filter(e => !isDynamic(e));
    let pairs = buildUniquePairs(dynamics);
    pairs = pairs.filter(shouldInteract);

    dynamics.forEach(d => {
      statics.forEach(s => {
        pairs.push([d, s]);
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
}

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

function shouldInteract(pair) {
  let a = pair[0];
  let b = pair[1];

  let bothBullets = (a.type === 'Bullet' && b.type === 'Bullet');
  let bulletAndOrigin = (a.type === 'Bullet' && a.origin === b) || (b.type === 'Bullet' && b.origin === a);
  return !bothBullets && !bulletAndOrigin;
}

function removeDuplicates(collision, index, array) {
  return index === array.findIndex(c => {
    let same = c.a.id === collision.a.id && c.b.id === collision.b.id;
    let inverse = c.a.id === collision.b.id && c.b.id === collision.a.id;
    return same || inverse;
  });
}

// collision outcomes
// dynamic v. dynamic = both entities reverse and cut velocity by 30%
// dynamic v. static = dynamic entity reverses and cuts velocity by 30%

function resolveCollisions(collisions) {
  collisions.forEach(collision => {
    console.log(`${now()} | index | collision | ${collision.a.id} > ${collision.b.id} - x:${collision.mtv.x.toFixed(3)}, y:${collision.mtv.y.toFixed(3)}`);

    // we can assume collision.a is always a GameObject
    let aPosition = collision.a.getComponent('Transform').position;
    let aBoundingBox = collision.a.getComponent('BoundingBox');
    let aPoints = aBoundingBox.getPointsInWorldSpace();
    let aNormals = aBoundingBox.getEdgeNormals();

    NetworkService.get().broadcast(`debug-points|${aPoints.map(p => `${p.x},${p.y}`).join('|')}`);
    NetworkService.get().broadcast(`debug-normals|${aPosition.x},${aPosition.y}|${aNormals.map(n => `${n.x}, ${n.y}`).join('|')}`);

    let bPosition = collision.b.getComponent('Transform').position;
    let bBoundingBox = collision.b.getComponent('BoundingBox');
    let bPoints = bBoundingBox.getPointsInWorldSpace();
    let bNormals = bBoundingBox.getEdgeNormals();

    NetworkService.get().broadcast(`debug-points|${bPoints.map(p => `${p.x},${p.y}`).join('|')}`);
    NetworkService.get().broadcast(`debug-normals|${bPosition.x},${bPosition.y}|${bNormals.map(n => `${n.x}, ${n.y}`).join('|')}`);

    let aVelocityBeforeCollision = collision.a.getComponent('RigidBody').velocity;

    // we can assume collision.a is always dynamic
    translateOutOfCollision(collision.a, collision.mtv);
    let bEdge = contactPoints.findBestEdge(bPoints, collision.mtv.clone().invert());
    applyBounce(collision.a, bEdge);

    if (isDynamic(collision.b)) {
      if (collision.a.type === 'Bullet' && collision.b.type === 'Ship') {
        collision.a.destroy();
        let replacementEntity = spawnPlayer(collision.b.sessionId);
        EntityService.get().add(replacementEntity);
        NetworkService.get().broadcast(`add|${replacementEntity.serialize()}`);
        NetworkService.get().send(replacementEntity.sessionId, `identity|${replacementEntity.id}`);
        collision.b.destroy();
      } else if (collision.a.type === 'Ship' && collision.b.type === 'Bullet') {
        collision.b.destroy();
        let replacementEntity = spawnPlayer(collision.a.sessionId);
        EntityService.get().add(replacementEntity);
        NetworkService.get().broadcast(`add|${replacementEntity.serialize()}`);
        NetworkService.get().send(replacementEntity.sessionId, `identity|${replacementEntity.id}`);
        collision.a.destroy();
      } else {
        translateOutOfCollision(collision.b, collision.mtv.clone().invert());
        let aEdge = contactPoints.findBestEdge(aPoints, collision.mtv);
        applyBounce(collision.b, aEdge);

        let bVelocityBeforeCollision = collision.b.getComponent('RigidBody').velocity;
        collision.a.getComponent('RigidBody').velocity.add(bVelocityBeforeCollision.multiplyScalar(0.5));
        collision.b.getComponent('RigidBody').velocity.add(aVelocityBeforeCollision.multiplyScalar(0.5));
      }
    }
  });
}

function translateOutOfCollision(entity, mtv) {
  let transform = entity.getComponent('Transform');
  transform.position.x += mtv.x;
  transform.position.y += mtv.y;
}

function isDynamic(entity) {
  switch (entity.type) {
    case 'Ship':
    case 'Bullet':
      return true;
    default:
      return false;
  }
}

function spawnPlayer(sessionId) {
  let x = random.getNumberBetween(-config.map.width/4, config.map.width/4);
  let y = random.getNumberBetween(-config.map.height/4, config.map.height/4);
  let position = new Point(x, y);
  // let position = new Point(0, 0);
  // let rotation = random.getNumberBetween(0, 360);
  let rotation = 0;
  let width = 50;
  let height = 50;
  let entity = new GameObject('Ship');
  entity.sessionId = sessionId;
  entity.addComponent(Transform.builder()
    .withPosition(position)
    .withRotation(rotation)
    .build());
  entity.addComponent(BoundingBox.builder()
    .withWidth(width)
    .withHeight(height)
    .build());
  entity.addComponent(RigidBody.builder()
    .build());
  entity.addComponent(Material.builder()
    .withFriction(0.7)
    .withElasticity(0.7)
    .build());
  entity.addComponent(Thruster.builder()
    .build());
  entity.addComponent(Gun.builder()
    .withMuzzleVelocity(5)
    .withRateOfFire(5)
    .build());

  return entity;
}
