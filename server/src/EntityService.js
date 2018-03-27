const moment = require('moment');

const now = () => {
  return moment().utc().toISOString();
};

let instance;

class EntityService {

  static get() {
    if (!instance) {
      instance = new EntityService();
    }
    return instance;
  }

  constructor() {
    this.entities = [];
  }

  add(entity) {
    // todo: remove migration code
    let type;
    try {
      type = Symbol.keyFor(entity.type);
      if (type === undefined) throw new TypeError();
    } catch (error) {
      type = entity.type;
    }
    console.log(`${now()} | EntityService | adding entity: ${type} (${entity.id})`);
    this.entities.push(entity);
  }

  remove(entity) {
    let index = this.entities.indexOf(entity);
    if (index > -1) {
      // todo: remove migration code
      let type;
      try {
        type = entity.type;
        if (type === undefined) throw new TypeError();
      } catch (error) {
        type = Symbol.keyFor(entity.type);
      }
      console.log(`${now()} | EntityService | removing entity: ${type} (${entity.id})`);
      this.entities.splice(index, 1);
    }
  }

}

module.exports = EntityService;
