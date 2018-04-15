const WebSocket = require('ws');
const moment = require('moment');

exports.test = async function test(description, logic, timeoutMS=5000) {
  console.log(`executing spec: ${description}`);
  let result;
  try {
    let promise = wrapInPromise(logic);
    result = await race(promise, timeoutMS);
  } catch (e) {
    console.log('error:', e);
    if (result) result.return();
  }
};

function wrapInPromise(logic) {
  return new Promise((resolve, reject) => {
    try {
      logic();
      resolve('succeeded');
    } catch (e) {
      console.log('error:', e);
      reject('failed');
    }
  });
}

function race(promise, timeoutMS) {
  let timer;
  return Promise.race([
    new Promise((resolve, reject) => {
      let start = moment.utc();
      timer = setTimeout(() => {
        let now = moment.utc();
        reject(`timed out after ${now.diff(start)}ms`)
      }, timeoutMS);
    }),
    promise.then(value => {
      clearTimeout(timer);
      return value;
    })
  ]);
}

exports.connect = function connect(url) {
  return new Promise(resolve => {
    let statistics = {
      totalBytes: 0,
      totalMessages: 0,
      messages: []
    };

    let protocols = undefined;
    let options = undefined;
    let socket = new WebSocket(url, protocols, options);

    socket.on('open', () => {
      console.log('websocket opened');
      resolve({
        socket: socket,
        stats: statistics
      })
    });

    socket.on('message', (message) => {
      let bytes = Buffer.from(message).length;
      statistics.totalBytes += bytes;
      statistics.totalMessages += 1;
      statistics.messages.push({
        when: moment.utc(),
        bytes: bytes,
        message: message
      });
    });

    socket.on('close', () => {
      console.log('websocket closed');
    })
  });
};

exports.disconnect = function disconnect(connection) {
  return new Promise(resolve => {
    connection.socket.close(1000, 'success');
    resolve(connection);
  });
};

exports.send = function send(message) {
  return (connection) => {
    return new Promise(resolve => {
      let options = undefined;
      connection.socket.send(message, options, () => resolve(connection));
    })
  };
};


exports.wait = function wait(ms) {
  return (connection) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(connection), ms);
    });
  };
};
