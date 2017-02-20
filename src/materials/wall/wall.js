const width = 0.58, height = 10, thickness = 0.01;

let initialized = false, geometry, material, mass, texture, loader;

let geometry1, geometry2, material1, material2;

function initialize(THREE, Physijs) {
  loader = new THREE.TextureLoader();
  texture = loader.load('assets/images/wood.jpg');

  // geometry = new THREE.BoxGeometry(width, height, thickness);

  geometry1 = new THREE.PlaneGeometry(width, height, thickness);
  geometry2 = new THREE.PlaneGeometry(width, height, thickness);
  geometry2.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI));

  material1 = Physijs.createMaterial(
    new THREE.MeshPhongMaterial({
      map: texture
    }),
    0.8, //friction
    0.3 //restitution
  );
  material2 = new THREE.MeshBasicMaterial({
    color: '#FFF',
    transparent: true,
    opacity: 0.1,
    emissive: '#FFF',
    specular: '#FFF',
    shininess: 100
  });

  // material = Physijs.createMaterial(
  //   new THREE.MeshPhongMaterial({
  //     side: THREE.DoubleSide,
  //     color: 0xff00ff
  //     // emissive: '#FFF',
  //     // specular: '#FFF',
  //     // shininess: 100,
  //     // metal: true,
  //     // transparent: true,
  //     // opacity: 0.1
  //   }),
  //   0, //friction
  //   0 //restitution
  // );
  mass = 0;
  initialized = true;
}

export default function(THREE, Physijs) {
  if (!initialized) {
    initialize(THREE, Physijs);
  }

  var innerWall = new Physijs.BoxMesh(geometry1, material1, mass);
  var outerWall = new Physijs.BoxMesh(geometry2, material2, mass);

  innerWall.add(outerWall);

  // outerWall.castShadow = false;
  // outerWall.receiveShadow = false;

  return innerWall;
}
