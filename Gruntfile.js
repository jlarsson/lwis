module.exports = function (grunt) {


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            css: {
                src: [
                    'bower_components/bootstrap/dist/css/bootstrap.css',
                    'bower_components/dropzone/downloads/css/dropzone.css',
                    'public/css/styles.css'
                ],
                dest: 'dist/css/styles.css'
            },
            js: {
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/bootstrap/dist/js/bootstrap.js',
                    'bower_components/dropzone/downloads/dropzone.js',
                ],
                dest: 'dist/js/scripts.js'
            }
        },
        cssmin: {
            css: {
                files: {
                    'dist/css/styles.min.css': 'dist/css/styles.css'
                }
            }
        },
        uglify: {
            js: {
                options: {
                    sourceMap: true
                },
                files: {
                    'dist/js/scripts.min.js': 'dist/js/scripts.js'
                }
            }
        },
        copy: {
/*            css: {
                src: 'tmp/styles.min.css',
                dest: 'dist/styles.min.js'
            },
            js: {
                src: 'tmp/scripts.min.js',
                dest: 'dist/scripts.min.js'
            },*/
            bootstrapfonts: {
                expand: true,
                filter: 'isFile',
                cwd: 'bower_components/bootstrap/dist/fonts/',
                src: '*',
                dest: 'dist/fonts/'
            },
            dropzoneimages: {
                expand: true,
                filter: 'isFile',
                cwd: 'bower_components/dropzone/downloads/images/',
                src: '*',
                dest: 'dist/images/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', [
                    'concat:css',
                    'concat:js',
                    'cssmin:css',
                    'uglify:js',
                    //'copy:css',
                    //'copy:js',
                    'copy:bootstrapfonts',
                    'copy:dropzoneimages']);
    /*    
    // A very basic default task.
    grunt.registerTask('
                    default ', '
                    Log some stuff.
                    ', function () {
        grunt.log.write('
                    Logging some stuff...
                    ').ok();
    });
    */

};