exports.applyBounce = function (entity, edge) {
  // lifted from this SO answer:
  // https://stackoverflow.com/a/573206/157212

  // todo: remove this migration code
  let velocity;
  try {
    velocity = entity.velocity;
    if (velocity === undefined) throw new TypeError();
  } catch (error) {
    velocity = entity.getComponent('RigidBody').velocity;
  }

  let v = velocity.clone();
  let n = edge.toLeftNormal().normalize();
  let u = n.multiplyScalar(v.dot(n));
  let w = v.subtract(u);

  // todo: remove this migration code
  let friction;
  try {
    friction = 0.7;
    if (friction === undefined) throw new TypeError();
  } catch (error) {
    friction = entity.getComponent('Material').friction;
  }

  // todo: remove this migration code
  let elasticity;
  try {
    elasticity = 0.7;
    if (elasticity === undefined) throw new TypeError();
  } catch (error) {
    elasticity = entity.getComponent('Material').elasticity;
  }

  // redirect the entity
  entity.velocity = w.multiplyScalar(friction).subtract(u.multiplyScalar(elasticity));
};
