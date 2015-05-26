function marble() {
    var config = {
        geometry: new THREE.IcosahedronGeometry(0.25, 1),
        material: Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                color: '#0332FD'
            }),
            0, //friction
            0.1 //restitution
        ),
        mass: 0.1
    }



    function create() {
        var marble = new Physijs.SphereMesh(config.geometry, config.material, config.mass);
        // Enable CCD if the object moves more than 1 meter in one simulation frame
        // marble.setCcdMotionThreshold(0.5);

        // Set the radius of the embedded sphere such that it is smaller than the object
        // marble.setCcdSweptSphereRadius(0.1);

        return marble;
    }

    return create;
}


marble = marble();
