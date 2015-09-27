module.exports = {
    options: {
        compress: {
            drop_console: true
        }
    },
    dist: {
        files: {
            'dist/js/app.<%= grunt.pkg.version %>.min.js': ['dist/js/app.js'],
            'dist/js/libs.<%= grunt.pkg.version %>.min.js': ['dist/js/libs.js']
        }
    }
};
