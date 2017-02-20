const height = 0.02, width = 0.02, length = 2.5;

let initialized = false, geometry, material, mass,loader,texture;

function initialize(THREE, Physijs) {
  geometry = new THREE.BoxGeometry(height, width, length);

  loader = new THREE.TextureLoader();
  texture = loader.load('assets/images/plywood.jpg');

  material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({
      // color: '#3BC856',
      map: texture
    }),
    0.2, //friction
    0 //restitution
  );

  mass = 0;

  initialized = true;
}

export default function(THREE, Physijs) {
  if (!initialized) {
    initialize(THREE, Physijs);
  }

  var stick = new Physijs.BoxMesh(geometry, material, mass);
  stick.castShadow = true;
  stick.receiveShadow = true;
  return stick;
}
