const config = require('../config.json');
const WebSocket = require('ws');
const {getRandomNumber} = require('../../utils/random');
const {Entity} = require('./entity');
const moment = require('moment');

// list of all sessions
let sessions = [];

// list of all entities
let entities = [];

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

  let x = config.mapWidth * getRandomNumber();
  let y = config.mapHeight * getRandomNumber();
  let r = getRandomNumber();
  let entity = new Entity([x, y], r);
  console.log(`${now()} | entity created: ${entity.id}`);

  // send the current state of the game
  let serializedEntities = entities.map(entity => entity.serialize());
  if (serializedEntities.length > 0) {
    sendMessage(session, `initialize|${serializedEntities.join('|')}`);
  }

  entities.push(entity);
  sessions.push(session);

  broadcastMessage(`add|${entity.serialize()}`);

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

let lastUpdate = moment();
let accumulator = 0;
let deltaTime = 1 / config.updatesPerSecond;

const loop = () => {
  let now = moment();
  accumulator += moment.duration(now.diff(lastUpdate)).asSeconds();
  // console.log(now.milliseconds(), lastUpdate.milliseconds(), accumulator);
  lastUpdate = now;
  if (accumulator >= deltaTime) {
    accumulator -= deltaTime;
    let entitiesToUpdate = entities.filter(entity => {
      entity.update(deltaTime);
      return entity.hasChangedOrientation;
    });
    if (entitiesToUpdate.length > 0) {
      broadcastMessage(`update|${entitiesToUpdate.map(e => e.serialize())}`);
    }
  }
  setImmediate(loop);
};

setImmediate(loop);
