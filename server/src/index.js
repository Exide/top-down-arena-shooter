const config = require('../config.json');
const WebSocket = require('ws');
const random = require('../../utils/random');
const {Entity, EntityType} = require('./entity');
const moment = require('moment');
const Vector = require('victor');
const quadtree = require('../../utils/Quadtree');
const SAT = require('sat');

// list of all sessions
let sessions = [];

// list of all entities
let entities = [];

let sceneGraph;

console.log("generating wall entities");
let wallSize = 16;

let leftWallPosition = new Vector(-(config.map.width / 2) + (wallSize / 2), 0);
let leftWall = new Entity(EntityType.WALL, leftWallPosition, 0, wallSize, config.map.height);

let rightWallPosition = new Vector((config.map.width / 2) - (wallSize / 2), 0);
let rightWall = new Entity(EntityType.WALL, rightWallPosition, 0, wallSize, config.map.height);

let topWallPosition = new Vector(0, (config.map.height / 2) - (wallSize / 2));
let topWall = new Entity(EntityType.WALL, topWallPosition, 0, config.map.width - (wallSize * 2), wallSize);

let bottomWallPosition = new Vector(0, -(config.map.height / 2) + (wallSize / 2));
let bottomWall = new Entity(EntityType.WALL, bottomWallPosition, 0, config.map.width - (wallSize * 2), wallSize);

entities.push(leftWall, rightWall, topWall, bottomWall);

console.log('generating asteroid field entities');
for (let i = 0; i < 20; ++i) {
  let x = random.getNumberBetween(-config.map.width / 2 + 16, config.map.width / 2 - 16);
  let y = random.getNumberBetween(-config.map.height / 2 + 16, config.map.height / 2 - 16);
  let r = random.getNumberBetween(0, 360);
  let size = random.flipCoin() ? 16 : 34;
  let asteroid = new Entity(EntityType.ASTEROID, new Vector(x, y), r, size, size);
  entities.push(asteroid);
}

console.log("initializing websocket service");
const server = new WebSocket.Server({
  host: config.host,
  port: config.port
});

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

const now = () => {
  return moment().utc().toISOString();
};

server.on('connection', (ws, http) => {
  console.log(`${now()} | http | ${http.method.toLowerCase()} ${http.url}`);

  const session = new Session(ws, http);
  console.log(`${now()} | session created: ${session.id}`);

  let x = random.getNumberBetween(-config.map.width/4, config.map.width/4);
  let y = random.getNumberBetween(-config.map.height/4, config.map.height/4);
  let position = new Vector(x, y);
  let rotation = random.getNumberBetween(0, 360);
  let width = 64;
  let height = 64;
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

console.log(`${now()} | listening at ws://${config.host}:${config.port}`);

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

function getEveryPossiblePair(entities) {
  var pairs = [];
  for (var i = 0; i < entities.length - 1; ++i) {
    for (var j = i; j < entities.length - 1; ++j) {
      pairs.push([entities[i], entities[j+1]]);
    }
  }
  return pairs;
}

function isColliding(a, b) {
  a = new SAT.Box(new SAT.Vector(a.position.x, a.position.y), a.width, a.height).toPolygon();
  b = new SAT.Box(new SAT.Vector(b.position.x, b.position.y), b.width, b.height).toPolygon();
  return SAT.testPolygonPolygon(a, b);
}

function detectCollisions(sceneGraph) {
  let collisions = [];

  sceneGraph.get().forEach(entitiesNearEachOther => {
    let dynamicEntities = entitiesNearEachOther.filter(e => e.dynamic);
    if (dynamicEntities > 1) {
      let dynamicPairs = getEveryPossiblePair(dynamicEntities);
      let pairsColliding = dynamicPairs.filter((a, b) => isColliding(a, b));
      collisions.push(...pairsColliding);
    }

    let staticEntities = entitiesNearEachOther.filter(e => !e.dynamic);
    staticEntities.forEach(staticEntity => {
      dynamicEntities.forEach(dynamicEntity => {
        if (isColliding(staticEntity, dynamicEntity)) {
          collisions.push([staticEntity, dynamicEntity]);
        }
      });
    });
  });
  
  return collisions;
}

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
    entities.forEach(e => {
      sceneGraph.insert(e);
    });
    let collisions = detectCollisions(sceneGraph);
    collisions.forEach(pair => {
      console.log(`${pair[0].id} collides with ${pair[1].id}`);
    });
    if (entitiesToUpdate.length > 0) {
      broadcastMessage(`update|${entitiesToUpdate.map(e => e.serialize()).join('|')}`);
    }
  }
  setImmediate(loop);
};

setImmediate(loop);
