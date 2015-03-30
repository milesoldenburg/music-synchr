'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.company %> <%= pkg.author.name %> <%= pkg.author.email %> */\n',
        bower : {
            install : {
                options : {
                    targetDir : './public',
                    verbose : true
                }
            }
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc : '.jshintrc',
                    node : true
                },
                src : 'Gruntfile.js'
            },
            lib: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['lib/**/*.js']
            }
        },
        less: {
            main: {
                options: {
                    paths: ["./public/less"]
                },
                files: {
                    "./public/css/styles.css": "./public/less/styles.less"
                }
            }
        },
        watch: {
            less: {
                files: './public/less/styles.less',
                tasks: ['less']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task.
    grunt.registerTask('default', [
        'bower',
        'jshint',
        'less'
    ]);

};
