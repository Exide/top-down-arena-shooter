const uuid = require('uuid/v4');

class Component {

  constructor(type) {
    this.id = uuid();
    this.type = type;
    this.parent = undefined;
  }

  serialize() {
    return `${this.id},${this.type}`;
  }

  update(deltaTimeSeconds) {
    return false;
  }

}

module.exports = Component;
