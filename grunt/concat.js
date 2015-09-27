module.exports = {
    js_libs: {
        src: [
            "bower_components/angular/angular.js",
            "bower_components/angular-ui-router/release/angular-ui-router.js",
            "bower_components/angular-animate/angular-animate.js",
            "bower_components/angular-translate/angular-translate.js",
            "bower_components/stats.js/build/stats.min.js",
            "bower_components/threejs/build/three.js",
            "bower_components/physijs/physi.js",
            'bower_components/jquery/dist/jquery.js',
            'bower_components/ionsound/js/ion.sound.js',
            'bower_components/countdown/countdown.js'
        ],
        dest: 'dist/js/libs.js'
    },
    js_app: {
        options: {
            sourceMap: true
        },
        src: [
            "app/**/*.module.js",
            "app/**/*.config.js",
            "app/**/*.controller.js",
            "app/**/*.js",
            "app/assets/**/*.js"
        ],
        dest: 'dist/js/app.js'
    }
};

