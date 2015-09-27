module.exports = function(grunt) {
    grunt.pkg = grunt.file.readJSON('package.json');
    // measures the time each task takes
    require('time-grunt')(grunt);

    // load grunt config
    require('load-grunt-config')(grunt);
};
