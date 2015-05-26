function board() {

    var config = {
        geometry: new THREE.BoxGeometry(50, 1, 50),
        material: Physijs.createMaterial(
            new THREE.MeshBasicMaterial({
                // color: '#876334',
                map: THREE.ImageUtils.loadTexture('images/wood.jpg'),
            }),
            1,
            0
        ),
        mass: 0
    }

    function create() {
        var board = new Physijs.BoxMesh(config.geometry, config.material, config.mass);

        return board;
    }

    return create;
}


board = board();
