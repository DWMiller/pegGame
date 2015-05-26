function boundary() {

    var config = {
        geometry: new THREE.BoxGeometry(2.5, 0.25, 2.5),
        material: Physijs.createMaterial(
            new THREE.MeshBasicMaterial({
                color: '#E70E0E',
                transparent: true,
                opacity: 0.75,
            }),
            .6,
            .6
        ),
        mass: 0
    }

    function create() {
        var boundary = new Physijs.BoxMesh(config.geometry, config.material, config.mass);

        return boundary;
    }

    return create;
}


boundary = boundary();
