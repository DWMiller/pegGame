let initialized = false, loader, texture, mass, geometry, material;

function initialize(THREE, Physijs) {
  loader = new THREE.TextureLoader();
  texture = loader.load('assets/images/wood.jpg');

  mass = 0;
  geometry = new THREE.BoxGeometry(25, 1, 25); //height, width, length
  material = Physijs.createMaterial(
    new THREE.MeshBasicMaterial({
      // color: '#876334',
      map: texture
    }),
    0.5,
    0
  );

  initialized = true;
}

export default function(THREE, Physijs) {
  if (!initialized) {
    initialize(THREE, Physijs);
  }

  const board = new Physijs.BoxMesh(geometry, material, mass);
  board.castShadow = false;
  board.receiveShadow = true;
  return board;
}
