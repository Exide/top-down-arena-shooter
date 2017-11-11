import config from '../config.json';
import EntityService from './EntityService';
import MapService from './MapService';
import {Point} from 'pixi.js';

/**
 *  Radar axes (top-left origin):
 *
 *            0---- +X
 *            |
 *            |
 *           +Y
 *
 */

export default class Radar {

  constructor() {
    this.element = document.createElement('canvas');
    this.element.id = 'radar';
    this.element.width = config.radar.width;
    this.element.height = config.radar.height;
    this.element.style.width = `${config.radar.width}px`;
    this.element.style.height = `${config.radar.height}px`;
    this.element.style.position = 'absolute';
    this.element.style.top = '8px';
    this.element.style.left = '8px';
    this.element.style.border = '1px #606060 solid';
    this.element.style.backgroundColor = '#303030';
    this.element.style.opacity = '0.75';
    document.body.appendChild(this.element);
    this.context = this.element.getContext('2d');
    this.blips = [];
    this.blipSize = 2;
  }
  
  update(entities) {
    this.blips = [];
    let playerPosition = EntityService.get().getLocalPlayer().getPosition();
    entities.forEach(entity => {
      let entityPosition = entity.getPosition();
      let relativeX = entityPosition.x - playerPosition.x;
      let relativeY = entityPosition.y - playerPosition.y;
      let positionRelativeToPlayer = new Point(relativeX, relativeY);
      let positionScaledToRadar = scalePositionToRadar(positionRelativeToPlayer);
      let x = positionScaledToRadar.x + (config.radar.width / 2);
      let y = -positionScaledToRadar.y + (config.radar.height / 2);
      this.blips.push(new Point(x, y));
    });
  }
  
  draw() {
    this.context.clearRect(0, 0, config.radar.width, config.radar.height);
    this.context.fillStyle = 'white';
    this.context.fillRect(config.radar.width / 2, config.radar.height / 2, this.blipSize, this.blipSize);
    this.context.fillStyle = 'pink';
    this.blips.forEach(blip => {
      this.context.fillRect(blip.x, blip.y, this.blipSize, this.blipSize);
    });
  }
  
}

const scalePositionToRadar = (point) => {
  let mapWidth = MapService.get().getWidth();
  let mapHeight = MapService.get().getHeight();
  let horizontalScale = mapWidth / config.radar.width;
  let verticalScale = mapHeight / config.radar.height;
  let x = point.x / horizontalScale;
  let y = point.y / verticalScale;
  return new Point(x, y);
};
