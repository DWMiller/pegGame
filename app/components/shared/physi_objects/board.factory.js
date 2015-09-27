(function() {
    "use strict";

    angular.module("app").service("boardFactory", [boardFactory]);

    function boardFactory() {

        var api = {};

        var config = {
            geometry: new THREE.BoxGeometry(25, 1, 25),
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