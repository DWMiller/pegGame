function wall() {
    var width = 3,
        height = 10,
        thickness = 0.1;

        var config = {
            geometry: new THREE.BoxGeometry(width, height, thickness),
            material: Physijs.createMaterial(
                new THREE.MeshBasicMaterial({
                    color: '#FFF',
                    // side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2,
                    wireframe: false,
                }),
                0, //friction
                0 //restitution
            ),
            mass: 0
        }

    function create() {
        var wall = new Physijs.BoxMesh(config.geometry, config.material, config.mass);


        return wall;
    }

    return create;
}


wall = wall();
