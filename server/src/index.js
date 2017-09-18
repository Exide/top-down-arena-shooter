const config = require('../config.json');
const WebSocket = require('ws');

const server = new WebSocket.Server({
  host: config.host,
  port: config.port
});

server.on('connection', (ws, http) => {

  const sendMessage = (message) => {
    ws.send(message);
    console.debug('websocket message sent:', message);
  };

  ws.on('message', (message) => {
    console.debug('websocket message received:', message);
    sendMessage(':D');
  });

  ws.on('close', () => {
    console.info('websocket closed');
  });

  ws.on('error', (error) => {
    console.error('websocket error:', error);
  });

  console.info('websocket opened');

});

console.log(`listening at ws://${config.host}:${config.port}`);
