(function () {
    "use strict";
    angular.module('app').constant("appConfig", {
        "objects": {
            board: {
                height: 25,
                width: 1,
                length: 25
            },
            marble: {},
            stick: {
                height: 0.02,
                width: 0.02,
                length: 2.5
            },
            wall: {}
        }
    })
})();

