const config = require('../config.json');
const WebSocket = require('ws');

const server = new WebSocket.Server({
  host: config.host,
  port: config.port
});

server.on('connection', (ws, http) => {

  const address = getRemoteAddress(http);
  console.log(`${address} | http ${http.method.toLocaleLowerCase()} ${http.url}`);

  const sendMessage = (message) => {
    ws.send(message);
    console.log(`${address} | websocket sent: ${message}`);
  };

  ws.on('message', (message) => {
    console.log(`${address} | websocket received: ${message}`);
    sendMessage(':D');
  });

  ws.on('close', () => {
    console.log(`${address} | websocket closed`);
  });

  ws.on('error', (error) => {
    console.log(`${address} | websocket error: ${error}`);
  });

  console.log(`${address} | websocket opened`);

});

console.log(`Listening at ws://${config.host}:${config.port}`);

const getRemoteAddress = (request) => {
  if ('x-forwarded-for' in request.headers) {
    return request.headers['x-forwarded-for'];
  } else {
    return request.connection.remoteAddress;
  }
};
