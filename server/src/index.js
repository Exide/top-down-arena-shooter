const config = require('../config.json');
const WebSocket = require('ws');
const random = require('../../utils/random');
const {Entity, EntityType} = require('./entity');
const moment = require('moment');
const {Point} = require('../../utils/point');
const quadtree = require('../../utils/Quadtree');
const SAT = require('../../utils/sat');
const contactPoints = require('../../utils/contactPoints');
const {applyBounce} = require('../../utils/collision');

const now = () => {
  return moment().utc().toISOString();
};

// list of all sessions
let sessions = [];

// list of all entities
let entities = [];

let sceneGraph;

console.log(`${now()} | server | generating wall entities`);

function buildWall(x, y, w, h) {
  let position = new Point(x, y);
  let wall = new Entity(EntityType.WALL, position, 0, w, h);
  console.log(`- wall: ${wall.id}, w:${wall.width}, h:${wall.height}, ${wall.position}`);
  return wall;
}

let wallSize = 16;
entities.push(buildWall(-(config.map.width / 2) + (wallSize / 2), 0, wallSize, config.map.height));
entities.push(buildWall((config.map.width / 2) - (wallSize / 2), 0, wallSize, config.map.height));
entities.push(buildWall(0, (config.map.height / 2) - (wallSize / 2), config.map.width - (wallSize * 2), wallSize));
entities.push(buildWall(0, -(config.map.height / 2) + (wallSize / 2), config.map.width - (wallSize * 2), wallSize));

console.log(`${now()} | server | generating asteroid field entities`);

function buildAsteroid(x, y, r, size) {
  size = size || random.flipCoin() ? 16 : 34;
  let asteroid = new Entity(EntityType.ASTEROID, new Point(x, y), r, size, size);
  console.log(`- asteroid: ${asteroid.id}, w:${asteroid.width}, h:${asteroid.height}, ${asteroid.position}`);
  return asteroid;
}

for (let i = 0; i < 20; ++i) {
  let x = random.getNumberBetween(-config.map.width / 2 + 16, config.map.width / 2 - 16);
  let y = random.getNumberBetween(-config.map.height / 2 + 16, config.map.height / 2 - 16);
  let r = random.getNumberBetween(0, 360);
  entities.push(buildAsteroid(x, y, r));
}

console.log(`${now()} | server | initializing websocket service`);
const server = new WebSocket.Server({ port: config.port });

class Session {

  constructor(ws, http) {
    this.id = http.url.slice(1);
    this.socket = ws;

    if ('x-forwarded-for' in http.headers) {
      this.address = http.headers['x-forwarded-for'];
    } else {
      this.address = http.connection.remoteAddress;
    }
  }

}

server.on('error', (error) => {
  console.log(`${now()} | http | ${error}`);
});

server.on('connection', (ws, http) => {
  console.log(`${now()} | http | ${http.method.toLowerCase()} ${http.url}`);

  const session = new Session(ws, http);
  console.log(`${now()} | session created: ${session.id}`);

  let x = random.getNumberBetween(-config.map.width/4, config.map.width/4);
  let y = random.getNumberBetween(-config.map.height/4, config.map.height/4);
  let position = new Point(x, y);
  // let position = new Point(0, 0);
  // let rotation = random.getNumberBetween(0, 360);
  let rotation = 0;
  let width = 50;
  let height = 50;
  let entity = new Entity(EntityType.SHIP, position, rotation, width, height);
  console.log(`${now()} | entity created: ${entity.id}`);

  // send the current state of the game
  let serializedEntities = entities.map(entity => entity.serialize());
  if (serializedEntities.length > 0) {
    sendMessage(session, `map|${config.map.width},${config.map.height}`);
    sendMessage(session, `initialize|${serializedEntities.join('|')}`);
  }

  entities.push(entity);
  sessions.push(session);

  broadcastMessage(`add|${entity.serialize()}`);
  sendMessage(session, `identity|${entity.id}`);

  ws.on('message', (message) => {
    console.log(`${now()} | ws | ${session.id} | received: ${message}`);
    let components = message.split('|');
    let command = components[0];
    switch (command) {

      case 'start-rotate':
        entity.startRotating(components[1]);
        break;

      case 'stop-rotate':
        entity.stopRotating(components[1]);
        break;

      case 'start-thrust':
        entity.startThrusting(components[1]);
        break;

      case 'stop-thrust':
        entity.stopThrusting(components[1]);
        break;

      default:
        console.log(`${now()} | ws | ${session.id} | message ignored: ${message}`);
        break;

    }
  });

  ws.on('close', () => {
    console.log(`${now()} | ws | ${session.id} | closed`);
    entities = entities.filter(e => e !== entity);
    sessions = sessions.filter(s => s !== session);
    broadcastMessage(`remove|${entity.id}`);
  });

  ws.on('error', (error) => {
    console.log(`${now()} | ws | ${session.id} | error: ${error}`);
  });

  console.log(`${now()} | ws | ${session.id} | opened`);

});

console.log(`${now()} | ws | listening on port ${config.port}`);

const sendMessage = (session, message) => {
  session.socket.send(message);
  // console.log(`${now()} | ws | ${session.id} | sent: ${message}`);
};

const broadcastMessage = (message) => {
  // console.log(`${now()} | ws | ${session.id} broadcast: ${message}`);
  sessions.forEach(session => {
    if (session.socket.readyState === WebSocket.OPEN) {
      sendMessage(session, message);
    }
  });
};


let lastUpdate = moment();
let accumulatorSeconds = 0;
let deltaTimeSeconds = 1 / config.updatesPerSecond;

const loop = () => {
  let now = moment();
  accumulatorSeconds += moment.duration(now.diff(lastUpdate)).asSeconds();
  lastUpdate = now;
  if (accumulatorSeconds >= deltaTimeSeconds) {
    accumulatorSeconds -= deltaTimeSeconds;
    let entitiesToUpdate = entities.filter(entity => {
      entity.update(deltaTimeSeconds);
      return entity.hasChanged;
    });
    sceneGraph = new quadtree.Node(0, 0, config.map.width, config.map.height);
    sceneGraph.insertMany(entities);
    let collisions = detectCollisions(sceneGraph);
    resolveCollisions(collisions);
    if (entitiesToUpdate.length > 0) {
      broadcastMessage(`update|${entitiesToUpdate.map(e => e.serialize()).join('|')}`);
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
    let dynamics = entities.filter(e => e.dynamic);
    let statics = entities.filter(e => !e.dynamic);
    let pairs = buildUniquePairs(dynamics);

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
    console.log(`${now()} | collision | ${collision.a.id} > ${collision.b.id} - x:${collision.mtv.x}, y:${collision.mtv.y}`);

    broadcastMessage(`debug-points|${collision.aPoints.map(p => `${p.x},${p.y}`).join('|')}`);
    broadcastMessage(`debug-points|${collision.bPoints.map(p => `${p.x},${p.y}`).join('|')}`);
    broadcastMessage(`debug-normals|${collision.a.position.x},${collision.a.position.y}|${collision.aNormals.map(n => `${n.x}, ${n.y}`).join('|')}`);
    broadcastMessage(`debug-normals|${collision.b.position.x},${collision.b.position.y}|${collision.bNormals.map(n => `${n.x}, ${n.y}`).join('|')}`);

    let aEdge = contactPoints.findBestEdge(collision.aPoints, collision.mtv);
    let bEdge = contactPoints.findBestEdge(collision.bPoints, collision.mtv.clone().invert());

    if (collision.a.dynamic) {
      translateOutOfCollision(collision.a, collision.mtv);
      applyBounce(collision.a, bEdge);
    }

    if (collision.b.dynamic) {
      translateOutOfCollision(collision.b, collision.mtv.clone().invert());
      applyBounce(collision.b, aEdge);
    }
  });
}

function translateOutOfCollision(entity, mtv) {
  entity.position.x += mtv.x;
  entity.position.y += mtv.y;
}
