import config from '../config.json';
import {autoDetectRenderer, Container} from 'pixi.js'
import {Entity} from './entity';
import {Key} from './input';
import uuid from 'uuid';

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;

let renderer = autoDetectRenderer(config.width, config.height);
document.body.appendChild(renderer.view);

let stage = new Container();
let entities = [];

const getOrCreateSessionID = () => {
  if (!sessionStorage.sessionID) {
    sessionStorage.sessionID = uuid();
  }

  return sessionStorage.sessionID;
};

const handleInitializeEvent = (eventData) => {
  // input: id,x,y,r|...
  stage.removeChildren();
  entities = [];
  eventData = eventData.split('|');
  eventData.forEach(entityData => {
    let properties = entityData.split(',');
    let id = properties[0];
    let x = parseFloat(properties[1]);
    let y = parseFloat(properties[2]);
    let r = parseFloat(properties[3]);
    let entity = new Entity(id, x, y, r);
    stage.addChild(entity.sprite);
    entities.push(entity);
  });
};

const handleAddEvent = (eventData) => {
  // input: id,x,y,r
  console.log('handleAddEvent:', eventData);
  let properties = eventData.split(',');
  let id = properties[0];
  let x = parseFloat(properties[1]);
  let y = parseFloat(properties[2]);
  let r = parseFloat(properties[3]);
  let entity = new Entity(id, x, y, r);
  stage.addChild(entity.sprite);
  entities.push(entity);
};

const handleUpdateEvent = (eventData) => {
  // input: id,x,y,r|...
  console.log('handleUpdateEvent:', eventData);
  eventData = eventData.split('|');
  eventData.forEach(entityData => {
    let properties = entityData.split(',');
    let id = properties[0];
    let entity = entities.find(entity => entity.id === id);
    if (entity) {
      let x = parseFloat(properties[1]);
      let y = parseFloat(properties[2]);
      let r = parseFloat(properties[3]);
      entity.setPosition(x, y);
      entity.setRotation(r);
    } else {
      console.log(`can't find entity: ${id}`);
    }
  })
};

const handleRemoveEvent = (eventData) => {
  // input: id
  console.log('handleRemoveEvent:', eventData);
  let entity = entities.find(entity => entity.id === eventData);
  let index = entities.indexOf(entity);
  if (index !== -1) {
    entities.splice(index, 1);
    stage.removeChild(entity.sprite);
  }
};

const getEventHandler = (name) => {
  switch (name) {
    case 'initialize': return handleInitializeEvent;
    case 'add': return handleAddEvent;
    case 'update': return handleUpdateEvent;
    case 'remove': return handleRemoveEvent;
  }
};

let sessionID = getOrCreateSessionID();

const socket = new WebSocket(`ws://${config.server}/${sessionID}`);

socket.addEventListener('open', (event) => {
  console.log('websocket opened:', config.server);
});

socket.addEventListener('message', (event) => {
  console.log('websocket message received:', event.data);
  let split = event.data.indexOf('|');
  if (split !== -1) {
    let command = event.data.slice(0, split);
    let parameters = event.data.slice(split + 1);
    let eventHandler = getEventHandler(command);
    eventHandler(parameters);
  }
});

socket.addEventListener('close', (event) => {
  console.log('websocket closed:', config.server);
});

let keysDown = [];

window.addEventListener('keydown', (event) => {
  // console.log('keydown:', event.keyCode);
  if (keysDown.includes(event.keyCode)) return;
  keysDown.push(event.keyCode);

  if (event.keyCode === Key.A || event.keyCode === Key.Left) {
    socket.send(`start-rotate|left`);
  }

  if (event.keyCode === Key.D || event.keyCode === Key.Right) {
    socket.send(`start-rotate|right`);
  }

  if (event.keyCode === Key.W || event.keyCode === Key.Up) {
    socket.send(`start-thrust|forward`);
  }

  if (event.keyCode === Key.S || event.keyCode === Key.Down) {
    socket.send(`start-thrust|backward`);
  }
});

window.addEventListener('keyup', (event) => {
  // console.log('keyup:', event.keyCode);
  let index = keysDown.indexOf(event.keyCode);
  if (index !== -1) {
    keysDown.splice(index, 1);
  }

  if (event.keyCode === Key.A || event.keyCode === Key.Left) {
    socket.send(`stop-rotate|left`);
  }

  if (event.keyCode === Key.D || event.keyCode === Key.Right) {
    socket.send(`stop-rotate|right`);
  }

  if (event.keyCode === Key.W || event.keyCode === Key.Up) {
    socket.send(`stop-thrust|forward`);
  }

  if (event.keyCode === Key.S || event.keyCode === Key.Down) {
    socket.send(`stop-thrust|backward`);
  }
});

const loop = () => {
  requestAnimationFrame(loop);
  renderer.render(stage);
};

loop();
