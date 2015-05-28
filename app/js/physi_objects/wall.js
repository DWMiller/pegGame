function wall() {
    'use strict';
    var width = 0.55,
        height = 75,
        thickness = 0.01;

    var config = {
        geometry: new THREE.BoxGeometry(width, height, thickness),
        material: Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: '#FFF',
                emissive: '#FFF',
                specular: '#FFF',
                // shininess: 100,
                // metal: true,
                transparent: true,
                opacity: 0.1,
            }),
            0, //friction
            0 //restitution
        ),
        mass: 0
    };

    function create() {
        var wall = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
        // wall.castShadow = false;
        // wall.receiveShadow = false;

        return wall;
    }

    return create;
}
var wall = wall();
