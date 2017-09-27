const config = require('../config.json');
const WebSocket = require('ws');
const {getRandomNumber} = require('../../utils/random');
const {Entity} = require('./entity');

let connections = {};
let entities = [];

const server = new WebSocket.Server({
  host: config.host,
  port: config.port
});

server.on('connection', (ws, http) => {

  const address = getRemoteAddress(http);
  ws.address = address;
  console.log(`${address} | http ${http.method.toLowerCase()} ${http.url}`);

  let entity;
  let id = connections[address];
  if (!id) {
    let x = config.mapWidth * getRandomNumber();
    let y = config.mapHeight * getRandomNumber();
    let r = getRandomNumber();
    entity = new Entity([x, y], r);
    entities.push(entity);
    connections[address] = entity.id;
  } else {
    entity = entities.find(entity => entity.id === id);
  }

  ws.on('message', (message) => {
    console.log(`${address} | websocket received: ${message}`);
    let components = message.split('|');
    let command = components[0];
    switch (command) {

      case 'initialize':
        let serializedEntities = entities.map(entity => entity.serialize());
        sendMessage(address, `initialize|${serializedEntities.join('|')}`);
        sendMessage(address, `control|${entity.id}`);
        break;

      case 'start-rotate':
        entity.startRotating(components[1]);
        break;

      case 'stop-rotate':
        entity.stopRotating(components[1]);
        break;

      default:
        console.log(`${address} | message ignored: ${message}`);
        break;

    }
  });

  ws.on('close', () => {
    console.log(`${address} | websocket closed`);
    entities = entities.filter(e => e !== entity);
    delete connections[address];
    broadcastMessage(`remove|${entity.id}`);
  });

  ws.on('error', (error) => {
    console.log(`${address} | websocket error: ${error}`);
  });

  console.log(`${address} | websocket opened`);

});

console.log(`Listening at ws://${config.host}:${config.port}`);

const sendMessage = (address, message) => {
  let client = getClient(address);
  client.send(message);
  console.log(`${address} | websocket sent: ${message}`);
};

const broadcastMessage = (message) => {
  console.log(`websocket broadcast: ${message}`);
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const getClient = (address) => {
  for (let client of server.clients) {
    if (client.address === address)
      return client;
  }
};

const getRemoteAddress = (request) => {
  if ('x-forwarded-for' in request.headers) {
    return request.headers['x-forwarded-for'];
  } else {
    return request.connection.remoteAddress;
  }
};

const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(resolve, ms);
    } catch (error) {
      reject(error);
    }
  });
};

const loop = () => {
  sleep(1000 / config.updatesPerSecond)
    .then(() => {
      entities.forEach(entity => {
        entity.update();
        broadcastMessage(`update|${entity.id}|${entity.position.join(',')}|${entity.rotation}`);
      });
      loop();
    });
};

loop();
