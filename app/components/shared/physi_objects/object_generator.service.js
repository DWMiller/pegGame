(function() {
    "use strict";

    angular.module("app").service("objectGenerator", ["stickFactory", "boardFactory", "marbleFactory", "wallFactory", objectGenerator]);

    function objectGenerator(stickFactory, boardFactory, marbleFactory, wallFactory) {

        var factoryMap = {
            'stick': stickFactory,
            'board': boardFactory,
            'marble': marbleFactory,
            'wall': wallFactory
        };

        var api = {};

        api.create = function createObject(type) {
            return factoryMap[type].create();
        };

        return api;
    }

})();