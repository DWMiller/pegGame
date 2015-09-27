var pegGame = angular.module('app', ['ui.router', 'launcherModule', 'gameModule']).run(function($rootScope) {
    'use strict';
    $rootScope.title = "Peg Game";
});
