module.exports = {
    main: {
        files: [
            // includes files within path and its sub-directories
            {
                expand: true,
                flatten: true,
                src: ['app/index.html'],
                dest: 'dist/'
            }, {
                expand: true,
                flatten: true,
                src: ['bower_components/physijs/physijs_worker.js'],
                dest: 'dist/js/async/'
            }, {
                expand: true,
                flatten: true,
                src: ['bower_components/ammo.js/builds/ammo.js'],
                dest: 'dist/js/async/'
            }, {
                expand: true,
                flatten: true,                
                src: ['images/**'],
                dest: 'dist/images/'
            }
        ]
    }
}
