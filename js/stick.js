function stick() {
    var height = 0.02,
        length = 6,
        width = 0.2;

    var config = {
        geometry: new THREE.BoxGeometry(height, width, length),
        material: Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                // color: '#3BC856',
                 map: THREE.ImageUtils.loadTexture('images/plywood.jpg'),
            }),
            0, //friction
            0 //restitution
        ),
        mass: 0
    }

    function create() {
        var stick = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
        // stick.castShadow = true;
        // stick.receiveShadow = true;
        return stick;
    }

    return create;
}


stick = stick();
