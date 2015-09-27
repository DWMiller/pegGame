(function() {
    "use strict";

    angular.module("app").service("UtilitiesService", [UtilitiesService]);

    function UtilitiesService() {

        var api = {};

        api.posOrNeg = function posOrNeg() {
            'use strict';
            return Math.round(Math.random()) * 2 - 1;
        };

        return api;
    }
})();