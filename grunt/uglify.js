module.exports = {
    options: {
        compress: {
            drop_console: false //true
        }
    },
    dist: {
        files: {
            'dist/js/app.min.js': ['dist/js/app.js'],
        }
    }
}
