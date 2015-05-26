function marble() {

    var materials = [];
    var colors = ['#0332FD', '#C30FDE', '#0DCE0D', '#F0FE11', '#33FAF3', '#ED0C0C', '#FF8A00','#9301FA','#000000','#FFF','#4A2E18'];

    populateColors();

    var friction = 0.2,
        restitution = 0.2,
        sides = 2,
        radius = 0.15;

    var config = {
        geometry: new THREE.IcosahedronGeometry(radius, sides),
        mass: 0.1
    }

    function populateColors() {
        for (var i = 0; i < colors.length; i++) {
            materials.push(Physijs.createMaterial(
                new THREE.MeshPhongMaterial({
                    color: colors[i],
                    // specular: colors[i],
                    shininess: 100,
                    // metal:true
                }),
                friction,
                restitution
            ));
        }
    }


    function create() {
        var marble = new Physijs.SphereMesh(config.geometry, materials[Math.floor(Math.random() * materials.length)], config.mass);

        var scale = Math.random() * 0.5 + 0.75;
        marble.scale.set(scale, scale, scale);

        // Enable CCD if the object moves more than 1 meter in one simulation frame
        // marble.setCcdMotionThreshold(0.5);

        // Set the radius of the embedded sphere such that it is smaller than the object
        // marble.setCcdSweptSphereRadius(0.1);
        marble.castShadow = true;
        marble.receiveShadow = true;
        return marble;
    }

    return create;
}


marble = marble();
