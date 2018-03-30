const uuid = require('uuid/v4');
const Component = require('./Component');
const EntityService = require('./EntityService');
const NetworkService = require('./NetworkService');

class Entity {

  /**
   * @param {string} type
   */
  constructor(type) {
    if (!type || !(typeof type === 'string'))
      throw TypeError('You must provide a type string');

    this.id = uuid();
    this.type = type;
    this.components = [];
  }

  update(deltaTimeSeconds) {
    this.hasChanged = false;
    for (let i = 0; i < this.components.length; ++i) {
      let componentChanged = this.components[i].update(deltaTimeSeconds);
      if (componentChanged && !this.hasChanged) {
        this.hasChanged = true;
      }
    }
  }

  destroy() {
    this.markedForDestruction = true;
    this.components = [];
    EntityService.get().remove(this);
    NetworkService.get().broadcast(`remove|${this.id}`);
  }

  serialize() {
    // todo: serialize and return all components
    let transform = this.getComponent('Transform');
    let boundingBox = this.getComponent('BoundingBox');
    return `${this.id},${this.type},${transform.position.x},${transform.position.y},${transform.rotation},${boundingBox.width},${boundingBox.height}`;
  }

  /**
   * @param {Component} component
   */
  addComponent(component) {
    if (!component || !(component instanceof Component))
      throw TypeError('You must provide a Component');

    component.parent = this;
    this.components.push(component);
  }

  /**
   * Takes a type string and returns the first component that matches.
   *
   * @param {string} type
   * @returns {Component}
   */
  getComponent(type) {
    let matches = this.getComponents(type);
    if (matches.length > 0) {
      return matches[0];
    } else {
      return null;
    }
  }

  /**
   * Takes a type string and returns all the components that match.
   *
   * @param {string} type
   * @returns {Component[]}
   */
  getComponents(type) {
    return this.components.filter(c => c.type.toLowerCase() === type.toLowerCase());
  }

  /**
   * @param {Component} component
   */
  removeComponent(component) {
    if (!component || !(component instanceof Component))
      throw TypeError('You must provide a Component');

    let index = this.components.indexOf(component);
    if (index !== -1) {
      let c = this.components.splice(index, 1);
      c.parent = undefined;
    }
  }

}

module.exports = Entity;
