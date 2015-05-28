function board() {
'use strict';
    var config = {
        geometry: new THREE.BoxGeometry(25, 1, 25),
        material: Physijs.createMaterial(
            new THREE.MeshBasicMaterial({
                // color: '#876334',
                map: THREE.ImageUtils.loadTexture('images/wood.jpg'),
            }),
            0.5,
            0
        ),
        mass: 0
    };

    function create() {
        var board = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
        board.castShadow = false;
        board.receiveShadow = true;
        return board;
    }

    return create;
}

var board = board();