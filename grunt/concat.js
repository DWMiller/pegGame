module.exports = {
    js: {
        src: ["bower_components/stats.js/build/stats.min.js",
            "bower_components/threejs/build/three.js",
            "bower_components/physijs/physi.js",
            // "bower_components/three-orbit-controls/OrbitControls.js",
            "app/libs/js/*.js",
            "app/js/physi_objects/**/*.js",
            "app/js/util.js",
            "app/js/app.js",

        ],
        dest: 'dist/js/pre_babel.js',
    }

}
