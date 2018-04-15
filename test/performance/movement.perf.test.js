const {test, connect, disconnect, send, wait} = require('./lib');
const uuid = require('uuid/v4');
const serverConfig = require('../../server/config');

const serverURL = `ws://${serverConfig.host}:${serverConfig.port}/${uuid()}`;
const testTimeoutMS = 100; // 7s
const thrustTimeMS = 5000; // 5s

test('1 player moving', async () => {
  const connection = await connect(serverURL)
    .then(send('start-thrust|forward'))
    .then(wait(thrustTimeMS))
    .then(send('stop-thrust|forward'))
    .then(disconnect);

  console.log(`total bytes: ${connection.stats.totalBytes}`);
  console.log(`total messages: ${connection.stats.totalMessages}`);
}, testTimeoutMS);
