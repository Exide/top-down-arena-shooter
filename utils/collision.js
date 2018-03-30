exports.applyBounce = function (entity, edge) {
  // lifted from this SO answer:
  // https://stackoverflow.com/a/573206/157212

  let velocity = entity.getComponent('RigidBody').velocity;
  let friction = entity.getComponent('Material').friction;
  let elasticity = entity.getComponent('Material').elasticity;

  let v = velocity.clone();
  let n = edge.toLeftNormal().normalize();
  let u = n.multiplyScalar(v.dot(n));
  let w = v.subtract(u);

  // redirect the entity
  entity.getComponent('RigidBody').velocity = w.multiplyScalar(friction).subtract(u.multiplyScalar(elasticity));
};
