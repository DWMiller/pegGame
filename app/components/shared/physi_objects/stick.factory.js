(function() {
    "use strict";

    angular.module("app").service("stickFactory", [stickFactory]);

    function stickFactory() {

        var api = {};

        var height = 0.02,
            length = 2.5,
            width = 0.02;
        //0.2;

        var config = {
            geometry: new THREE.BoxGeometry(height, width, length),
            material: Physijs.createMaterial(
                new THREE.MeshLambertMaterial({
                    // color: '#3BC856',
                    map: THREE.ImageUtils.loadTexture('assets/images/plywood.jpg'),
                }),
                0.2, //friction
                0 //restitution
            ),
            mass: 0
        };

        api.create = function createStick() {
            var stick = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
            stick.castShadow = true;
            stick.receiveShadow = true;
            return stick;
        };

        return api;
    }

})();