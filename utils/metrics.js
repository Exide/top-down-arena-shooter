const config = require('../server/config.json');
const StatsD = require('hot-shots');
const moment = require('moment');

const now = () => {
  return moment().utc().toISOString();
};

const client = module.exports = new StatsD({
  host: config.statsd.host,
  prefix: 'tdas.server.',
  mock: !config.statsd.enabled
});

client.socket.on('error', (error) => {
  console.log(`${now()} | metrics | StatsD socket error: ${error}`);
});

client.socket.on('close', () => {
  console.log(`${now()} | metrics | StatsD socket closed`);
});
