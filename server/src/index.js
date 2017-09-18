const config = require('../config.json');
const WebSocket = require('ws');

const server = new WebSocket.Server({
  host: config.host,
  port: config.port
});

server.on('connection', (ws) => {

  const sendMessage = (message) => {
    ws.send(message);
    console.log('websocket message sent:', message);
  };

  ws.on('open', (id) => {
    console.log('websocket opened:', id);
  });

  ws.on('message', (message) => {
    console.log('websocket message received:', message);
    sendMessage(':D');
  });

  ws.on('close', (id) => {
    console.log('websocket closed:', id);
  });

});

console.log(`listening at ws://${config.host}:${config.port}`);
