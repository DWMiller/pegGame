module.exports = {
    build: {
        options: {
            base: 'app/'
        },
        files: {
            'dist/index.html': ['app/components/**/*.template.html']
        }
    }
};