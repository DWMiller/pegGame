module.exports = {
    dev: {
        files: {
            'dist/index.html': ['app/index.html']
        },
        options: {
            replacements: [{
                pattern: /{{ VERSION }}/g,
                replacement: ''
            }]
        }
    },
    prod: {
        files: {
            'dist/index.html': ['app/index.html']
        },
        options: {
            replacements: [{
                pattern: /{{ VERSION }}/g,
                replacement: '<%= grunt.pkg.version %>.min.'
            }]
        }
    }
}
