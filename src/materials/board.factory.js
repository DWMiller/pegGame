export default function boardFactory(THREE, Physijs) {
  var loader = new THREE.TextureLoader();
  var texture1 = loader.load('assets/images/wood.jpg');

  const mass = 0;
  const geometry = new THREE.BoxGeometry(25, 1, 25); //height, width, length
  const material = Physijs.createMaterial(
    new THREE.MeshBasicMaterial({
      // color: '#876334',
      map: texture1
    }),
    0.5,
    0
  );

  return {
    create() {
      var board = new Physijs.BoxMesh(geometry, material, mass);
      board.castShadow = false;
      board.receiveShadow = true;
      return board;
    }
  };
}
