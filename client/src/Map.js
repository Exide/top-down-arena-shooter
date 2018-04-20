import EntityService from './EntityService';
import LevelService from './LevelService';
import {Point} from 'pixi.js';
import {centeredToTopLeft} from '../../utils/coordinate';

// coordinate system:
//  top-left origin
//
//   0---x+
//   |
//   y
//   +

const WIDTH = 1000;
const HEIGHT = 1000;

export default class Map {

  constructor() {
    this.element = document.createElement('canvas');
    this.element.id = 'map';
    this.element.style.display = 'none';
    this.element.style.position = 'absolute';
    this.element.style.top = '50%';
    this.element.style.left = '50%';
    this.element.style.margin = `-${WIDTH / 2}px 0 0 -${HEIGHT / 2}px`;
    this.element.style.border = '1px #606060 solid';
    this.element.style.backgroundColor = '#303030';
    this.element.style.opacity = '0.9';
    this.element.style.width = `${WIDTH}px`;
    this.element.style.height = `${HEIGHT}px`;
    this.element.width = WIDTH;
    this.element.height = HEIGHT;
    document.body.appendChild(this.element);
    this.context = this.element.getContext('2d');
    this.blips = [];
    this.isVisible = false;
  }

  update(entities) {
    this.blips = [];
    entities.forEach(entity => {
      let size = entity.getSize();
      size = this.sizeScaledToCanvas(size);

      let position = entity.getPosition();
      position = this.positionScaledToCanvas(position);
      position = centeredToTopLeft(position.x, position.y, WIDTH, HEIGHT);
      position = this.positionAdjustedForFillRect(position.x, position.y, size.w, size.h);
      let blip = {
        x: position.x,
        y: position.y,
        w: size.w,
        h: size.h,
        color: this.getColorByEntityType(entity)
      };
      this.blips.push(blip);
    });
  }

  draw() {
    this.context.clearRect(0, 0, WIDTH, HEIGHT);
    this.blips.forEach(blip => {
      this.context.fillStyle = blip.color;
      this.context.fillRect(blip.x, blip.y, blip.w, blip.h);
    });
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.element.style.display = 'block';
    } else {
      this.element.style.display = 'none';
    }
  }

  positionRelativeToPlayer(position) {
    let player = EntityService.get().getLocalPlayer().getPosition();
    return {
      x: position.x - player.x,
      y: position.y - player.y
    }
  }

  positionScaledToCanvas(position) {
    let scale = {
      x: WIDTH / LevelService.get().getWidth(),
      y: HEIGHT / LevelService.get().getHeight()
    };
    return {
      x: position.x * scale.x,
      y: position.y * scale.y
    }
  }

  positionAdjustedForFillRect(x, y, w, h) {
    return {
      x: x - (w / 2),
      y: y - (h / 2)
    }
  }

  sizeScaledToCanvas(size) {
    let scale = {
      x: WIDTH / LevelService.get().getWidth(),
      y: HEIGHT / LevelService.get().getHeight()
    };
    return {
      w: size.w * scale.x,
      h: size.h * scale.y
    }
  }

  getColorByEntityType(entity) {
    switch (entity.type.toLowerCase()) {
      case 'ship':
        if (EntityService.get().isLocalPlayer(entity)) {
          return 'white';
        } else {
          return 'red';
        }
      case 'wall':
        return 'gray';
      case 'asteroid':
        return 'burlywood';
    }
  }

};
