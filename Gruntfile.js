module.exports = function (grunt) {


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            css: {
                src: [
                    'bower_components/bootstrap/dist/css/bootstrap.css',
                    //'public/css/bootswatch.slate.bootstrap.css',
                    'bower_components/fontawesome/css/font-awesome.css',
                    'bower_components/dropzone/downloads/css/dropzone.css',
                    'bower_components/rainbow/themes/github.css',
                    'bower_components/codemirror/lib/codemirror.css',
                    'public/css/styles.css'
                ],
                dest: 'dist/css/styles.css'
            },
            js: {
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/setimmediate2/setimmediate.js',
                    'bower_components/jquery-form/jquery.form.js',
                    'bower_components/bootstrap/dist/js/bootstrap.js',
                    'bower_components/dropzone/downloads/dropzone.js',
                    'bower_components/rainbow/js/rainbow.js',
                    'bower_components/rainbow/js/language/generic.js',
                    'bower_components/rainbow/js/language/javascript.js',
                    'bower_components/codemirror/lib/codemirror.js',
                    'bower_components/codemirror/mode/javascript/javascript.js',
                    'public/js/page.js',
                    'public/js/lazyimages.js'
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
            images: {
                expand: true,
                filter: 'isFile',
                cwd: 'public/images/',
                src: '*',
                dest: 'dist/images/'
            },
            bootstrapfonts: {
                expand: true,
                filter: 'isFile',
                cwd: 'bower_components/bootstrap/dist/fonts/',
                src: '*',
                dest: 'dist/fonts/'
            },
            fontawesomefonts: {
                expand: true,
                filter: 'isFile',
                cwd: 'bower_components/fontawesome/fonts/',
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

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', [
                    'concat:css',
                    'concat:js',
                    'cssmin:css',
                    'uglify:js',
                    'copy:images',
                    'copy:bootstrapfonts',
                    'copy:fontawesomefonts',
                    'copy:dropzoneimages']);
};
