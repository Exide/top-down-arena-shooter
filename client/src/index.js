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

const addEntity = (entity) => {
  stage.addChild(entity.sprite);
  entities.push(entity);
};

const createEntity = (parameters) => {
  // id,x,y,r
  let id = parameters[0];
  let x = parseFloat(parameters[1]);
  let y = parseFloat(parameters[2]);
  let r = parseFloat(parameters[3]);
  return new Entity(id, x, y, r);
};

const handleUpdateEvent = (eventData) => {
  // [id,x,y,rotation, ...]
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

const removeEntity = (id) => {
  let entity = entities.find(entity => entity.id === id);
  let index = entities.indexOf(entity);
  if (index !== -1) {
    entities.splice(index, 1);
    stage.removeChild(entity.sprite);
  }
};

let sessionID = getOrCreateSessionID();

const socket = new WebSocket(`ws://${config.server}/${sessionID}`);

socket.addEventListener('open', (event) => {
  console.log('websocket opened:', config.server);
});

socket.addEventListener('message', (event) => {
  console.log('websocket message received:', event.data);
  if (event.data.indexOf('|') !== -1) {
    let components = event.data.split('|');
    let command = components[0];
    let parameters = components.slice(1);

    switch (command) {

      case 'initialize':
        // initialize|id,x,y,r|id,x,y,r
        stage.removeChildren();
        entities = [];
        parameters.forEach(parameter => {
          let entityParameters = parameter.split(',');
          if (entityParameters) {
            let entity = createEntity(entityParameters);
            addEntity(entity);
          }
        });
        break;

      case 'add':
        // add|id,x,y,r
        let entity = createEntity(parameters[0].split(','));
        addEntity(entity);
        break;

      case 'update':
        handleUpdateEvent(parameters);
        break;

      case 'remove':
        // remove|id
        removeEntity(parameters[0]);
        break;

      default:
        console.log('unknown command:', command);

    }
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
