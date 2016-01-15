(function () {
    "use strict";

    angular.module("app").service("stickFactory", ["appConfig", stickFactory]);

    function stickFactory(appConfig) {

        var api = {};

        var config = {
            geometry: new THREE.BoxGeometry(appConfig.objects.stick.height, appConfig.objects.stick.width, appConfig.objects.stick.length),
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