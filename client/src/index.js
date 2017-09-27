import config from '../config.json';
import {autoDetectRenderer, Container} from 'pixi.js'
import Ship from './ship';
import {Key} from './input';

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;

let renderer = autoDetectRenderer(config.width, config.height);
document.body.appendChild(renderer.view);

let stage = new Container();
let entities = [];
let controlledEntity;

const socket = new WebSocket(`ws://${config.server}`);

socket.addEventListener('open', (event) => {
  console.log('websocket opened:', config.server);
  socket.send('initialize');
});

socket.addEventListener('message', (event) => {
  console.log('websocket message received:', event.data);
  if (event.data.indexOf('|') !== -1) {
    let components = event.data.split('|');
    let command = components[0];
    let parameters = components.slice(1);

    switch (command) {

      case 'initialize':
        // initialize|id,type,x,y,r|id,type,x,y,r

        stage.removeChildren();
        entities = [];

        parameters.forEach(parameter => {
          let subparameters = parameter.split(',');
          let id = subparameters[0];
          let type = subparameters[1];
          let position = [subparameters[2], subparameters[3]];
          let rotation = subparameters[4];
          let entity = createEntity(type, id, position, rotation);
          
          stage.addChild(entity.sprite);
          entities.push(entity);
        });
        break;

      case 'control':
        // control|id

        let id = parameters[0];
        controlledEntity = entities.find(entity => entity.id === id);
        break;

      case 'update':
        // update|id|x,y|rotation
        
        let entity = getEntity(parameters[0]);
        let position = parameters[1].split(',');
        let rotation = parameters[2];
        entity.setPosition(position);
        entity.setRotation(rotation);
        break;

      default:
        console.log('unknown command:', command);

    }
  }
});

const createEntity = (type, id, position, rotation) => {
  switch (type) {

    case 'ship':
      return new Ship(id, position, rotation);

    default:
      console.log('unknown entity type:', type);

  }
};

const getEntity = (id) => {
  return entities.find(entity => entity.id === id);
};

socket.addEventListener('close', (event) => {
  console.log('websocket closed:', config.server);
});

window.addEventListener('keydown', (event) => {
  if (controlledEntity) {

    if (event.keyCode === Key.A || event.keyCode === Key.Left) {
      socket.send(`start-rotate|left`);
    }

    if (event.keyCode === Key.D || event.keyCode === Key.Right) {
      socket.send(`start-rotate|right`);
    }

  }
});

window.addEventListener('keyup', (event) => {
  if (controlledEntity) {

    if (event.keyCode === Key.A || event.keyCode === Key.Left) {
      socket.send(`stop-rotate|left`);
    }

    if (event.keyCode === Key.D || event.keyCode === Key.Right) {
      socket.send(`stop-rotate|right`);
    }

  }
});

const loop = () => {
  requestAnimationFrame(loop);
  renderer.render(stage);
};

loop();
