let instance;

export default class EntityService {

  static get() {
    if (!instance) {
      instance = new EntityService();
    }
    return instance;
  }

  constructor() {
    this.entities = [];
    this.localPlayer = undefined;
  }

  add(data) {
    this.entities.push(data);
  }

  addArray(array) {
    array.forEach(data => this.add);
  }

  get(filter) {
    return this.entities.filter(filter);
  }

  getById(id) {
    return this.entities.find(e => e.id === id);
  }

  getLocalPlayer() {
    return this.entities.find(e => e.id === this.localPlayer);
  }

  removeById(id) {
    let entity = this.getById(id);
    let index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
      return entity;
    }
  }

  clear() {
    this.entities = [];
  }
  
  setLocalPlayer(id) {
    this.localPlayer = id;
  }
  
  getNearby(range) {
    let player = this.getLocalPlayer();
    let position = player.getPosition();
    return this.entities
      .filter(e => e.id !== this.localPlayer)
      .filter(e => {
        let horizontalDistance = position.x - e.getPosition().x;
        let verticalDistance = position.y - e.getPosition().y;
        let inHorizontalRange = -range <= horizontalDistance && horizontalDistance <= range;
        let inVerticalRange = -range <= verticalDistance && verticalDistance <= range;
        return inHorizontalRange && inVerticalRange;
      });
  }

  isLocalPlayer(entity) {
    return (entity.id === this.localPlayer);
  }

}
