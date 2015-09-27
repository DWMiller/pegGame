(function() {
    "use strict";

    angular.module('gameModule').controller('gameController', ["$scope", "gameService", gameController]);

    function gameController($scope, gameService) {
        console.log('Game Controller ran');
        'use strict';

        $scope.play = function() {
            gameService.start();
            gameService.endRound();
            gameService.newRound();
        };
    }
})();

