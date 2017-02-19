export default function stickFactory(THREE, Physijs) {
  var api = {};

  const stickConfig = {
    height: 0.02,
    width: 0.02,
    length: 2.5
  };

  var config = {
    geometry: new THREE.BoxGeometry(
      stickConfig.height,
      stickConfig.width,
      stickConfig.length
    ),
    material: Physijs.createMaterial(
      new THREE.MeshLambertMaterial({
        // color: '#3BC856',
        map: THREE.ImageUtils.loadTexture('assets/images/plywood.jpg')
      }),
      0.2, //friction
      0 //restitution
    ),
    mass: 0
  };

  api.create = function createStick() {
    var stick = new Physijs.BoxMesh(
      config.geometry,
      config.material,
      config.mass
    );
    stick.castShadow = true;
    stick.receiveShadow = true;
    return stick;
  };

  return api;
}
