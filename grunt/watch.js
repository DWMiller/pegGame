module.exports = {
    js: {
        files: ['app/**/*.js'],
        tasks: ['build_js_app']
    },
    sass: {
        files: ['app/components/**/*.scss'],
        tasks: ['build_css']
    },
    copy: {
        files: ['app/assets/**/*'],
        tasks: ['build_assets']
    },
    html: {
        files: ['app/index.html', 'app/**/*.template.html'],
        tasks: ['build_html']
    },
    grunt: {
        files: ['grunt/**/*'],
        tasks: [],
        options: {
            spawn: false,
            reload: true
        }
    }
};
