import config from '../config.json';
import {autoDetectRenderer, Container, Point} from 'pixi.js';
import {Entity} from './entity';
import {Key} from './input';
import uuid from 'uuid';
import EntityService from './EntityService';
import MapService from './MapService';
import Radar from './Radar';

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;

let renderer = autoDetectRenderer(config.width, config.height);
document.body.appendChild(renderer.view);

let stage = new Container();
let entityService = EntityService.get();
let mapService = MapService.get();
let radar = new Radar();

const getOrCreateSessionID = () => {
  if (!sessionStorage.sessionID) {
    sessionStorage.sessionID = uuid();
  }

  return sessionStorage.sessionID;
};

const handleInitializeEvent = (eventData) => {
  // input: id,x,y,r|...
  stage.removeChildren();
  entityService.clear();
  eventData = eventData.split('|');
  eventData.forEach(entityData => {
    let properties = entityData.split(',');
    let id = properties[0];
    let type = properties[1];
    let x = parseFloat(properties[2]);
    let y = parseFloat(properties[3]);
    let r = parseFloat(properties[4]);
    let w = parseFloat(properties[5]);
    let h = parseFloat(properties[6]);
    let entity = new Entity(id, type, x, y, r, w, h);
    stage.addChild(entity.sprite);
    entityService.add(entity);
  });
};

const handleMapEvent = (eventData) => {
  // input width,height
  let dimensions = eventData.split(',');
  mapService.setDimensions(dimensions[0], dimensions[1]);
};

const handleIdentityEvent = (eventData) => {
  // input: id
  entityService.setPlayerIdentity(eventData);
};

const handleAddEvent = (eventData) => {
  // input: id,x,y,r
  let properties = eventData.split(',');
  let id = properties[0];
  let type = properties[1];
  let x = parseFloat(properties[2]);
  let y = parseFloat(properties[3]);
  let r = parseFloat(properties[4]);
  let w = parseFloat(properties[5]);
  let h = parseFloat(properties[6]);
  let entity = new Entity(id, type, x, y, r, w, h);
  stage.addChild(entity.sprite);
  entityService.add(entity);
};

const handleUpdateEvent = (eventData) => {
  // input: id,x,y,r|...
  eventData = eventData.split('|');
  eventData.forEach(entityData => {
    let properties = entityData.split(',');
    let id = properties[0];
    let entity = entityService.getById(id);
    if (entity) {
      let x = parseFloat(properties[2]);
      let y = parseFloat(properties[3]);
      let r = parseFloat(properties[4]);
      let w = parseFloat(properties[5]);
      let h = parseFloat(properties[6]);
      entity.setPosition(x, y);
      entity.setRotation(r);
      entity.setSize(w, h);
    } else {
      console.log(`can't find entity: ${id}`);
    }
  });
};

const handleRemoveEvent = (eventData) => {
  // input: id
  let entity = entityService.removeById(eventData);
  if (entity) {
    stage.removeChild(entity.sprite);
  }
};

const getEventHandler = (name) => {
  switch (name) {
    case 'initialize': return handleInitializeEvent;
    case 'map': return handleMapEvent;
    case 'identity': return handleIdentityEvent;
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
  if (entityService.localPlayer) {
    let player = entityService.getLocalPlayer().sprite.position;
    stage.position.x = config.width / 2;
    stage.position.y = config.height / 2;
    stage.pivot.x = player.x;
    stage.pivot.y = player.y;
  }
  renderer.render(stage);
  if (entityService.localPlayer) {
    let nearbyEntities = entityService.getNearby(config.radar.range);
    radar.update(nearbyEntities);
    radar.draw();
  }
};

loop();
