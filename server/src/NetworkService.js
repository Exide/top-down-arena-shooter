const config = require('../config.json');
const moment = require('moment');
const WebSocket = require('ws');

let instance;

class NetworkService {

  static get() {
    if (!instance) {
      instance = new NetworkService();
    }
    return instance;
  }

  constructor() {
    this.sessions = [];
    this.server = undefined;
  }

  start(onConnect, onMessage, onDisconnect) {
    console.log(`${now()} | NetworkService | initializing websocket service`);
    this.server = new WebSocket.Server({ port: config.port });

    this.server.on('error', (error) => {
      console.log(`${now()} | NetworkService | http | ${error}`);
    });

    this.server.on('connection', (ws, http) => {
      console.log(`${now()} | NetworkService | http | ${http.method.toLowerCase()} ${http.url}`);

      const session = new Session(ws, http);
      console.log(`${now()} | NetworkService | session created: ${session.id}`);
      this.sessions.push(session);

      onConnect(session);

      ws.on('message', (message) => {
        console.log(`${now()} | NetworkService | ws | ${session.id} | received: ${message}`);
        onMessage(session, message);
      });

      ws.on('close', () => {
        console.log(`${now()} | NetworkService | ws | ${session.id} | closed`);
        let index = this.sessions.indexOf(session);
        this.sessions.splice(index, 1);
        onDisconnect(session);
      });

      ws.on('error', (error) => {
        console.log(`${now()} | NetworkService | ws | ${session.id} | error: ${error}`);
      });

      console.log(`${now()} | NetworkService | ws | ${session.id} | opened`);

    });

    console.log(`${now()} | NetworkService | ws | listening on port ${config.port}`);
  }

  send(session, message) {
    session.socket.send(message);
    // console.log(`${now()} | NetworkService | ws | ${session.id} | sent: ${message}`);
  }

  broadcast(message) {
    // console.log(`${now()} | NetworkService | ws | ${session.id} broadcast: ${message}`);
    this.sessions.forEach(session => {
      if (session.socket.readyState === WebSocket.OPEN) {
        this.send(session, message);
      }
    });
  }

}

module.exports = NetworkService;

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

function now() {
  return moment().utc().toISOString();
}
