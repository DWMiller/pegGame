angular.module('gameModule').controller('gameController',

    function($scope) {
    	console.log('Game Controller ran');
        'use strict';

        var game = gameModule();
        
        $scope.play = function() {      
        	game.start();
            game.endRound();
            game.newRound();
        };
    }
);
