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
    console.log(`${now()} | EntityService | adding entity: ${entity.type} (${entity.id})`);
    this.entities.push(entity);
  }

  remove(entity) {
    let index = this.entities.indexOf(entity);
    if (index > -1) {
      console.log(`${now()} | EntityService | removing entity: ${entity.type} (${entity.id})`);
      this.entities.splice(index, 1);
    }
  }

}

module.exports = EntityService;
