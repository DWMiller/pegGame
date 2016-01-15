(function () {
    "use strict";

    angular.module("app").service("boardFactory", ["appConfig", boardFactory]);

    function boardFactory(appConfig) {
        
        var api = {};

        var config = {
            geometry: new THREE.BoxGeometry(appConfig.objects.board.height, appConfig.objects.board.width, appConfig.objects.board.length),
            material: Physijs.createMaterial(
                new THREE.MeshBasicMaterial({
                    // color: '#876334',
                    map: THREE.ImageUtils.loadTexture('assets/images/wood.jpg'),
                }),
                0.5,
                0
            ),
            mass: 0
        };

        api.create = function createBoard() {
            var board = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
            board.castShadow = false;
            board.receiveShadow = true;
            return board;
        };

        return api;
    }

})();