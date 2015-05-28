module.exports = {
    js: {
        files: ['app/js/**/*'],
        tasks: ['newer:jshint','newer:concat','version','babel']
    },
    // sass: {
    //     files: ['sass/**/*'],
    //     tasks: ['sass','version']
    // },
    copy: {
        files: ['app/index.html'],
        tasks: ['copy']
    },
    grunt: {
        files: ['grunt/**/*'],
        tasks: [],
        options: {
            spawn: false,
            reload: true
        }
    }
}
