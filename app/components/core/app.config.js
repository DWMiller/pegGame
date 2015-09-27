(function() {
    "use strict";
    angular.module('app').config(['$stateProvider', '$urlRouterProvider', appConfig]);

    function appConfig($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/");

        $stateProvider.state("default", {
            url: "/",
            templateUrl: "components/launcher/launcher.template.html",
            controller: "launcherController"
        });

        $stateProvider.state("game", {
            url: "/game",
            templateUrl: "components/game/game.template.html",
            controller: "gameController"
        });
    }
})();

