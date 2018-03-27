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
    this.entities.push(entity);
  }

  remove(entity) {
    let index = this.entities.indexOf(entity);
    if (index > -1) {
      console.log('removing entity:', entity.id);
      this.entities.splice(index, 1);
    }
  }

}

module.exports = EntityService;
