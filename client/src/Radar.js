import config from '../config.json';
import EntityService from './EntityService';
import {Point} from 'pixi.js';
import {centeredToTopLeft} from '../../utils/math';

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
    this.element.style.position = 'absolute';
    this.element.style.top = '8px';
    this.element.style.left = '8px';
    this.element.style.border = '1px #606060 solid';
    this.element.style.backgroundColor = '#303030';
    this.element.style.opacity = '0.75';
    this.setSize(config.radar.width, config.radar.height);
    document.body.appendChild(this.element);
    this.context = this.element.getContext('2d');
    this.blips = [];
  }

  setSize(w, h) {
    this.element.width = w;
    this.element.height = h;
    this.element.style.width = `${w}px`;
    this.element.style.height = `${h}px`;
    this.scale = {
      x: parseFloat(config.radar.range / w),
      y: parseFloat(config.radar.range / h)
    };
  }

  update(entities) {
    this.blips = [];
    entities.forEach(entity => {
      let size = entity.getSize();
      size = this.sizeScaledToRadar(size);
      let position = entity.getPosition();
      position = this.positionRelativeToPlayer(position);
      position = this.positionScaledToRadar(position);
      position = centeredToTopLeft(position.x, position.y, config.radar.width,config.radar.height);
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
    this.context.clearRect(0, 0, config.radar.width, config.radar.height);
    this.context.fillStyle = 'white';
    this.context.fillRect(config.radar.width / 2, config.radar.height / 2, 2, 2);
    this.blips.forEach(blip => {
      this.context.fillStyle = blip.color;
      this.context.fillRect(blip.x, blip.y, blip.w, blip.h);
    });
  }

  positionRelativeToPlayer(position) {
    let player = EntityService.get().getLocalPlayer().getPosition();
    return {
      x: position.x - player.x,
      y: position.y - player.y
    }
  }

  positionScaledToRadar(position) {
    return {
      x: position.x / this.scale.x,
      y: position.y / this.scale.y
    }
  }

  positionAdjustedForFillRect(x, y, w, h) {
    return {
      x: x - (w / 2),
      y: y - (h / 2)
    }
  }

  sizeScaledToRadar(size) {
    return {
      w: size.w / this.scale.x,
      h: size.h / this.scale.y
    }
  }

  getColorByEntityType(entity) {
    switch (entity.type.toLowerCase()) {
      case 'ship':
        return 'pink';
      case 'wall':
        return 'gray';
      case 'asteroid':
        return 'burlywood';
    }
  }

};
