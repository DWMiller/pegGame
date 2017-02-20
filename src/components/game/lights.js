export default THREE => ({
  initLights(scene) {
    var spotLight = new THREE.SpotLight(0xffaa88);
    spotLight.target.position.set(0, 0, 0);
    spotLight.shadowCameraNear = 0.01;
    spotLight.castShadow = true;
    spotLight.shadowDarkness = 0.15;
    spotLight.shadowCameraVisible = true;
    // console.dir(spotLight)
    // spotLight.shadowMapWidth = 1024;
    // spotLight.shadowMapHeight  = 1024;
    spotLight.position.x = 3;
    spotLight.position.y = 50;
    spotLight.position.z = 3;

    scene.add(spotLight);

    var spotLight2 = new THREE.SpotLight(0xffaa88);
    spotLight2.target.position.set(0, 0, 0);
    spotLight2.position.x = 3;
    spotLight2.position.y = 10;
    spotLight2.position.z = 3;
    // scene.add(spotLight2);

    var light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);
  }
});
