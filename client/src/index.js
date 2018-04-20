import config from '../config.json';
import {autoDetectRenderer, Container, Point, Texture, extras} from 'pixi.js';
const {TilingSprite} = extras;
import {Entity} from './entity';
import {Key} from './input';
import uuid from 'uuid';
import EntityService from './EntityService';
import LevelService from './LevelService';
import Radar from './Radar';
import {centeredToTopLeft} from "../../utils/coordinate";
import Map from './Map';
import spacePNG from '../resources/images/space.png';

let name = 'top-down-arena-shooter';
let version = '0.0.1';
document.title = `${name} v${version}`;
document.body.style.position = 'relative';
document.body.style.backgroundColor = '#111111';
document.body.style.padding = '0';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

let renderer = autoDetectRenderer(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.view);
renderer.view.style.borderColor = '#222222';
renderer.view.style.borderStyle = 'solid';
renderer.view.style.borderWidth = '1px';

let masterContainer = new Container();
let backgroundContainer = new Container();
masterContainer.addChild(backgroundContainer);
let sceneContainer = new Container();
masterContainer.addChild(sceneContainer);
let debugContainer = new Container();
masterContainer.addChild(debugContainer);

let background = new TilingSprite(Texture.fromImage(spacePNG));
background.width = renderer.width;
background.height = renderer.height;
backgroundContainer.addChild(background);

window.addEventListener('resize', (event) => {
  let width = event.target.innerWidth;
  let height = event.target.innerHeight;
  console.log(`window.resize event: w:${width}, h:${height}`);
  renderer.resize(width, event.target.innerHeight);
  background.width = renderer.width;
  background.height = renderer.height;
});

let entityService = EntityService.get();
let levelService = LevelService.get();
let radar = new Radar();
let map = new Map();

const getOrCreateSessionID = () => {
  if (!sessionStorage.sessionID) {
    sessionStorage.sessionID = uuid();
  }

  return sessionStorage.sessionID;
};

const handleInitializeEvent = (eventData) => {
  // input: id,x,y,r|...
  sceneContainer.removeChildren();
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
    sceneContainer.addChild(entity.sprite);
    entityService.add(entity);
  });
};

const handleMapEvent = (eventData) => {
  // input width,height
  let dimensions = eventData.split(',');
  levelService.setDimensions(dimensions[0], dimensions[1]);
};

const handleIdentityEvent = (eventData) => {
  // input: id
  entityService.setLocalPlayer(eventData);
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
  sceneContainer.addChild(entity.sprite);
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
    sceneContainer.removeChild(entity.sprite);
  }
};

const handleDebugPointsEvent = (eventData) => {
  // input: x,y|...
  eventData = eventData.split('|');
  let points = eventData.map(pointData => {
    let properties = pointData.split(',');
    return {
      x: parseFloat(properties[0]),
      y: parseFloat(properties[1])
    };
  });

  for (let i = 0; i < points.length; ++i) {
    let point = points[i];
    point = convertServerPositionToPIXIPosition(point);
    let nextPoint = (i !== points.length - 1) ? points[i + 1] : points[0];
    nextPoint = convertServerPositionToPIXIPosition(nextPoint);

    let primitive = new PIXI.Graphics();
    debugContainer.addChild(primitive);
    primitive.lineStyle(1, 0x00FF00);
    primitive.moveTo(point.x, point.y);
    primitive.lineTo(nextPoint.x, nextPoint.y);
  }
};

const handleDebugNormalsEvent = (eventData) => {
  // input: Px,Py|Nx0,Ny0|Nx1,Ny1|Nx2,Ny2|Nx3,Ny3
  eventData = eventData.split('|');

  let positionData = eventData.shift().split(',');
  let position = {
    x: parseFloat(positionData[0]),
    y: parseFloat(positionData[1])
  };
  position = convertServerPositionToPIXIPosition(position);

  let normals = eventData.map(normalData => {
    let properties = normalData.split(',');
    return {
      x: parseFloat(properties[0]),
      y: parseFloat(properties[1])
    };
  });

  for (let i = 0; i < normals.length; ++i) {
    let normal = {
      x: normals[i].x + position.x,
      y: -normals[i].y + position.y
    };

    let primitive = new PIXI.Graphics();
    debugContainer.addChild(primitive);
    primitive.lineStyle(1, 0x0000FF);
    primitive.moveTo(position.x, position.y);
    primitive.lineTo(normal.x, normal.y);
  }
};

function convertServerPositionToPIXIPosition(position) {
  let levelService = LevelService.get();
  let w = levelService.getWidth();
  let h = levelService.getHeight();
  return centeredToTopLeft(position.x, position.y, w, h);
}

const getEventHandler = (name) => {
  switch (name) {
    case 'initialize': return handleInitializeEvent;
    case 'map': return handleMapEvent;
    case 'identity': return handleIdentityEvent;
    case 'add': return handleAddEvent;
    case 'update': return handleUpdateEvent;
    case 'remove': return handleRemoveEvent;
    case 'debug-points': return handleDebugPointsEvent;
    case 'debug-normals': return handleDebugNormalsEvent;
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
  // console.log(`keydown: ${event.key} (${event.keyCode})`);

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

  if (event.keyCode === Key.Space) {
    socket.send(`start-fire`);
  }

  if (event.keyCode === Key.M) {
    if (!map.isVisible) {
      map.toggleVisibility();
    }
  }

});

window.addEventListener('keyup', (event) => {
  // console.log(`keyup: ${event.key} (${event.keyCode})`);

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

  if (event.keyCode === Key.Space) {
    socket.send(`stop-fire`);
  }

  if (event.keyCode === Key.M) {
    if (map.isVisible) {
      map.toggleVisibility();
    }
  }

});

const loop = () => {
  requestAnimationFrame(loop);
  if (entityService.localPlayer) {
    let player = entityService.getLocalPlayer().sprite.position;
    masterContainer.position.x = renderer.width / 2;
    masterContainer.position.y = renderer.height / 2;
    masterContainer.pivot.x = player.x;
    masterContainer.pivot.y = player.y;
    backgroundContainer.position.x = player.x - renderer.width / 2;
    backgroundContainer.position.y = player.y - renderer.height / 2;
  }
  renderer.render(masterContainer);
  if (entityService.localPlayer) {
    let nearbyEntities = entityService.getNearby(config.radar.range);
    radar.update(nearbyEntities);
    radar.draw();
  }
  if (map.isVisible) {
    map.update(entityService.entities);
    map.draw();
  }
  debugContainer.removeChildren();
};

loop();
