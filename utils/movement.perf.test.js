const serverConfig = require('../server/config');
const uuid = require('uuid/v4');
const WebSocket = require('ws');
const moment = require('moment');

test('1 player', (done) => {
  let connection = createConnection();
  setTimeout(() => {
    connection.socket.send('start-thrust:forward');
    setTimeout(() => {
      connection.socket.send('stop-thrust:forward');
      connection.socket.close(1000, 'player 1 scenario complete');
      expect(connection.stats).toBeDefined();
      console.log(`total bytes: ${connection.stats.totalBytes}`);
      console.log(`total messages: ${connection.stats.totalMessages}`);
      done();
    }, 5000);
  }, 5000);
}, 15000);

function createConnection() {
  let sessionId = uuid();
  let statistics = {
    totalBytes: 0,
    totalMessages: 0,
    messages: []
  };

  let ws = new WebSocket(`ws://${serverConfig.host}:${serverConfig.port}/${sessionId}`);

  ws.on('open', () => {
    console.log('websocket opened');
  });

  ws.on('message', (message) => {
    let bytes = Buffer.from(message).length;
    statistics.totalBytes += bytes;
    statistics.totalMessages += 1;
    statistics.messages.push({
      when: moment.utc(),
      bytes: bytes,
      message: message
    });
  });

  ws.on('close', () => {
    console.log('websocket closed');
  });

  return {
    socket: ws,
    stats: statistics
  };
}
